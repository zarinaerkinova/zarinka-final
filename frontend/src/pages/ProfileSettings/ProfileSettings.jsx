import React, { useState } from 'react';
import { useUserStore } from '../../store/User';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './ProfileSettings.scss';

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { userInfo, updateUserProfile, deleteAccount } = useUserStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [personalInfo, setPersonalInfo] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
  });
  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [notifications, setNotifications] = useState({
    orderStatusUpdates: true,
    messagesFromBakers: true,
    promotionalOffers: false,
    newProductsAndFeatures: false,
    weeklyEmailDigest: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowDirectContact: true,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handlePrivacyChange = (e) => {
    setPrivacy({ ...privacy, [e.target.name]: e.target.checked });
  };

  const handleDeleteAccount = async () => {
    if (confirmationName !== userInfo.name) {
      toast.error('Please type your name correctly to confirm.');
      return;
    }
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success('Account deleted successfully.');
        navigate('/');
      } else {
        toast.error(result.message || 'Failed to delete account.');
      }
    } catch (error) {
      toast.error(
        error.message || 'An error occurred while deleting the account.'
      );
    }
  };

  const handleSavePersonalInfo = async () => {
    const formData = new FormData();
    formData.append('name', personalInfo.name);
    formData.append('email', personalInfo.email);
    formData.append('phone', personalInfo.phone);
    const result = await updateUserProfile(formData);
    if (result.success) {
      toast.success('Personal information saved!');
    } else {
      toast.error(result.message || 'Failed to save personal information.');
    }
  };

  const handleSavePassword = () => {
    // Add logic to save password
    toast.success('Password changed successfully!');
  };

  const handleSaveNotifications = () => {
    // Add logic to save notifications
    toast.success('Notification settings saved!');
  };

  const handleSavePrivacy = () => {
    // Add logic to save privacy settings
    toast.success('Privacy settings saved!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (activeTab) {
      case 'Profile':
        handleSavePersonalInfo();
        break;
      case 'Notifications':
        handleSaveNotifications();
        break;
      case 'Privacy':
        handleSavePrivacy();
        break;
      default:
        break;
    }
  };

  const renderProfileTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>{t('profile_settings_personal_info')}</h3>
        <div className="form-group">
          <label>{t('profile_settings_name')}</label>
          <input
            type="text"
            name="name"
            value={personalInfo.name}
            onChange={handlePersonalInfoChange}
          />
        </div>
        <div className="form-group">
          <label>{t('profile_settings_email')}</label>
          <input
            type="email"
            name="email"
            value={personalInfo.email}
            onChange={handlePersonalInfoChange}
          />
        </div>
        <div className="form-group">
          <label>{t('profile_settings_phone')}</label>
          <input
            type="text"
            name="phone"
            value={personalInfo.phone}
            onChange={handlePersonalInfoChange}
          />
        </div>
      </div>
      <hr />
      <div className="settings-section">
        <h3>{t('profile_settings_change_password')}</h3>
        <div className="form-group">
          <label>{t('profile_settings_old_password')}</label>
          <input
            type="password"
            name="oldPassword"
            value={password.oldPassword}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="form-group">
          <label>{t('profile_settings_new_password')}</label>
          <input
            type="password"
            name="newPassword"
            value={password.newPassword}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="form-group">
          <label>{t('profile_settings_repeat_password')}</label>
          <input
            type="password"
            name="repeatPassword"
            value={password.repeatPassword}
            onChange={handlePasswordChange}
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Order Notifications</h3>
        <div className="settings-group">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="orderStatusUpdates"
                checked={notifications.orderStatusUpdates}
                onChange={handleNotificationChange}
              />
              <span className="setting-text">{t('profile_settings_order_status_updates')}</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="messagesFromBakers"
                checked={notifications.messagesFromBakers}
                onChange={handleNotificationChange}
              />
              <span className="setting-text">{t('profile_settings_messages_from_bakers')}</span>
            </label>
          </div>
        </div>
      </div>
      <hr />
      <div className="settings-section">
        <h3>Marketing Notifications</h3>
        <div className="settings-group">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="promotionalOffers"
                checked={notifications.promotionalOffers}
                onChange={handleNotificationChange}
              />
              <span className="setting-text">{t('profile_settings_promotional_offers')}</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="newProductsAndFeatures"
                checked={notifications.newProductsAndFeatures}
                onChange={handleNotificationChange}
              />
              <span className="setting-text">{t('profile_settings_new_products_features')}</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="weeklyEmailDigest"
                checked={notifications.weeklyEmailDigest}
                onChange={handleNotificationChange}
              />
              <span className="setting-text">{t('profile_settings_weekly_email_digest')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="tab-content">
      <div className="settings-section">
        <h3>Profile Visibility</h3>
        <div className="settings-group">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="profileVisible"
                checked={privacy.profileVisible}
                onChange={handlePrivacyChange}
              />
              <span className="setting-text">Make my profile visible to other users</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="showEmail"
                checked={privacy.showEmail}
                onChange={handlePrivacyChange}
              />
              <span className="setting-text">Show my email address on profile</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="showPhone"
                checked={privacy.showPhone}
                onChange={handlePrivacyChange}
              />
              <span className="setting-text">Show my phone number on profile</span>
            </label>
          </div>
        </div>
      </div>
      <hr />
      <div className="settings-section">
        <h3>Communication</h3>
        <div className="settings-group">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                name="allowDirectContact"
                checked={privacy.allowDirectContact}
                onChange={handlePrivacyChange}
              />
              <span className="setting-text">Allow bakers to contact me directly</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="tab-content">
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <div className="danger-item">
          <div className="danger-info">
            <h4>Delete Account</h4>
            <p>
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn-danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return renderProfileTab();
      case 'Notifications':
        return renderNotificationsTab();
      case 'Privacy':
        return renderPrivacyTab();
      case 'Account':
        return renderAccountTab();
      default:
        return renderProfileTab();
    }
  };

  const tabs = ['Profile', 'Notifications', 'Privacy', 'Account'];

  return (
    <div className="edit-profile-page">
      <h2>Profile Settings</h2>

      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="edit-profile-actions">
        <button
          type="submit"
          form="edit-profile-form"
          className="btn-primary"
        >
          Save Changes
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="edit-profile-form"
        id="edit-profile-form"
      >
        {renderTabContent()}
      </form>

      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Delete Account</h3>
            <p>This action is irreversible. To confirm, please type your name: <strong>{userInfo.name}</strong></p>
            <input 
              type="text" 
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder="Enter your name"
            />
            <div className="modal-actions">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
              <button 
                onClick={handleDeleteAccount} 
                className="btn-danger" 
                disabled={confirmationName !== userInfo.name}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;