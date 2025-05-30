import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { StreakProvider } from './context/StreakContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthContext from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Bytes from './components/Bytes';
import BytesBrowser from './components/BytesBrowser';
import ByteDetail from './components/ByteDetail';
import BookmarkedBytes from './components/BookmarkedBytes';
import Badges from './components/Badges';
import Profile from './components/Profile';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/Footer';
import { API_CONFIG } from './utils/config';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);
  
  if (!user) {
    return <div className="loading">Redirecting to login...</div>;
  }
  
  return children;
};

// Google Auth Success Handler
const GoogleAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const email = params.get('email');
    const profilePicture = params.get('profilePicture');
    const error = params.get('error');
    const details = params.get('details');
    
    if (error) {
      setError(`${error}: ${details}`);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }
    
    if (token && userId) {
      const userData = {
        _id: userId,
        firstName,
        lastName,
        email,
        profilePicture,
        token
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update context
      setUser(userData);
      
      // Use window.location for immediate redirect
      window.location.href = '/';
    } else {
      setError('Missing authentication data');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }
  }, [location, navigate, setUser]);
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return <div className="loading">Processing authentication...</div>;
};

// Layout component for main pages with header and footer
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

// Home page component
const HomePage = () => (
  <>
    <Hero />
    <Bytes />
  </>
);

const App = () => {
  return (
    <GoogleOAuthProvider
      clientId={API_CONFIG.GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) => {
        console.error('Failed to load Google script:', error);
      }}
      cookiePolicy="single_host_origin"
      scope="email profile"
      hostedDomain=""
      uxMode="popup"
      autoSelect={false}
      useOneTap={false}
      disableAutoSelect={true}
    >
      <ThemeProvider>
        <AuthProvider>
          <BookmarkProvider>
            <StreakProvider>
              <Router 
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <HomePage />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/all-bytes" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BytesBrowser />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/byte/:id" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ByteDetail />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/bookmarks" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookmarkedBytes />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/badges" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Badges />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Redirect any unknown routes to login */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Router>
          </StreakProvider>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
