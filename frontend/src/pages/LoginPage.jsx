import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import { API_CONFIG } from '../utils/config';
import './Auth.css';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, googleLogin, error, clearError, user, submitting } = useContext(AuthContext);
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

  const { email, password } = formData;

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
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const userData = await login(email, password);
      if (userData) {
        setSuccessMessage('Login successful! Redirecting...');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Login failed. Please try again.';
      
      // Handle specific error cases
      if (errorMsg.includes('User not found') || errorMsg.includes('No account found') || errorMsg.includes('No user found')) {
        setErrorMessage('No account found with this email. Redirecting to signup page...');
        setTimeout(() => {
          navigate('/signup');
        }, 2500);
      } else if (errorMsg.includes('Invalid password') || errorMsg.includes('Incorrect password') || errorMsg.includes('Invalid credentials')) {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) throw new Error('Google did not return a credential');
      const userData = await googleLogin(credentialResponse.credential);
      if (userData) {
        setSuccessMessage('Google login successful! Redirecting...');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.response?.status === 403) {
        errorMessage = 'This Google account is not authorized to access this application';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setErrorMessage('Failed to sign in with Google. Please try again or use email/password.');
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo">
            <BiIcons.BiCalendarCheck /> Dailybyte
          </div>
          <h2>Welcome Back</h2>
          <p>Log in to your account to continue</p>
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
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="form-input"
              autoComplete="email"
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
                placeholder="Enter your password"
                className="form-input password-input"
                autoComplete="current-password"
                required
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
          
          <div className="remember-forgot">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Signing in…" : "Log In"}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="google-btn-container">
          {API_CONFIG.GOOGLE_CLIENT_ID ? (
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} auto_select={false} />
          ) : <p>Google sign-in is currently unavailable. Use email and password.</p>}
        </div>
        
        <p className="auth-redirect">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
