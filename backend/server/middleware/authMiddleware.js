const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if JWT_SECRET is available
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        res.status(500);
        throw new Error('Server configuration error');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      console.log('User authenticated successfully:', user.email);
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Not authorized, invalid token');
      } else if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Not authorized, token expired');
      } else if (error.message === 'Server configuration error') {
        // Re-throw server errors as 500
        throw error;
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect }; 