import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  FaBoxOpen,
  FaCog,
  FaQuestionCircle,
  FaRegHeart,
  FaRegUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { IoCartOutline } from 'react-icons/io5';
import { Globe } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useOutsideAlerter from '../../hooks/useOutsideAlerter';
import { useUserStore } from '../../store/User.js';
import './Navbar.css';
import logo from '/Zarinka_logo.svg';

// Language configuration
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
];

// Language Switcher Component
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const langRef = useRef(null);

  useOutsideAlerter(langRef, () => setIsOpen(false));

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  }, [i18n]);

  const currentLanguage = useMemo(
    () => LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0],
    [i18n.language]
  );

  return (
    <div className="language-switcher" ref={langRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="language-switcher-toggle"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={20} />
        {/* <span className="current-lang">{currentLanguage.flag}</span> */}
      </button>
      
      {isOpen && (
        <ul className="language-switcher-menu">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                className={`language-switcher-item ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                aria-label={`Switch to ${lang.name}`}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.name}</span>
                {i18n.language === lang.code && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Profile Dropdown Component
const ProfileDropdown = ({ user, onLogout, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="custom-dropdown-menu">
      {user ? (
        <>
          <div className="profile-header">
            <FaUserCircle size={45} />
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider" />
          
          <Link to="/profile" onClick={onClose} className="dropdown-item">
            <FaUserCircle />
            <span>{t('profile') || 'Profile'}</span>
          </Link>
          
          <Link to="/my-orders" onClick={onClose} className="dropdown-item">
            <FaBoxOpen />
            <span>{t('orders') || 'Orders'}</span>
          </Link>
          
          <Link to="/settings" onClick={onClose} className="dropdown-item">
            <FaCog />
            <span>{t('settings') || 'Settings'}</span>
          </Link>
          
          <Link to="/help" onClick={onClose} className="dropdown-item">
            <FaQuestionCircle />
            <span>{t('help') || 'Help & Support'}</span>
          </Link>
          
          <div className="dropdown-divider" />
          
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="dropdown-item logout-item"
          >
            <FaSignOutAlt />
            <span>{t('sign_out') || 'Sign Out'}</span>
          </button>
        </>
      ) : (
        <Link to="/register" onClick={onClose} className="dropdown-item">
          <FaSignInAlt />
          <span>{t('sign_in') || 'Sign In / Sign Up'}</span>
        </Link>
      )}
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const { t } = useTranslation();
  const { user, token, setUserData, logoutUser } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideAlerter(dropdownRef, () => setShowDropdown(false));

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedUser !== 'undefined' && storedToken && !user && !token) {
      try {
        setUserData({
          user: JSON.parse(storedUser),
          token: storedToken,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [user, token, setUserData]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleMenuItemClick = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return (
    <nav className={`mainNav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="block">
          <Link to="/" className="logo-link" aria-label="Go to homepage">
            <img className="logo" src={logo} alt="Zarinka logo" />
          </Link>

          <nav className="menu-header" aria-label="Main navigation">
            <NavLink to="/cakes" className={({ isActive }) => isActive ? 'active' : ''}>
              {t('browse_cakes') || 'Browse Cakes'}
            </NavLink>
            <NavLink to="/bakers" className={({ isActive }) => isActive ? 'active' : ''}>
              {t('find_bakers') || 'Find Bakers'}
            </NavLink>
            <NavLink to="/custom" className={({ isActive }) => isActive ? 'active' : ''}>
              {t('custom_cakes') || 'Custom Cakes'}
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
              {t('contact') || 'Contact'}
            </NavLink>
            <NavLink to="/help" className={({ isActive }) => isActive ? 'active' : ''}>
              {t('help') || 'Help'}
            </NavLink>
          </nav>
        </div>

        <div className="icons">
          {token && user && (
            <>
              <Link 
                className="cart-icon" 
                to="/cart" 
                aria-label={t('cart') || 'View cart'}
                title={t('cart') || 'Cart'}
              >
                <IoCartOutline />
              </Link>
              
              <Link 
                className="favorite" 
                to="/favorite" 
                aria-label={t('favorites') || 'View favorites'}
                title={t('favorites') || 'Favorites'}
              >
                <FaRegHeart />
              </Link>
            </>
          )}

          <LanguageSwitcher />

          <div className="custom-dropdown" ref={dropdownRef}>
            <button
              className="custom-dropdown-toggle"
              onClick={handleDropdownToggle}
              aria-label="User menu"
              aria-expanded={showDropdown}
            >
              <FaRegUser />
            </button>

            {showDropdown && (
              <ProfileDropdown
                user={user}
                onLogout={logoutUser}
                onClose={handleMenuItemClick}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;