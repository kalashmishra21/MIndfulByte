const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
test('Vercel frontend has no legacy secret aliases and preserves static assets', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(!Object.values(config.env || {}).some(value => String(value).startsWith('@')));
  assert.equal(config.routes[0].handle, 'filesystem');
  assert.equal(config.outputDirectory, 'frontend/dist');
});
test('Vercel backend config does not contain database or signing credentials', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'backend/server/vercel.json'), 'utf8'));
  assert.equal(config.env.MONGO_URI, undefined);
  assert.equal(config.env.JWT_SECRET, undefined);
});
