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
async function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  await connectDB();
  return app.listen(process.env.PORT || 5001, '0.0.0.0', () => console.log('API listening'));
}
if (require.main === module) {
  start().catch(() => {
    console.error('Startup failed. Check database connectivity, MONGO_URI and JWT_SECRET.');
    process.exit(1);
  });
}
module.exports = app;
