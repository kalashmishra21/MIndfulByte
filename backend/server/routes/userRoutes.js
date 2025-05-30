const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword,
} = require('../controllers/userController');
const { validateUserRegistration } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register and login routes
router.post('/', validateUserRegistration, registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/remove-profile-picture', protect, removeProfilePicture);
router.put('/change-password', protect, changePassword);

module.exports = router; 