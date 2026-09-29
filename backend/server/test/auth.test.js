const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.JWT_SECRET = 'test-only-secret-not-for-production';
process.env.GOOGLE_CLIENT_ID = 'test-google-client';
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const app = require('../server');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('health stays available and disconnected database fails promptly', async () => {
  assert.equal((await fetch(base + '/health')).status, 200);
  assert.equal((await fetch(base + '/ready')).status, 503);
  const start = Date.now();
  assert.equal((await post('/api/users/login', { email: 'test@example.com', password: 'test' })).status, 503);
  assert.ok(Date.now() - start < 1000);
});
test('login validates input, normalizes email and checks password', async () => {
  mongoose.connection.readyState = 1;
  const original = User.findOne;
  let queriedEmail;
  User.findOne = query => {
    queriedEmail = query.email;
    return { select: async () => ({ _id: '0123456789abcdef01234567', email: query.email, password: 'hash', matchPassword: async value => value === 'correct' }) };
  };
  try {
    assert.equal((await post('/api/users/login', { email: { $ne: null }, password: 'correct' })).status, 400);
    assert.equal((await post('/api/users/login', { email: ' USER@EXAMPLE.COM ', password: 'wrong' })).status, 401);
    const response = await post('/api/users/login', { email: ' USER@EXAMPLE.COM ', password: 'correct' });
    assert.equal(response.status, 200);
    assert.equal(queriedEmail, 'user@example.com');
    assert.ok((await response.json()).token);
  } finally { User.findOne = original; mongoose.connection.readyState = 0; }
});
test('Google auth rejects forged profile data and invalid ID tokens', async () => {
  mongoose.connection.readyState = 1;
  const original = OAuth2Client.prototype.verifyIdToken;
  OAuth2Client.prototype.verifyIdToken = async () => { throw new Error('bad token'); };
  try {
    assert.equal((await post('/api/users/google', { email: 'victim@gmail.com', googleId: 'forged' })).status, 400);
    assert.equal((await post('/api/users/google', { credential: 'fake' })).status, 401);
  } finally { OAuth2Client.prototype.verifyIdToken = original; mongoose.connection.readyState = 0; }
});
test('verified Google identity supports missing family name and ignores client profile data', async () => {
  mongoose.connection.readyState = 1;
  const verify = OAuth2Client.prototype.verifyIdToken, find = User.findOne, create = User.create;
  let created;
  OAuth2Client.prototype.verifyIdToken = async args => {
    assert.equal(args.audience, 'test-google-client');
    return { getPayload: () => ({ sub: 'verified-id', email: 'real@gmail.com', email_verified: true, given_name: 'Real' }) };
  };
  User.findOne = async () => null;
  User.create = async data => { created = data; return { ...data, _id: '0123456789abcdef01234567' }; };
  try {
    const response = await post('/api/users/google', { credential: 'verified-test-token', email: 'forged@gmail.com' });
    assert.equal(response.status, 200);
    assert.equal(created.email, 'real@gmail.com');
    assert.equal(created.lastName, '');
    assert.equal(created.googleId, 'verified-id');
  } finally { OAuth2Client.prototype.verifyIdToken = verify; User.findOne = find; User.create = create; mongoose.connection.readyState = 0; }
});
test('Google email must be verified', async () => {
  mongoose.connection.readyState = 1;
  const original = OAuth2Client.prototype.verifyIdToken;
  OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => ({ sub: 'id', email: 'test@gmail.com', email_verified: false }) });
  try { assert.equal((await post('/api/users/google', { credential: 'token' })).status, 401); }
  finally { OAuth2Client.prototype.verifyIdToken = original; mongoose.connection.readyState = 0; }
});
test('CORS rejects unknown origins but allows configured frontend', async () => {
  assert.equal((await fetch(base + '/health', { headers: { Origin: 'https://evil.example' } })).status, 403);
  const response = await fetch(base + '/health', { headers: { Origin: 'https://mindfulbyte-frontend.onrender.com' } });
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://mindfulbyte-frontend.onrender.com');
});
