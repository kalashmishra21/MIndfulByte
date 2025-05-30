const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// JWT Strategy for token authentication
const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  try {
    // Find the user by ID from the JWT payload
    const user = await User.findById(payload.id);

    if (user) {
      // If user exists, return the user
      return done(null, user);
    }
    
    // If user doesn't exist, return false
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

// Google OAuth Strategy
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    scope: ['profile', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // If user exists but was registered with email/password
        if (!user.googleId) {
          // Update user with Google ID
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // If user doesn't exist, create a new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        password: '', // No password for Google auth
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

// Initialize passport strategies
module.exports = () => {
  passport.use(jwtStrategy);
  
  // Only use Google strategy if Google credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(googleStrategy);
  }

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
