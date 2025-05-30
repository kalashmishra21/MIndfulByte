import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const { user, handleAuthError } = useContext(AuthContext);
  const [streak, setStreak] = useState({ currentStreak: 0, maxStreak: 0, badges: [] });
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize streak when user logs in - only once
  useEffect(() => {
    console.log('StreakContext: useEffect triggered, user:', user);
    console.log('StreakContext: user?.token:', user?.token);
    console.log('StreakContext: hasInitialized.current:', hasInitialized.current);
    
    if (user?.token && !hasInitialized.current) {
      hasInitialized.current = true;
      console.log('StreakContext: Initializing streak fetch');
      
      const fetchStreak = async () => {
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          console.log('StreakContext: Making API call with config:', config);
          const response = await axios.get(getApiUrl(ENDPOINTS.STREAKS), config);
          console.log('StreakContext: API response:', response.data);
          setStreak(response.data.data);
        } catch (error) {
          console.error('Error fetching initial streak:', error);
          console.error('Error response:', error.response?.data);
          handleAuthError(error);
        } finally {
          setLoading(false);
        }
      };
      fetchStreak();
    }
  }, [user?.token, handleAuthError]);

  // Reset initialization when user changes
  useEffect(() => {
    if (!user?.token) {
      hasInitialized.current = false;
      setStreak({ currentStreak: 0, maxStreak: 0, badges: [] });
    }
  }, [user?.token]);

  const updateStreak = useCallback(async () => {
    if (!user?.token || loading) return streak;
    
    try {
      setLoading(true);
      console.log('StreakContext: Starting streak update...');
      console.log('StreakContext: Current streak before API call:', streak);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Update streak on server
      console.log('StreakContext: Making PUT request to update streak...');
      const updateResponse = await axios.put(getApiUrl(ENDPOINTS.UPDATE_STREAK), {}, config);
      console.log('StreakContext: Update response:', updateResponse.data);
      
      // If the response contains the updated streak data, use it
      if (updateResponse.data.data) {
        console.log('StreakContext: Setting streak from update response:', updateResponse.data.data);
        setStreak(updateResponse.data.data);
        return updateResponse.data.data;
      }
      
      // Otherwise, fetch the latest streak data
      console.log('StreakContext: No data in update response, fetching latest...');
      const response = await axios.get(getApiUrl(ENDPOINTS.STREAKS), config);
      console.log('StreakContext: Fetch response:', response.data);
      setStreak(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating streak:', error);
      handleAuthError(error);
      return streak;
    } finally {
      setLoading(false);
    }
  }, [user?.token, loading, streak, handleAuthError]);

  const value = {
    streak,
    updateStreak,
    loading
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export default StreakContext;
