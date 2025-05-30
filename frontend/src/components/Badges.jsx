import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import * as FaIcons from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './Badges.css';

import { BADGE_TYPES, BADGE_INFO } from '../utils/constants';

const badgeInfo = {
  [BADGE_TYPES.WEEK_STREAK]: {
    icon: <FaIcons.FaMedal className="badge-icon bronze" />,
    title: BADGE_INFO[BADGE_TYPES.WEEK_STREAK].label,
    description: BADGE_INFO[BADGE_TYPES.WEEK_STREAK].description
  },
  [BADGE_TYPES.BIWEEK_STREAK]: {
    icon: <FaIcons.FaMedal className="badge-icon silver" />,
    title: BADGE_INFO[BADGE_TYPES.BIWEEK_STREAK].label,
    description: BADGE_INFO[BADGE_TYPES.BIWEEK_STREAK].description
  },
  [BADGE_TYPES.MONTH_STREAK]: {
    icon: <FaIcons.FaMedal className="badge-icon gold" />,
    title: BADGE_INFO[BADGE_TYPES.MONTH_STREAK].label,
    description: BADGE_INFO[BADGE_TYPES.MONTH_STREAK].description
  }
};

const Badges = () => {
  const { user } = useContext(AuthContext);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.get(getApiUrl(ENDPOINTS.STREAKS), config);
        setStreakData(response.data.data);
      } catch (error) {
        console.error('Error fetching streak data:', error);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStreakData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  if (loading) return <div className="badges-loading">Loading badges...</div>;
  if (error) return <div className="badges-error">{error}</div>;

  return (
    <div className="badges-container">
      <div className="badges-header">
        <h2>Your Badges</h2>      <div className="streak-stats">          <div className="streak-stat current">
            <div className="streak-tooltip">
              Answer one byte every day to maintain your streak. Streaks start at 1 when you answer today's byte!
            </div>
            <div className="streak-icon-wrapper">
              <FaIcons.FaFire className={`streak-flame ${streakData?.currentStreak > 0 ? 'active' : ''}`} />
            </div>
            <div className="streak-info">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">
                {streakData?.currentStreak || 0}
                <span className="stat-unit">days</span>
              </span>
            </div>
          </div>
          <div className="streak-stat longest">
            <div className="streak-tooltip">
              Your highest consecutive daily streak. Keep answering bytes to beat your record!
            </div>
            <div className="streak-icon-wrapper">
              <FaIcons.FaTrophy className="streak-trophy" />
            </div>
            <div className="streak-info">
              <span className="stat-label">Longest Streak</span>
              <span className="stat-value">
                {streakData?.maxStreak || 0}
                <span className="stat-unit">days</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="badges-grid">
        {Object.entries(badgeInfo).map(([type, info]) => {
          const earned = streakData?.badges?.some(badge => badge.type === type);
          const badgeClass = earned ? 'badge earned' : 'badge locked';
          
          return (
            <div key={type} className={badgeClass}>
              <div className="badge-icon-wrapper">
                {info.icon}
                {!earned && <FaIcons.FaLock className="lock-icon" />}
              </div>
              <h3>{info.title}</h3>
              <p>{info.description}</p>
              {earned && (
                <span className="earned-date">
                  Earned: {new Date(streakData.badges.find(b => b.type === type).earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Badges;
