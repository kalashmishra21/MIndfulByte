require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const origins = [
  'http://localhost:5173', 'http://localhost:3000',
  'https://mindfulbyte-frontend.onrender.com',
  ...(process.env.FRONTEND_URL || '').split(','),
].filter(Boolean).map(value => value.trim().replace(/\/$/, ''));
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed');
    error.status = 403;
    callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.json({ message: 'Welcome to DailyByte API', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'database unavailable' });
});
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.set('Retry-After', '5');
    return res.status(503).json({ message: 'Database temporarily unavailable. Please retry shortly.' });
  }
  next();
});
app.use('/api/byte', require('./routes/byteRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/streaks', require('./routes/streakRoutes'));
app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));
const wait = milliseconds => new Promise(resolve => {
  const timer = setTimeout(resolve, milliseconds);
  timer.unref();
});
let shuttingDown = false;
async function keepDatabaseConnected() {
  let retryDelay = 1000;
  while (!shuttingDown) {
    try {
      await connectDB();
      return;
    } catch (error) {
      // Keep liveness endpoints available while Atlas/DNS recovers. API routes
      // return 503 until MongoDB is connected instead of hanging or crashing.
      if (shuttingDown) break;
      console.error(`MongoDB connection unavailable (${error.code || error.name || 'connection error'}); retrying in ${Math.round(retryDelay / 1000)}s`);
      await wait(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }
}
function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  const server = app.listen(process.env.PORT || 5001, '0.0.0.0', () => {
    console.log('API listening; database readiness is reported by /ready');
    keepDatabaseConnected();
  });
  const shutdown = () => {
    shuttingDown = true;
    server.close(() => mongoose.disconnect().catch(() => {}));
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return server;
}
if (require.main === module) start();
module.exports = app;
