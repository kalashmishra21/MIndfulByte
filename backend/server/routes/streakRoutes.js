const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateStreak,
  getStreakInfo
} = require('../controllers/streakController');

router.put('/update', protect, updateStreak);
router.get('/', protect, getStreakInfo);

module.exports = router;
