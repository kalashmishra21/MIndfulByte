import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as BiIcons from 'react-icons/bi';
import { useBookmark } from '../context/BookmarkContext';
import AuthContext from '../context/AuthContext';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './Bytes.css';

const BytesBrowser = () => {
  const navigate = useNavigate();
  const { addBookmark, removeBookmark, checkBookmarkStatus } = useBookmark();
  const { user } = useContext(AuthContext);
  const [bookmarkStates, setBookmarkStates] = useState({});
  const [allBytes, setAllBytes] = useState([]);
  const [filteredBytes, setFilteredBytes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 6
  });

  const categoryRef = useRef(null);
  const tagRef = useRef(null);
  
  // Cache for bookmark status checks to prevent duplicate API calls
  const bookmarkCheckCache = useRef(new Map());
  const lastFetchParams = useRef(null);

  // Enhanced filter suggestions with better matching
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return [];
    const searchTerm = categorySearch.toLowerCase().trim();
    if (searchTerm.length === 0) return [];
    
    return categories
      .filter(cat => {
        const catLower = cat.toLowerCase();
        // Include if category contains the search term anywhere
        return catLower.includes(searchTerm);
      })
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact matches first
        if (aLower === searchLower && bLower !== searchLower) return -1;
        if (bLower === searchLower && aLower !== searchLower) return 1;
        
        // Starts with search term
        if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
        if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;
        
        // Contains search term (by position)
        const aIndex = aLower.indexOf(searchLower);
        const bIndex = bLower.indexOf(searchLower);
        if (aIndex !== bIndex) return aIndex - bIndex;
        
        // Alphabetical order
        return a.localeCompare(b);
      })
      .slice(0, 10); // Limit to 10 suggestions for better UX
  }, [categories, categorySearch]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return [];
    const searchTerm = tagSearch.toLowerCase().trim();
    if (searchTerm.length === 0) return [];
    
    return tags
      .filter(tag => {
        const tagLower = tag.toLowerCase();
        // Include if tag contains the search term anywhere
        return tagLower.includes(searchTerm);
      })
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact matches first
        if (aLower === searchLower && bLower !== searchLower) return -1;
        if (bLower === searchLower && aLower !== searchLower) return 1;
        
        // Starts with search term
        if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
        if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;
        
        // Contains search term (by position)
        const aIndex = aLower.indexOf(searchLower);
        const bIndex = bLower.indexOf(searchLower);
        if (aIndex !== bIndex) return aIndex - bIndex;
        
        // Alphabetical order
        return a.localeCompare(b);
      })
      .slice(0, 10); // Limit to 10 suggestions for better UX
  }, [tags, tagSearch]);

  // Enhanced highlighting function
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // Fetch bytes with filters
  const fetchBytes = useCallback((category = '', tag = '', page = 1, append = false) => {
    // Prevent duplicate fetches with same parameters
    const fetchKey = `${category}-${tag}-${page}`;
    if (lastFetchParams.current === fetchKey) {
      return;
    }
    lastFetchParams.current = fetchKey;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    let url = `${getApiUrl(ENDPOINTS.ALL_BYTES)}?`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    params.append('chunkCount', page);
    url += params.toString();
    
    axios.get(url)
      .then(response => {
        const { data, pagination, metadata } = response.data;
        
        if (append) {
          // Append new bytes to existing ones
          setAllBytes(prevBytes => [...prevBytes, ...data]);
          setFilteredBytes(prevBytes => [...prevBytes, ...data]);
        } else {
          // Replace bytes (for new searches/filters)
          setAllBytes(data);
          setFilteredBytes(data);
        }
        
        setPagination(pagination);
        
        if (metadata?.categories) setCategories(metadata.categories);
        if (metadata?.tags) setTags(metadata.tags);

        // Only check bookmark status if user is available
        if (user?._id) {
          checkBookmarkStatuses(data);
        }
      })
      .catch(error => {
        console.error('Error fetching bytes:', error);
        setError('Failed to load bytes');
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [user?._id]); // Only depend on user ID

  // Optimized bookmark status checking with caching
  const checkBookmarkStatuses = useCallback(async (bytes) => {
    if (!user?._id) return;

    const states = {};
    const promises = [];

    for (const byte of bytes) {
      // Check cache first
      if (bookmarkCheckCache.current.has(byte._id)) {
        states[byte._id] = bookmarkCheckCache.current.get(byte._id);
        continue;
      }

      // Create promise for API call
      const promise = checkBookmarkStatus(byte._id)
        .then(isMarked => {
          // Cache the result
          bookmarkCheckCache.current.set(byte._id, isMarked);
          states[byte._id] = isMarked;
          return { byteId: byte._id, isMarked };
        })
        .catch(error => {
          console.error('Error checking bookmark status:', error);
          states[byte._id] = false;
          bookmarkCheckCache.current.set(byte._id, false);
          return { byteId: byte._id, isMarked: false };
        });

      promises.push(promise);
    }

    // Wait for all bookmark checks to complete
    if (promises.length > 0) {
      try {
        const results = await Promise.all(promises);
        results.forEach(({ byteId, isMarked }) => {
          states[byteId] = isMarked;
        });
      } catch (error) {
        console.error('Error in batch bookmark check:', error);
      }
    }

    setBookmarkStates(states);
  }, [checkBookmarkStatus, user?._id]);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce((category, tag) => {
      lastFetchParams.current = null; // Reset to allow new fetch
      fetchBytes(category, tag, 1, false); // Always start from page 1 with new filters
    }, 300),
    [fetchBytes]
  );

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategorySearch(category);
    setShowCategorySuggestions(false);
    lastFetchParams.current = null; // Reset to allow new fetch
    fetchBytes(category, selectedTag, 1, false); // Reset to page 1
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setTagSearch(tag);
    setShowTagSuggestions(false);
    lastFetchParams.current = null; // Reset to allow new fetch
    fetchBytes(selectedCategory, tag, 1, false); // Reset to page 1
  };

  // Handle byte card click
  const handleByteClick = (byteId) => {
    navigate(`/byte/${byteId}`);
  };

  const handleBookmarkClick = async (e, byteId) => {
    e.stopPropagation();
    try {
      if (bookmarkStates[byteId]) {
        await removeBookmark(byteId);
        setBookmarkStates(prev => ({ ...prev, [byteId]: false }));
        bookmarkCheckCache.current.set(byteId, false);
      } else {
        await addBookmark(byteId);
        setBookmarkStates(prev => ({ ...prev, [byteId]: true }));
        bookmarkCheckCache.current.set(byteId, true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Initial data fetch - only once
  useEffect(() => {
    fetchBytes();
  }, []); // Remove fetchBytes dependency

  // Clear cache when user changes
  useEffect(() => {
    if (!user) {
      bookmarkCheckCache.current.clear();
      setBookmarkStates({});
    }
  }, [user]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setCategorySearch('');
    setTagSearch('');
    setShowCategorySuggestions(false);
    setShowTagSuggestions(false);
    lastFetchParams.current = null; // Reset to allow new fetch
    fetchBytes('', '', 1, false); // Reset to page 1
  };

  // Handle clicks outside of suggestion lists
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategorySuggestions(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target)) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced category input change with better partial matching
  const handleCategoryInputChange = (e) => {
    const value = e.target.value;
    setCategorySearch(value);
    setShowCategorySuggestions(true);
    
    if (value.trim() === '') {
      setSelectedCategory('');
      debouncedFetch('', selectedTag);
    } else {
      // Check for exact match first
      const exactMatch = categories.find(cat => 
        cat.toLowerCase() === value.toLowerCase().trim()
      );
      
      if (exactMatch) {
        setSelectedCategory(exactMatch);
        lastFetchParams.current = null;
        fetchBytes(exactMatch, selectedTag, 1, false);
      } else {
        // For partial matches, use the search term directly
        // This allows backend to handle partial matching with regex
        setSelectedCategory(value.trim());
        debouncedFetch(value.trim(), selectedTag);
      }
    }
  };

  // Enhanced tag input change with better partial matching
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagSearch(value);
    setShowTagSuggestions(true);
    
    if (value.trim() === '') {
      setSelectedTag('');
      debouncedFetch(selectedCategory, '');
    } else {
      // Check for exact match first
      const exactMatch = tags.find(tag => 
        tag.toLowerCase() === value.toLowerCase().trim()
      );
      
      if (exactMatch) {
        setSelectedTag(exactMatch);
        lastFetchParams.current = null;
        fetchBytes(selectedCategory, exactMatch, 1, false);
      } else {
        // For partial matches, use the search term directly
        // This allows backend to handle partial matching with regex
        setSelectedTag(value.trim());
        debouncedFetch(selectedCategory, value.trim());
      }
    }
  };

  // Enhanced keyboard navigation
  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCategories.length > 0) {
      e.preventDefault();
      handleCategorySelect(filteredCategories[0]);
    } else if (e.key === 'Escape') {
      setShowCategorySuggestions(false);
      setCategorySearch(selectedCategory);
    } else if (e.key === 'ArrowDown' && filteredCategories.length > 0) {
      e.preventDefault();
      // Focus first suggestion (could be enhanced further)
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && filteredTags.length > 0) {
      e.preventDefault();
      handleTagSelect(filteredTags[0]);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      setTagSearch(selectedTag);
    } else if (e.key === 'ArrowDown' && filteredTags.length > 0) {
      e.preventDefault();
      // Focus first suggestion (could be enhanced further)
    }
  };

  // Load more bytes function
  const handleShowMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !loadingMore) {
      fetchBytes(selectedCategory, selectedTag, pagination.currentPage + 1, true);
    }
  }, [fetchBytes, selectedCategory, selectedTag, pagination.currentPage, pagination.totalPages, loadingMore]);

  // Show less bytes function - reset to first page
  const handleShowLess = useCallback(() => {
    if (pagination.currentPage > 1) {
      lastFetchParams.current = null; // Reset to allow new fetch
      fetchBytes(selectedCategory, selectedTag, 1, false); // Reset to page 1
    }
  }, [fetchBytes, selectedCategory, selectedTag, pagination.currentPage]);

  return (
    <section className="bytes-browser">
      <h2>Browse Psychology Bytes</h2>
      
      <div className="filters">
        <div className="filter-group">
          <div className="filter-item">
            <label>Category:</label>
            <div className="search-container" ref={categoryRef}>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={handleCategoryInputChange}
                onKeyDown={handleCategoryKeyDown}
                onFocus={() => setShowCategorySuggestions(true)}
              />
              {showCategorySuggestions && (
                <div className="suggestions-list">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${selectedCategory === category ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect(category)}
                      >
                        {highlightMatch(category, categorySearch)}
                      </div>
                    ))
                  ) : categorySearch.trim().length > 0 ? (
                    <div className="no-suggestions">
                      No categories found matching "{categorySearch}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="filter-item">
            <label>Tag:</label>
            <div className="search-container" ref={tagRef}>
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
              />
              {showTagSuggestions && (
                <div className="suggestions-list">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag, index) => (
                      <div
                        key={index}
                        className={`suggestion-item ${selectedTag === tag ? 'selected' : ''}`}
                        onClick={() => handleTagSelect(tag)}
                      >
                        {highlightMatch(tag, tagSearch)}
                      </div>
                    ))
                  ) : tagSearch.trim().length > 0 ? (
                    <div className="no-suggestions">
                      No tags found matching "{tagSearch}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleResetFilters}
            className="reset-button"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bytes-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredBytes.length === 0 ? (
          <div className="no-results">No bytes found matching the selected filters.</div>
        ) : (
          <>
            {filteredBytes.map((byte) => (
              <div 
                key={byte._id} 
                className="byte-card"
                onClick={() => navigate(`/byte/${byte._id}`)}
              >
                <div className="byte-header">
                  <h3>{byte.title}</h3>
                  <div className="byte-actions">
                    <span className="byte-tag">{byte.category}</span>
                    <button 
                      className={`bookmark-btn ${bookmarkStates[byte._id] ? 'bookmarked' : ''}`}
                      onClick={(e) => handleBookmarkClick(e, byte._id)}
                    >
                      {bookmarkStates[byte._id] ? <BiIcons.BiBookmarkAlt /> : <BiIcons.BiBookmark />}
                    </button>
                  </div>
                </div>
                <p className="byte-summary">{byte.summary}</p>
                {byte.tags && byte.tags.length > 0 && (
                  <div className="byte-tags">
                    {byte.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {!loading && !error && pagination.currentPage < pagination.totalPages && (
        <button 
          onClick={handleShowMore}
          className="load-more-button"
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Show More'}
        </button>
      )}

      {!loading && !error && pagination.currentPage > 1 && (
        <button 
          onClick={handleShowLess}
          className="show-less-button"
        >
          Show Less
        </button>
      )}
    </section>
  );
};

export default BytesBrowser;