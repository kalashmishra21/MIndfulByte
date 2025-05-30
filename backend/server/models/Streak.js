const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  maxStreak: {
    type: Number,
    default: 0
  },
  lastSolvedDate: {
    type: Date
  },
  badges: [{
    type: {
      type: String,
      enum: ['week-streak', 'biweek-streak', 'month-streak'],
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Streak = mongoose.model('Streak', streakSchema);

module.exports = Streak;
