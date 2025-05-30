import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import { useBookmark } from '../context/BookmarkContext';
import AuthContext from '../context/AuthContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './ByteDetail.css';

const ByteDetail = () => {
  const [byte, setByte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { id } = useParams();
  const { addBookmark, removeBookmark, checkBookmarkStatus } = useBookmark();
  const { user } = useContext(AuthContext);
  
  // Refs to prevent duplicate API calls
  const bookmarkChecked = useRef(false);
  const currentByteId = useRef(null);

  useEffect(() => {
    const fetchByteAndBookmark = async () => {
      // Reset refs when byte ID changes
      if (currentByteId.current !== id) {
        bookmarkChecked.current = false;
        currentByteId.current = id;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${getApiUrl(ENDPOINTS.BYTE_DETAIL)}/${id}`);
        const byteData = response.data.data;
        setByte(byteData);
        
        // Check bookmark and answer status only once per byte and user combination
        if (byteData?._id && user?._id && !bookmarkChecked.current) {
          bookmarkChecked.current = true;
          
          try {
            const bookmarkStatus = await checkBookmarkStatus(byteData._id);
            setIsBookmarked(bookmarkStatus);
          } catch (error) {
            console.error('Error checking bookmark status:', error);
            setIsBookmarked(false);
          }
          
          // Check if already answered by THIS USER - using same format as Bytes.jsx
          const savedResponse = localStorage.getItem(`byte_response_${byteData._id}_user_${user._id}`);
          if (savedResponse) {
            const savedData = JSON.parse(savedResponse);
            setSelectedOption(savedData.selectedOption);
            setSubmitted(true);
          }
        }
      } catch (error) {
        console.error('Error fetching byte details:', error);
        setError('Failed to load byte details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchByteAndBookmark();
    }
  }, [id, user?._id]); // Only depend on ID and user ID, not full objects

  // Reset bookmark state when user changes
  useEffect(() => {
    if (!user) {
      setIsBookmarked(false);
      bookmarkChecked.current = false;
    }
  }, [user]);

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!byte?._id) {
      console.error('Cannot bookmark: byte data not available');
      return;
    }
    
    try {
      if (isBookmarked) {
        await removeBookmark(byte._id);
        setIsBookmarked(false);
      } else {
        await addBookmark(byte._id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleSubmit = () => {
    if (!byte?._id || !user?._id) {
      console.error('Cannot submit: missing byte or user data');
      return;
    }
    
    setSubmitted(true);
    // Save response to localStorage using same format as Bytes.jsx
    localStorage.setItem(`byte_response_${byte._id}_user_${user._id}`, JSON.stringify({
      selectedOption,
      timestamp: new Date().toISOString()
    }));
  };

  if (loading) return <div className="byte-detail-loading">Loading...</div>;
  if (error) return <div className="byte-detail-error">{error}</div>;
  if (!byte) return <div className="byte-detail-error">Byte not found</div>;

  return (
    <section className="byte-detail">
      <div className="byte-detail-header">
        <Link to="/all-bytes" className="back-link">
          <BiIcons.BiArrowBack />
          <span>Back to all bytes</span>
        </Link>
        
        <div className="byte-meta-actions">
          <span className="byte-category">{byte.category || 'Psychology'}</span>
          {user && (
            <button 
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkClick}
            >
              {isBookmarked ? <BiIcons.BiBookmarkAlt /> : <BiIcons.BiBookmark />}
            </button>
          )}
        </div>
      </div>
      
      <div className="byte-content">
        <h1 className="byte-title">{byte.title}</h1>
        
        <div className="byte-date">
          <FaIcons.FaCalendarAlt />
          <span>{new Date(byte.datePublished).toLocaleDateString()}</span>
        </div>
        
        <div className="byte-section">
          <h3>
            <FaIcons.FaInfoCircle />
            Summary
          </h3>
          <p>{byte.summary}</p>
        </div>
        
        <div className="byte-section">
          <h3>
            <FaIcons.FaLightbulb />
            Example
          </h3>
          <p>{byte.example}</p>
        </div>
        
        {byte.tags && byte.tags.length > 0 && (
          <div className="byte-section">
            <h3>
              <FaIcons.FaTags />
              Tags
            </h3>
            <div className="tags-container">
              {byte.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {byte.quiz && (
          <div className="byte-quiz-section">
            <h3>
              <FaIcons.FaQuestionCircle />
              Quick Quiz
            </h3>
            <p className="quiz-question">{byte.quiz.question}</p>
            
            <div className="quiz-options">
              {byte.quiz.options.map((option, index) => (
                <label 
                  key={index} 
                  className={`quiz-option ${
                    submitted 
                      ? option === byte.quiz.correctAnswer
                        ? 'correct'
                        : option === selectedOption && option !== byte.quiz.correctAnswer
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
                onClick={handleSubmit} 
                disabled={!selectedOption}
                className="quiz-submit-btn"
              >
                Submit Answer
              </button>
            ) : (
              <div className={`quiz-result ${selectedOption === byte.quiz.correctAnswer ? 'correct' : 'incorrect'}`}>
                {selectedOption === byte.quiz.correctAnswer
                  ? "✅ Correct! Great job!"
                  : `❌ Incorrect. The correct answer is: ${byte.quiz.correctAnswer}`}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ByteDetail; 