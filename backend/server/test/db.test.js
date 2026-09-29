const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
test('database options are accepted and unreachable database fails within startup deadline', async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:1/mindfulbyte_test';
  const start = Date.now();
  try {
    await assert.rejects(connectDB(), error => {
      assert.equal(error.name, 'MongooseServerSelectionError');
      return true;
    });
    assert.ok(Date.now() - start < 7000);
  } finally { await mongoose.disconnect(); }
});
