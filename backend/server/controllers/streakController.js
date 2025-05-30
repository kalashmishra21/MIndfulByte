const Streak = require('../models/Streak');
const asyncHandler = require('express-async-handler');
const { BADGE_TYPES } = require('../utils/constants');

// Helper to check and award badges based on streak
const checkAndAwardBadges = async (streak) => {
  const currentStreak = streak.currentStreak;
  const existingBadges = new Set(streak.badges.map(b => b.type));
  const newBadges = [];

  // Check for each badge type
  if (currentStreak >= 30 && !existingBadges.has(BADGE_TYPES.MONTH_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.MONTH_STREAK });
  }
  if (currentStreak >= 15 && !existingBadges.has(BADGE_TYPES.BIWEEK_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.BIWEEK_STREAK });
  }
  if (currentStreak >= 7 && !existingBadges.has(BADGE_TYPES.WEEK_STREAK)) {
    newBadges.push({ type: BADGE_TYPES.WEEK_STREAK });
  }

  if (newBadges.length > 0) {
    streak.badges.push(...newBadges);
    await streak.save();
  }

  return newBadges;
};

// Update user's streak
exports.updateStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log('StreakController: Updating streak for user:', userId);
  
  let streak = await Streak.findOne({ user: userId });
  
  // Use UTC dates to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log('StreakController: Today date (local):', today);
  console.log('StreakController: Current time:', now);
  
  if (!streak) {
    console.log('StreakController: No existing streak, creating new one');
    streak = await Streak.create({
      user: userId,
      currentStreak: 1, // Start with 1 since user just answered
      maxStreak: 1,
      lastSolvedDate: today,
      badges: []
    });
    console.log('StreakController: Created new streak:', streak);
  } else {
    console.log('StreakController: Found existing streak:', streak);
    console.log('StreakController: Existing lastSolvedDate:', streak.lastSolvedDate);
    
    // Convert lastSolvedDate to local date for comparison
    const lastSolvedDate = streak.lastSolvedDate ? new Date(streak.lastSolvedDate) : null;
    const lastSolved = lastSolvedDate ? new Date(lastSolvedDate.getFullYear(), lastSolvedDate.getMonth(), lastSolvedDate.getDate()) : null;
    
    console.log('StreakController: Last solved date (normalized):', lastSolved);
    
    let diffDays = 0;
    if (lastSolved) {
      diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));
    } else {
      diffDays = 1; // Treat null as yesterday
    }
    
    console.log('StreakController: Days difference:', diffDays);
    
    if (diffDays === 0) {
      // Already solved today - return current streak without error
      console.log('StreakController: Already solved today, returning current streak');
      res.status(200).json({
        success: true,
        data: {
          currentStreak: streak.currentStreak,
          maxStreak: streak.maxStreak,
          lastSolvedDate: streak.lastSolvedDate,
          badges: streak.badges,
          newBadges: [],
          message: 'Streak already updated for today'
        }
      });
      return;
    } else if (diffDays === 1) {
      // Consecutive day
      console.log('StreakController: Consecutive day, incrementing streak from', streak.currentStreak, 'to', streak.currentStreak + 1);
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.maxStreak) {
        streak.maxStreak = streak.currentStreak;
      }
    } else {
      // Streak broken - reset to 1
      console.log('StreakController: Streak broken (diffDays:', diffDays, '), resetting to 1');
      streak.currentStreak = 1;
    }
    
    streak.lastSolvedDate = today;
    console.log('StreakController: Saving updated streak:', {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastSolvedDate: streak.lastSolvedDate
    });
    await streak.save();
  }

  // Check and award any new badges
  const newBadges = await checkAndAwardBadges(streak);
  console.log('StreakController: New badges awarded:', newBadges);

  const responseData = {
    currentStreak: streak.currentStreak,
    maxStreak: streak.maxStreak,
    lastSolvedDate: streak.lastSolvedDate,
    badges: streak.badges,
    newBadges
  };
  
  console.log('StreakController: Sending response:', responseData);
  res.status(200).json({
    success: true,
    data: responseData
  });
});

// Get user's streak info
exports.getStreakInfo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  let streak = await Streak.findOne({ user: userId });
  
  if (!streak) {
    res.json({
      success: true,
      data: {
        currentStreak: 0,
        maxStreak: 0,
        badges: []
      }
    });
    return;
  }

  // Check if streak is broken due to missing yesterday's byte
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSolved = new Date(streak.lastSolvedDate);
  lastSolved.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    streak.currentStreak = 0;
    await streak.save();
  }

  res.json({
    success: true,
    data: {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastSolvedDate: streak.lastSolvedDate,
      badges: streak.badges
    }
  });
});
