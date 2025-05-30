const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const byteRoutes = require('./routes/byteRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Configure CORS to allow both local and production origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'https://mindfulbyte-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Logger middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const bookmarkRoutes = require('./routes/bookmarkRoutes');
const streakRoutes = require('./routes/streakRoutes');

// Routes
app.use('/api/byte', byteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/streaks', streakRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DailyByte API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Verify Google OAuth credentials
const verifyGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!clientId || clientId === 'your_client_id_here') {
    console.error('ERROR: GOOGLE_CLIENT_ID environment variable is not set properly');
    process.exit(1);
  }

  if (!clientSecret || clientSecret === 'your_client_secret_here') {
    console.error('ERROR: GOOGLE_CLIENT_SECRET environment variable is not set properly');
    process.exit(1);
  }

  // Configure OAuth client
  const oauth2Client = new OAuth2Client(
    clientId,
    clientSecret,
    `${backendUrl}/api/users/google/callback`
  );

  return {
    oauth2Client,
    clientId,
    clientSecret,
    backendUrl,
    frontendUrl
  };
};

// Run verification
const googleConfig = verifyGoogleCredentials();
global.oauth2Client = googleConfig.oauth2Client;

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
module.exports = app