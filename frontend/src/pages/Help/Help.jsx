import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, Mail, ChevronDown, MessageCircle, FileText, Shield, DollarSign } from 'lucide-react';
import './Help.scss';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showRefundPopup, setShowRefundPopup] = useState(false);

  const faqData = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you will receive an email with a tracking number and a link to track your package."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "Order changes or cancellations are possible within 24 hours of placement. Please contact our support team immediately."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within the country. We are working on expanding our shipping options soon."
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const filteredFaq = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Placeholder for user role check (e.g., from context or auth state)
  const isBaker = true; // This should be dynamic based on user's role

  return (
    <div className="help-page">
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">How can we help you?</h1>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search for topics or questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="help-main-content">
        <div className="help-sections">
          {/* Contact Support Link */}
          <Link to="/contact" className="contact-support-link">
            <MessageCircle size={20} />
            Contact Support
          </Link>
          {/* Policy Buttons */}
          <div className="policy-buttons">
            <button onClick={() => setShowTermsPopup(true)} className="policy-button">
              <FileText size={20} />
              Terms of Service
            </button>
            <button onClick={() => setShowPrivacyPopup(true)} className="policy-button">
              <Shield size={20} />
              Privacy Policy
            </button>
            <button onClick={() => setShowRefundPopup(true)} className="policy-button">
              <DollarSign size={20} />
              Refund Policy
            </button>
             {/* Baker Resources (Conditional) */}
          {isBaker && (
            <div className="baker-resources-card">
              <h2>Baker Resources</h2>
              <p>Find guides and tools for managing your bakery.</p>
              <Link to="/baker-dashboard" className="button-link">Go to Baker Dashboard</Link>
            </div>
          )}
          </div>
          {/* Support Contact Cards */}
          <div className="support-contact-cards">
            <div className="support-card">
              <Phone size={24} />
              <h3>Phone Support</h3>
              <p>+1 (123) 456-7890</p>
              <span>Mon-Fri, 9 AM - 6 PM</span>
            </div>
            <div className="support-card">
              <Mail size={24} />
              <h3>Email Support</h3>
              <p>support@sweetcakes.com</p>
              <span>We typically reply within 24 hours</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-items">
            {filteredFaq.length > 0 ? (
              filteredFaq.map((faq, index) => (
                <div key={index} className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`faq-question ${openFaqIndex === index ? 'active' : ''}`}
                  >
                    {faq.question}
                    <ChevronDown
                      size={16}
                      className={openFaqIndex === index ? 'rotated' : ''}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="faq-answer">
                      <p className="answer-content">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-results">No FAQs found matching your search.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popups for Policies */}
      {showTermsPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowTermsPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Terms of Service</h3>
            <p>These are our terms of service. Please read them carefully.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <button onClick={() => setShowTermsPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {showPrivacyPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowPrivacyPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Privacy Policy</h3>
            <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <button onClick={() => setShowPrivacyPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {showRefundPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowRefundPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Refund Policy</h3>
            <p>All sales are final. We do not offer refunds for digital products or custom orders once production has begun.</p>
            <p>For physical products, refunds may be considered on a case-by-case basis within 7 days of purchase, provided the item is unused and in its original packaging. Shipping costs are non-refundable.</p>
            <button onClick={() => setShowRefundPopup(false)}>Close</button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Help;