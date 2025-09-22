import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
  import logo from '/Zarinka_logo.svg';

const Footer = () => {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <div className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon"><Link to='/'><img className="logo" src={logo} alt="Zarinka logo" /></Link></div>
                            <div className="logo-text">Zarinka</div>
                        </div>
                        <p className="footer-tagline">Sweetness delivered to your doorstep.</p>
                        <div className="footer-social">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaFacebook /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaTwitter /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram /></a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>For Customers</h4>
                            <ul>
                                <li><Link to="/cakes">Browse Cakes</Link></li>
                                <li><Link to="/bakers">Find Bakers</Link></li>
                                <li><Link to="/custom">Custom Cakes</Link></li>
                                <li><Link to="/my-orders">Orders</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>For Bakers</h4>
                            <ul>
                                <li><Link to="/register?role=baker">Join as Baker</Link></li>
                                <li><Link to="/profile">Baker Dashboard</Link></li>
                                <li><Link to="/baker-resources">Baker Resources</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Support</h4>
                            <ul>
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><button onClick={() => setShowTerms(true)}>Terms of Service</button></li>
                                <li><button onClick={() => setShowPrivacy(true)}>Privacy Policy</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-divider"></div>
                <div className="footer-bottom">
                    <p className="footer-year">&copy; {new Date().getFullYear()} Zarinka. All rights reserved.</p>
                    <p className="footer-made-with">Made with <span className="heart">❤</span> in SF</p>
                </div>
            </div>

            {showTerms && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Terms of Service</h2>
                        <p>These are the terms of service. Please read them carefully.</p>
                        <button className="popup-close" onClick={() => setShowTerms(false)}>Close</button>
                    </div>
                </div>
            )}

            {showPrivacy && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Privacy Policy</h2>
                        <p>This is the privacy policy. We respect your privacy.</p>
                        <button className="popup-close" onClick={() => setShowPrivacy(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Footer;