import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StreakContext from '../context/StreakContext';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { streak } = useContext(StreakContext);
  const { isDark, toggleTheme } = useTheme();
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const prevStreakRef = useRef(streak.currentStreak);

  const getStreakMessage = (days) => {
    if (days === 0) return "Start your streak!";
    if (days === 1) return "Great start!";
    if (days < 7) return `${days} days strong!`;
    if (days < 30) return `${days} days amazing!`;
    return `${days} days incredible!`;
  };

  // Check for new badges on component mount
  useEffect(() => {
    if (!user?.token) return;
    
    const checkBadges = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.get(getApiUrl(ENDPOINTS.STREAKS), config);
        const newStreakData = response.data.data;
        
        // Check for new badges
        if (newStreakData.badges?.length > streak.badges?.length) {
          const newBadgeEarned = newStreakData.badges[newStreakData.badges.length - 1];
          setNewBadge(newBadgeEarned);
          setShowBadgeNotification(true);
          setTimeout(() => setShowBadgeNotification(false), 5000);
        }
      } catch (error) {
        console.error('Error checking badges:', error);
      }
    };
    
    checkBadges();
  }, [user?.token, streak.badges?.length]);  // Add proper dependencies

  // Handle streak button click - navigate to badges page
  const handleStreakClick = () => {
    navigate('/badges');
  };

  // Extract username from email (part before @)
  const getDisplayName = (user) => {
    if (!user) return 'User';
    
    if ((!user.firstName || user.firstName === 'Google' || user.firstName === 'John') && user.email) {
      const emailParts = user.email.split('@');
      return emailParts[0];
    }
    
    return user.firstName;
  };
  
  // Get first character for avatar
  const getInitial = (user) => {
    if (!user) return 'U';
    
    if ((!user.firstName || user.firstName === 'Google' || user.firstName === 'John') && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return user.firstName?.charAt(0) || 'U';
  };
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  // Handle dropdown toggle
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dropdown toggled, current state:', dropdownOpen);
    setDropdownOpen(prev => !prev);
  };
  
  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Handle profile navigation
  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header className="header">
      {showBadgeNotification && newBadge && (
        <div className="badge-notification">
          <FaIcons.FaMedal className="badge-icon" />
          <span>New Badge Earned: {newBadge.type === 'week-streak' ? '7-Day' : 
            newBadge.type === 'biweek-streak' ? '15-Day' : '30-Day'} Streak!</span>
        </div>
      )}
      
      <div className="header-left">
        <Link to="/" className="logo">
          <BiIcons.BiCalendarCheck className="logo-icon" />
          <h1>DailyByte</h1>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            <BiIcons.BiHomeAlt />
            <span>Home</span>
          </Link>
          
          <Link to="/all-bytes" className="nav-link">
            <BiIcons.BiCollection />
            <span>All Bytes</span>
          </Link>
          
          <Link to="/bookmarks" className="nav-link">
            <BiIcons.BiBookmarkAlt />
            <span>Bookmarks</span>
          </Link>
        </nav>
      </div>
      
      <div className="header-right">
        <button 
          onClick={handleStreakClick} 
          className="streak-button"
          title="View your badges"
        >
          <FaIcons.FaFire className={`streak-icon ${streak.currentStreak > 0 ? 'active' : ''}`} />
          <span className="streak-count">{streak.currentStreak}</span>
        </button>

        <button 
          onClick={toggleTheme} 
          className="theme-button"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <MdIcons.MdLightMode className="theme-icon" />
          ) : (
            <MdIcons.MdDarkMode className="theme-icon" />
          )}
        </button>
        
        <div className="profile-dropdown" ref={dropdownRef}>
          <button 
            className="profile-button"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            type="button"
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="profile-image" 
              />
            ) : (
              <div className="profile-initial">
                {getInitial(user)}
              </div>
            )}
            <span className="profile-name">{getDisplayName(user)}</span>
            <BiIcons.BiChevronDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
          </button>
          
          <div className={`dropdown-menu ${dropdownOpen ? 'show' : 'hide'}`}>
            <div className="user-info">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="dropdown-profile-image" 
                />
              ) : (
                <div className="dropdown-profile-initial">
                  {getInitial(user)}
                </div>
              )}
              <div className="user-details">
                <span className="user-name">{getDisplayName(user)}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            
            <button onClick={handleProfileClick} className="dropdown-item">
              <BiIcons.BiUser className="dropdown-icon" />
              <span>Profile</span>
            </button>

            <button onClick={handleLogout} className="dropdown-item logout-button">
              <BiIcons.BiLogOut className="dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
