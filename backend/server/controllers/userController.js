const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Configure OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper function to convert relative URLs to full URLs
const getFullImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, convert to full URL
  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${imagePath}`;
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email and explicitly select password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('No account found with this email. Please sign up.');
  }

  // Check if user has a password (not a Google-only user)
  if (!user.password) {
    res.status(401);
    throw new Error('This account was created with Google. Please sign in with Google.');
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid password');
  }

  res.json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    token: generateToken(user._id),
  });
});

// @desc    Google OAuth login/register
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, googleId, profilePicture } = req.body;

    // Validate required fields
    if (!email || !googleId) {
      res.status(400);
      throw new Error('Missing required Google authentication data');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user's Google information
      user.googleId = googleId;
      user.firstName = user.firstName || firstName;
      user.lastName = user.lastName || lastName;
      user.profilePicture = profilePicture || user.profilePicture;
      await user.save();
    } else {
      // Validate names before creating new user
      if (!firstName || !lastName) {
        res.status(400);
        throw new Error('First name and last name are required');
      }

      // Create new user with Google info
      user = await User.create({
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        email,
        googleId,
        profilePicture,
      });
    }

    if (!user) {
      res.status(500);
      throw new Error('Failed to create or update user account');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: getFullImageUrl(user.profilePicture, req),
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(error.status || 500);
    throw new Error(error.message || 'Failed to authenticate with Google');
  }
});

// @desc    Google OAuth callback
// @route   GET /api/users/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Missing+authorization+code`);
  }
  
  try {
    // Get token from Google
    const { tokens } = await oauth2Client.getToken(code);
    
    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      user = await User.create({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        googleId: payload.sub,
        profilePicture: payload.picture
      });
    } else if (!user.googleId) {
      // Update existing user with Google info
      user.googleId = payload.sub;
      user.profilePicture = user.profilePicture || payload.picture;
      await user.save();
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    return res.redirect(`${process.env.FRONTEND_URL}/google-auth-success?token=${token}&userId=${user._id}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&email=${encodeURIComponent(user.email)}&profilePicture=${encodeURIComponent(user.profilePicture)}`);
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication+failed&details=${encodeURIComponent(error.message)}`);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profilePicture: getFullImageUrl(user.profilePicture, req),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { firstName, lastName, email, phone, profilePicture } = req.body;

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  // Update user fields
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.profilePicture = profilePicture || user.profilePicture;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profilePicture: getFullImageUrl(updatedUser.profilePicture, req),
  });
});

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Get the base URL for the backend
  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  
  // Create full URL for the uploaded file
  const profilePictureUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
  
  user.profilePicture = profilePictureUrl;
  const updatedUser = await user.save();

  res.json({
    profilePictureUrl: updatedUser.profilePicture,
    message: 'Profile picture uploaded successfully'
  });
});

// @desc    Remove profile picture
// @route   DELETE /api/users/remove-profile-picture
// @access  Private
const removeProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Reset to default avatar
  user.profilePicture = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`;
  
  const updatedUser = await user.save();

  res.json({
    profilePictureUrl: updatedUser.profilePicture,
    message: 'Profile picture removed successfully'
  });
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has a password (not a Google-only user)
  if (!user.password) {
    res.status(400);
    throw new Error('Cannot change password for Google-authenticated accounts');
  }

  // Verify current password
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    message: 'Password updated successfully'
  });
});

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
};