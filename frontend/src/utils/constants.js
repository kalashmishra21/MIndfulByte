export const BADGE_TYPES = {
  WEEK_STREAK: 'week-streak',
  BIWEEK_STREAK: 'biweek-streak',
  MONTH_STREAK: 'month-streak'
};

export const BADGE_INFO = {
  [BADGE_TYPES.WEEK_STREAK]: {
    label: '7-Day Streak',
    description: 'Successfully maintained a 7-day streak',
    threshold: 7
  },
  [BADGE_TYPES.BIWEEK_STREAK]: {
    label: '15-Day Streak',
    description: 'Successfully maintained a 15-day streak',
    threshold: 15
  },
  [BADGE_TYPES.MONTH_STREAK]: {
    label: '30-Day Streak',
    description: 'Successfully maintained a 30-day streak',
    threshold: 30
  }
};
