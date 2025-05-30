import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, ENDPOINTS } from '../utils/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    console.log('AuthContext: Loading user from localStorage:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Parsed user data:', parsedUser);
        console.log('AuthContext: User has token:', !!parsedUser.token);
        
        // Basic token validation
        if (parsedUser.token) {
          try {
            // Check if token has the correct format (JWT has 3 parts separated by dots)
            const tokenParts = parsedUser.token.split('.');
            if (tokenParts.length !== 3) {
              console.error('AuthContext: Invalid token format');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            }
            
            // Try to decode the payload to check expiration
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('AuthContext: Token payload:', payload);
            
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              console.error('AuthContext: Token is expired');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            }
            
            console.log('AuthContext: Token appears valid');
          } catch (tokenError) {
            console.error('AuthContext: Error validating token:', tokenError);
            localStorage.removeItem('user');
            setLoading(false);
            return;
          }
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post(getApiUrl(ENDPOINTS.REGISTER), userData);
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post(getApiUrl(ENDPOINTS.LOGIN), { email, password });
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const googleLogin = async (googleData) => {
    try {
      setError(null);
      setLoading(true);

      // Client-side validation
      if (!googleData.email || !googleData.googleId) {
        throw new Error('Invalid Google account data');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(googleData.email)) {
        throw new Error('Invalid email format');
      }

      const response = await axios.post(getApiUrl(ENDPOINTS.GOOGLE_AUTH), {
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        email: googleData.email,
        googleId: googleData.googleId,
        profilePicture: googleData.profilePicture,
      });
      
      const data = response.data;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error('Google Auth Error:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to authenticate with Google';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      console.log('AuthContext: Authentication error, logging out user');
      logout();
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        register,
        login,
        googleLogin,
        logout,
        clearError,
        handleAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;