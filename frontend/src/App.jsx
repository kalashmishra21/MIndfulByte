import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loading">Loading your session...</div>;
  return user ? children : <Navigate to="/login" replace />;
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
