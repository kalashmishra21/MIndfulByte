const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
async function unusedPort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}
test('server stays live and reports database outage instead of delaying startup', async t => {
  const port = await unusedPort();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), JWT_SECRET: 'test-secret-only', MONGO_URI: 'mongodb://127.0.0.1:1/no_database' },
    stdio: 'ignore',
  });
  t.after(() => { if (!child.killed) child.kill('SIGTERM'); });
  let response;
  const deadline = Date.now() + 2500;
  while (!response && Date.now() < deadline) {
    try { response = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(300) }); }
    catch { await new Promise(resolve => setTimeout(resolve, 50)); }
  }
  assert.ok(response, 'HTTP server should start before MongoDB connects');
  assert.equal(response.status, 200);
  const readiness = await fetch(`http://127.0.0.1:${port}/ready`);
  assert.equal(readiness.status, 503);
  const started = Date.now();
  const login = await fetch(`http://127.0.0.1:${port}/api/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'test' }),
  });
  assert.equal(login.status, 503);
  assert.ok(Date.now() - started < 500, 'unavailable database should not leave login hanging');
});
