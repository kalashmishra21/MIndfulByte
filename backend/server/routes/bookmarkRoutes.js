const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  isBookmarked
} = require('../controllers/bookmarkController');

// Bookmark routes
router.post('/', protect, addBookmark);
router.delete('/:byteId', protect, removeBookmark);
router.get('/', protect, getUserBookmarks);
router.get('/:byteId/check', protect, isBookmarked);

module.exports = router;
