exports.BADGE_TYPES = {
  WEEK_STREAK: 'week-streak',
  BIWEEK_STREAK: 'biweek-streak',
  MONTH_STREAK: 'month-streak'
};

exports.STREAK_THRESHOLDS = {
  WEEK: 7,
  BIWEEK: 15,
  MONTH: 30
};

exports.BADGE_INFO = {
  'week-streak': {
    label: '7-Day Streak',
    description: 'Successfully completed daily bytes for 7 consecutive days',
    threshold: 7
  },
  'biweek-streak': {
    label: '15-Day Streak',
    description: 'Successfully completed daily bytes for 15 consecutive days',
    threshold: 15
  },
  'month-streak': {
    label: '30-Day Streak',
    description: 'Successfully completed daily bytes for 30 consecutive days',
    threshold: 30
  }
};
