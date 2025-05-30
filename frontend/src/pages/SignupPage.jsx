import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import { API_CONFIG } from '../utils/config';
import * as jwt_decode from 'jwt-decode';
import './Auth.css';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, googleLogin, error, clearError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Add auth-page class to body for dark theme and remove scrollbar
  useEffect(() => {
    document.body.classList.add('auth-page');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  // Clear Google session to force standard button
  useEffect(() => {
    // Clear Google's cached session
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.cancel();
      } catch (e) {
        console.log('Google accounts not loaded yet');
      }
    }
    
    // Clear Google cookies and session storage
    try {
      sessionStorage.removeItem('g_state');
      localStorage.removeItem('g_state');
      
      // Clear any Google-related items
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('google') || key.includes('gsi')) {
          sessionStorage.removeItem(key);
        }
      });
      
      Object.keys(localStorage).forEach(key => {
        if (key.includes('google') || key.includes('gsi')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.log('Storage clear failed:', e);
    }
  }, []);

  const { fullName, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    try {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = await register({
        firstName,
        lastName,
        email,
        password,
      });

      if (userData) {
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Registration failed. Please try again.';
      
      if (errorMsg.includes('User already exists') || errorMsg.includes('Email already registered')) {
        setErrorMessage('An account with this email already exists. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      let googleData;
      
      if (credentialResponse.googleData) {
        // Custom button data
        googleData = credentialResponse.googleData;
      } else if (credentialResponse.credential) {
        // Original GoogleLogin component data
        const decoded = jwt_decode.default(credentialResponse.credential);
        
        if (!decoded.email) {
          throw new Error('Email is required for authentication');
        }
        
        googleData = {
          firstName: decoded.given_name || decoded.name?.split(' ')[0] || '',
          lastName: decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || '',
          email: decoded.email,
          googleId: decoded.sub,
          profilePicture: decoded.picture
        };
      } else {
        throw new Error('Failed to get Google credentials');
      }
      
      const userData = await googleLogin(googleData);
      if (userData) {
        setSuccessMessage('Google signup successful! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      let errorMessage = 'Failed to sign up with Google';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google signup error:', error);
    setErrorMessage('Failed to sign up with Google. Please try again or use email/password.');
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo">
            <BiIcons.BiCalendarCheck /> Dailybyte
          </div>
          <h2>Create an Account</h2>
          <p>Join thousands of users on Dailybyte</p>
        </div>
        
        {(errorMessage || error) && (
          <div className={`message ${errorMessage?.includes('Redirecting') ? 'info' : 'error'}`}>
            <span className="message-icon">
              {errorMessage?.includes('Redirecting') ? 
                <FaIcons.FaInfoCircle /> : 
                <FaIcons.FaExclamationTriangle />
              }
            </span>
            <span className="message-text">
              {errorMessage || error}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="message success">
            <span className="message-icon">
              <FaIcons.FaCheckCircle />
            </span>
            <span className="message-text">
              {successMessage}
            </span>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={onChange}
              placeholder="Enter your full name"
              className="form-input"
              required
              minLength="2"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create a password"
                className="form-input password-input"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm your password"
                className="form-input password-input"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
              </button>
            </div>
          </div>
          
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className="auth-button">
            Sign Up
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="google-btn-container">
          <button 
            type="button" 
            className="google-auth-button"
            onClick={() => {
              // Trigger Google OAuth manually
              if (window.google && window.google.accounts) {
                window.google.accounts.id.prompt((notification) => {
                  if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to popup
                    window.google.accounts.oauth2.initTokenClient({
                      client_id: API_CONFIG.GOOGLE_CLIENT_ID,
                      scope: 'email profile',
                      callback: async (response) => {
                        if (response.access_token) {
                          try {
                            // Get user info from Google
                            const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
                            const userInfo = await userInfoResponse.json();
                            
                            const googleData = {
                              firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
                              lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
                              email: userInfo.email,
                              googleId: userInfo.id,
                              profilePicture: userInfo.picture
                            };
                            
                            await handleGoogleSuccess({ credential: null, googleData });
                          } catch (error) {
                            handleGoogleError(error);
                          }
                        }
                      }
                    }).requestAccessToken();
                  }
                });
              } else {
                setErrorMessage('Google authentication is not available. Please try again later.');
              }
            }}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
        </div>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
