// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                   '530698123278-3cn31ts9qdpn2ted90mnfds3rg0kbcgb.apps.googleusercontent.com'
};

// Debug log to check which URL is being used
console.log('API Configuration:', {
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  BASE_URL: API_CONFIG.BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV
});

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/users',
  LOGIN: '/api/users/login',
  GOOGLE_AUTH: '/api/users/google',
  
  // User endpoints
  PROFILE: '/api/users/profile',
  UPLOAD_PROFILE_PICTURE: '/api/users/upload-profile-picture',
  REMOVE_PROFILE_PICTURE: '/api/users/remove-profile-picture',
  CHANGE_PASSWORD: '/api/users/change-password',
  
  // Byte endpoints
  TODAY_BYTE: '/api/byte/today',
  ALL_BYTES: '/api/byte',
  BYTE_DETAIL: '/api/byte',
  
  // Bookmark endpoints
  BOOKMARKS: '/api/bookmarks',
  CHECK_BOOKMARK: '/api/bookmarks',
  
  // Streak endpoints
  STREAKS: '/api/streaks',
  UPDATE_STREAK: '/api/streaks/update'
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL;
  // Remove /api from baseUrl if endpoint already includes it
  const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  const fullUrl = `${cleanBaseUrl}${endpoint}`;
  console.log(`API URL for ${endpoint}:`, fullUrl);
  return fullUrl;
}; 
