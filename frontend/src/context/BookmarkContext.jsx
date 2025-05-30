import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';
import { getApiUrl, ENDPOINTS } from '../utils/config';

export const BookmarkContext = createContext();

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, handleAuthError } = useContext(AuthContext);
  
  // Cache for bookmark statuses and ongoing requests
  const bookmarkCache = useRef(new Map());
  const ongoingRequests = useRef(new Map());
  const bookmarksLoaded = useRef(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      if (!user?.token) {
        setLoading(false);
        return [];
      }
      
      // Prevent multiple simultaneous bookmark fetches
      if (ongoingRequests.current.has('fetchBookmarks')) {
        return ongoingRequests.current.get('fetchBookmarks');
      }

      setLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const request = axios.get(getApiUrl(ENDPOINTS.BOOKMARKS), config);
      ongoingRequests.current.set('fetchBookmarks', request);

      const response = await request;
      setBookmarks(response.data.data || []);
      bookmarksLoaded.current = true;
      
      // Update cache with fetched bookmarks
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach(bookmark => {
          if (bookmark?.byte?._id) {
            bookmarkCache.current.set(bookmark.byte._id, true);
          }
        });
      }
      
      ongoingRequests.current.delete('fetchBookmarks');
      return response.data.data || [];
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch bookmarks');
      ongoingRequests.current.delete('fetchBookmarks');
      handleAuthError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, handleAuthError]);

  const addBookmark = useCallback(async (byteId) => {
    try {
      if (!user?.token || !byteId) {
        throw new Error('User must be logged in and byteId is required');
      }
      
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.post(
        getApiUrl(ENDPOINTS.BOOKMARKS),
        { byteId },
        config
      );

      if (response.data.data) {
        setBookmarks(prev => [...prev, response.data.data]);
        // Update cache
        bookmarkCache.current.set(byteId, true);
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add bookmark');
      handleAuthError(error);
      return false;
    }
  }, [user?.token, handleAuthError]);

  const removeBookmark = useCallback(async (byteId) => {
    try {
      if (!user?.token || !byteId) {
        throw new Error('User must be logged in and byteId is required');
      }
      
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.delete(`${getApiUrl(ENDPOINTS.BOOKMARKS)}/${byteId}`, config);
      setBookmarks(prev => prev.filter(bookmark => bookmark?.byte?._id !== byteId));
      // Update cache
      bookmarkCache.current.set(byteId, false);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove bookmark');
      handleAuthError(error);
      return false;
    }
  }, [user?.token, handleAuthError]);

  const checkBookmarkStatus = useCallback(async (byteId) => {
    try {
      if (!user?.token || !byteId) return false;
      
      // Check cache first
      if (bookmarkCache.current.has(byteId)) {
        return bookmarkCache.current.get(byteId);
      }
      
      // Prevent multiple simultaneous calls for the same byteId
      const requestKey = `check_${byteId}`;
      if (ongoingRequests.current.has(requestKey)) {
        return await ongoingRequests.current.get(requestKey);
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const request = axios.get(
        `${getApiUrl(ENDPOINTS.CHECK_BOOKMARK)}/${byteId}/check`,
        config
      ).then(response => {
        const isBookmarked = response.data.isBookmarked || false;
        // Cache the result
        bookmarkCache.current.set(byteId, isBookmarked);
        ongoingRequests.current.delete(requestKey);
        return isBookmarked;
      }).catch(error => {
        console.error('Error checking bookmark status:', error);
        ongoingRequests.current.delete(requestKey);
        // Cache false as default
        bookmarkCache.current.set(byteId, false);
        handleAuthError(error);
        return false;
      });
      
      ongoingRequests.current.set(requestKey, request);
      return await request;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }, [user?.token, handleAuthError]);

  // Clear cache when user changes
  React.useEffect(() => {
    if (!user?.token) {
      bookmarkCache.current.clear();
      ongoingRequests.current.clear();
      bookmarksLoaded.current = false;
      setBookmarks([]);
    }
  }, [user?.token]);

  const value = {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    checkBookmarkStatus,
    isBookmarksLoaded: bookmarksLoaded.current
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Export as default
export default BookmarkContext;