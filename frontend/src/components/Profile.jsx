import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as AiIcons from 'react-icons/ai';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl, ENDPOINTS } from '../utils/config';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle field edit toggle
  const handleFieldEdit = (fieldName) => {
    setEditingField(editingField === fieldName ? null : fieldName);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(getApiUrl(ENDPOINTS.UPLOAD_PROFILE_PICTURE), formData, config);
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: response.data.profilePictureUrl
      }));
      
      setMessage({ text: 'Profile picture uploaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ text: 'Failed to upload profile picture', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      };

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        profilePicture: profileData.profilePicture
      };

      const response = await axios.put(getApiUrl(ENDPOINTS.PROFILE), updateData, config);
      
      // Update user context
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditingField(null); // Close edit mode
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      };

      await axios.put(getApiUrl(ENDPOINTS.CHANGE_PASSWORD), {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, config);
      
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update password', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (profileData.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    if (profileData.email) {
      return profileData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle profile picture click
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header with close button */}
        <div className="profile-modal-header">
          <h1>Profile Settings</h1>
          <button onClick={() => navigate(-1)} className="close-button">
            <AiIcons.AiOutlineClose />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            PROFILE
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            PREFERENCES
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <div className="message-content">
              {message.type === 'success' ? (
                <FaIcons.FaCheckCircle className="message-icon" />
              ) : (
                <FaIcons.FaExclamationCircle className="message-icon" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-layout">
                {/* Left side - Profile Picture */}
                <div className="profile-picture-section">
                  <div className="profile-picture-container">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="profile-picture clickable" 
                        onClick={handleProfilePictureClick}
                      />
                    ) : (
                      <div 
                        className="profile-initial-avatar clickable"
                        onClick={handleProfilePictureClick}
                      >
                        {getUserInitial()}
                        <div className="upload-overlay">
                          <BiIcons.BiCamera />
                        </div>
                      </div>
                    )}
                    {isUploading && (
                      <div className="upload-spinner">
                        <FaIcons.FaSpinner className="spinning" />
                      </div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className="change-photo-btn"
                    onClick={handleProfilePictureClick}
                    disabled={isUploading}
                  >
                    CHANGE
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Right side - Form Fields */}
                <div className="profile-fields">
                  <div className="field-group">
                    <label htmlFor="firstName">NAME</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        readOnly={editingField !== 'firstName'}
                        required
                      />
                      <button
                        type="button"
                        className="field-edit-btn"
                        onClick={() => handleFieldEdit('firstName')}
                      >
                        <FaIcons.FaEdit />
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="email">EMAIL</label>
                    <div className="input-with-icon">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        placeholder="support@gmail.com"
                        readOnly={editingField !== 'email'}
                        required
                      />
                      <button
                        type="button"
                        className="field-edit-btn"
                        onClick={() => handleFieldEdit('email')}
                      >
                        <FaIcons.FaEdit />
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="phone">PHONE</label>
                    <div className="input-with-icon">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 56 66 777"
                        readOnly={editingField !== 'phone'}
                      />
                      <button
                        type="button"
                        className="field-edit-btn"
                        onClick={() => handleFieldEdit('phone')}
                      >
                        <FaIcons.FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button - Only show when editing */}
              {editingField && (
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditingField(null)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="preferences-content">
              {/* Password Section */}
              <div className="preference-section">
                <div className="preference-header">
                  <h3>Password</h3>
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                  >
                    <FaIcons.FaEdit />
                    {isEditingPassword ? 'CANCEL' : 'EDIT'}
                  </button>
                </div>
                
                {!isEditingPassword ? (
                  <div className="field-group">
                    <label htmlFor="currentPasswordDisplay">CURRENT PASSWORD</label>
                    <div className="input-with-icon">
                      <input
                        type="password"
                        id="currentPasswordDisplay"
                        value="••••••••••"
                        readOnly
                        placeholder="••••••••••"
                      />
                      <FaIcons.FaLock className="field-icon" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="password-form">
                    <div className="field-group">
                      <label htmlFor="currentPassword">CURRENT PASSWORD</label>
                      <div className="input-with-icon">
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          required
                        />
                        <FaIcons.FaLock className="field-icon" />
                      </div>
                    </div>

                    <div className="field-group">
                      <label htmlFor="newPassword">NEW PASSWORD</label>
                      <div className="input-with-icon">
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          required
                        />
                        <FaIcons.FaLock className="field-icon" />
                      </div>
                    </div>

                    <div className="field-group">
                      <label htmlFor="confirmPassword">CONFIRM NEW PASSWORD</label>
                      <div className="input-with-icon">
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          required
                        />
                        <FaIcons.FaLock className="field-icon" />
                      </div>
                    </div>

                    <div className="password-actions">
                      <button
                        type="submit"
                        className="save-password-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 