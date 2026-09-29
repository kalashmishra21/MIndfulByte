const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client();

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
  const { firstName, lastName, password } = req.body;
  const email = req.body.email.trim().toLowerCase();

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
  const { password } = req.body;
  if (typeof req.body.email !== 'string' || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const email = req.body.email.trim().toLowerCase();

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
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google sign-in is not configured. Use email and password.' });
  }
  if (typeof req.body.credential !== 'string' || !req.body.credential) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }
  let payload;
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired Google credential. Please sign in again.' });
  }
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    return res.status(401).json({ message: 'A verified Google email is required' });
  }
  const email = payload.email.trim().toLowerCase();
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) {
    user = await User.findOne({ email });
    if (user && (user.googleId || (!email.endsWith('@gmail.com') && !payload.hd))) {
      return res.status(409).json({ message: 'Use your existing sign-in method for this account.' });
    }
    if (user) {
      user.googleId = payload.sub;
      user.profilePicture = user.profilePicture || payload.picture;
      await user.save();
    } else {
      user = await User.create({
        email, googleId: payload.sub,
        firstName: (payload.given_name || payload.name || email.split('@')[0]).slice(0, 25),
        lastName: (payload.family_name || '').slice(0, 25),
        profilePicture: payload.picture,
      });
    }
  }
  res.json({
    _id: user._id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, profilePicture: getFullImageUrl(user.profilePicture, req),
    token: generateToken(user._id),
  });
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
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
};