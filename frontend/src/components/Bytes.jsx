import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import { useBookmark } from '../context/BookmarkContext';
import { useStreak } from '../context/StreakContext';
import AuthContext from '../context/AuthContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './Bytes.css';

const Bytes = () => {
  const navigate = useNavigate();
  const [todayByte, setTodayByte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showStreakAlert, setShowStreakAlert] = useState(false);
  
  // Refs to prevent unnecessary re-renders and duplicate API calls
  const bookmarkChecked = useRef(false);
  const byteLoaded = useRef(null);
  const initialized = useRef(false);
  
  const { addBookmark, removeBookmark, checkBookmarkStatus } = useBookmark();
  const { streak, updateStreak } = useStreak();
  const { user } = useContext(AuthContext);

  // Utility function to clean up old non-user-specific localStorage entries
  const cleanupOldLocalStorage = (byteId) => {
    if (!byteId) return;

    const oldKeys = [
      `byte_response_${byteId}`,
      `streak_shown_${new Date().toDateString()}`
    ];
    
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleaned up old localStorage key: ${key}`);
      }
    });
  };

  // Fetch today's byte - memoized to prevent unnecessary calls
  const fetchTodayByte = useRef(null);
  if (!fetchTodayByte.current) {
    fetchTodayByte.current = async () => {
      try {
        setLoading(true);
        const response = await axios.get(getApiUrl(ENDPOINTS.TODAY_BYTE));
        const byteData = response.data.data;
        setTodayByte(byteData);
        byteLoaded.current = byteData._id;
        return byteData;
      } catch (error) {
        console.error('Error fetching today\'s byte:', error);
        setError('Failed to load today\'s byte');
        throw error;
      } finally {
        setLoading(false);
      }
    };
  }

  // Check bookmark and answer status
  const checkByteStatus = useRef(null);
  if (!checkByteStatus.current) {
    checkByteStatus.current = async (byteData) => {
      if (!byteData?._id || !user?._id || bookmarkChecked.current) return;

      try {
        bookmarkChecked.current = true;
        
        // Clean up old localStorage entries
        cleanupOldLocalStorage(byteData._id);
        
        // Check bookmark status
        const bookmarkStatus = await checkBookmarkStatus(byteData._id);
        setIsBookmarked(bookmarkStatus);
        
        // Check if already answered by THIS USER
        const savedResponse = localStorage.getItem(`byte_response_${byteData._id}_user_${user._id}`);
        if (savedResponse) {
          const savedData = JSON.parse(savedResponse);
          setSelectedOption(savedData.selectedOption);
          setSubmitted(true);
          
          // Handle streak message for correct answers
          const savedDate = new Date(savedData.timestamp);
          const now = new Date();
          const today = now.toDateString();
          const isSameDay = savedDate.toDateString() === today;
          const streakShownToday = localStorage.getItem(`streak_shown_${today}_user_${user._id}`);
          
          if (isSameDay && 
              savedData.selectedOption === byteData.quiz.correctAnswer && 
              !streakShownToday) {
            
            localStorage.setItem(`streak_shown_${today}_user_${user._id}`, 'true');
            setShowStreakAlert(true);
            
            setTimeout(() => {
              setShowStreakAlert(false);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Error checking byte status:', error);
      }
    };
  }

  useEffect(() => {
    const initializeBytes = async () => {
      if (initialized.current) return;
      
      try {
        // First, fetch today's byte
        const byteData = await fetchTodayByte.current();
        
        // Then check status if user is available
        if (user?._id) {
          await checkByteStatus.current(byteData);
        }
        
        initialized.current = true;
      } catch (error) {
        console.error('Error initializing bytes:', error);
      }
    };

    initializeBytes();
  }, []); // Remove user dependency to prevent re-fetching

  // Separate effect for when user becomes available
  useEffect(() => {
    if (user?._id && todayByte && !bookmarkChecked.current) {
      checkByteStatus.current(todayByte);
    }
  }, [user?._id, todayByte?._id]); // Only depend on IDs, not full objects

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      bookmarkChecked.current = false;
      setIsBookmarked(false);
      setSelectedOption('');
      setSubmitted(false);
      setShowStreakAlert(false);
    }
  }, [user]);

  // Handle bookmark toggle
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!todayByte?._id) {
      console.error('Cannot bookmark: today\'s byte data not available');
      return;
    }
    
    try {
      if (isBookmarked) {
        await removeBookmark(todayByte._id);
        setIsBookmarked(false);
      } else {
        await addBookmark(todayByte._id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!todayByte?._id || !user?._id) {
      console.error('Cannot submit: missing today\'s byte or user data');
      return;
    }
    
    setSubmitted(true);
    
    // Save response to localStorage
    localStorage.setItem(`byte_response_${todayByte._id}_user_${user._id}`, JSON.stringify({
      selectedOption,
      timestamp: new Date().toISOString()
    }));

    // If answer is correct, update streak
    if (selectedOption === todayByte.quiz.correctAnswer) {
      try {
        console.log('Bytes: Answer is correct, updating streak...');
        console.log('Bytes: Current streak before update:', streak.currentStreak);
        
        // Update streak using context
        const updatedStreak = await updateStreak();
        console.log('Bytes: Updated streak received:', updatedStreak);
        
        // Mark that we've shown the streak for today to avoid showing it again on refresh
        const today = new Date().toDateString();
        localStorage.setItem(`streak_shown_${today}_user_${user._id}`, 'true');
        
        // Show streak alert for 5 seconds
        setShowStreakAlert(true);
        setTimeout(() => {
          setShowStreakAlert(false);
        }, 5000);

        // Check for badges
        const badgeResponse = await axios.get(
          getApiUrl(ENDPOINTS.STREAKS),
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        if (badgeResponse.data.data.badges?.length > 0) {
          setTimeout(() => {
            navigate('/badges');
          }, 2000);
        }
        
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    } else {
      console.log('Bytes: Answer is incorrect, not updating streak');
    }
  };

  // Render loading and error states
  if (loading) return <div className="bytes-loading">Loading...</div>;
  if (error) return <div className="bytes-error">{error}</div>;
  if (!user) return <div className="bytes-error">Please log in to view today's byte.</div>;

  return (
    <section className="bytes-section">
      {showStreakAlert && streak.currentStreak > 0 && (
        <div className="streak-alert">
          <FaIcons.FaFire className="streak-icon" />
          <div className="streak-alert-content">
            <p className="streak-count">🔥 {streak.currentStreak} day streak!</p>
          </div>
        </div>
      )}
      
      <h2 className="bytes-title">Today's Byte</h2>
      
      {todayByte && (
        <div className="byte-card">
          {!submitted && (
            <div className="welcome-message">
              <p>📚 Welcome! Answer today's byte to start your learning streak!</p>
            </div>
          )}
          
          <div className="byte-header">
            <h3>{todayByte.title}</h3>
            <div className="byte-actions">
              <span className="byte-tag">{todayByte.category || 'Psychology'}</span>
              <button 
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmarkClick}
              >
                {isBookmarked ? <BiIcons.BiBookmarkAlt /> : <BiIcons.BiBookmark />}
              </button>
            </div>
          </div>
          
          <p className="byte-summary">{todayByte.summary}</p>

          {todayByte.quiz && (
            <div className="byte-quiz">
              <h4>Quick Quiz:</h4>
              <p className="quiz-question">{todayByte.quiz.question}</p>
              
              <div className="quiz-options">
                {todayByte.quiz.options.map((option, index) => (
                  <label 
                    key={index} 
                    className={`quiz-option ${
                      submitted 
                        ? option === todayByte.quiz.correctAnswer
                          ? 'correct'
                          : option === selectedOption && option !== todayByte.quiz.correctAnswer
                            ? 'incorrect'
                            : ''
                        : selectedOption === option
                          ? 'selected'
                          : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="quiz"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => !submitted && setSelectedOption(e.target.value)}
                      disabled={submitted}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
              
              {!submitted ? (
                <button 
                  className="quiz-submit-btn" 
                  onClick={handleSubmit} 
                  disabled={!selectedOption}
                >
                  Submit Answer
                </button>
              ) : (
                <p className={`quiz-result ${selectedOption === todayByte.quiz.correctAnswer ? 'correct' : 'incorrect'}`}>
                  {selectedOption === todayByte.quiz.correctAnswer
                    ? "✅ Correct!"
                    : `❌ Incorrect. Correct answer is: ${todayByte.quiz.correctAnswer}`}
                </p>
              )}
            </div>
          )}
          
          <Link to={`/byte/${todayByte._id}`} className="read-more-link">
            Read more <BiIcons.BiRightArrowAlt />
          </Link>
        </div>
      )}
    </section>
  );
};

export default Bytes;
