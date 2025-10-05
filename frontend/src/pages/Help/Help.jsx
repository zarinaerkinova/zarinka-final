import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, Mail, ChevronDown, MessageCircle, FileText, Shield, DollarSign } from 'lucide-react';
import './Help.scss';

import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showRefundPopup, setShowRefundPopup] = useState(false);

  const faqData = [
    {
      question: "faq_question_reset_password",
      answer: "faq_answer_reset_password"
    },
    {
      question: "faq_question_track_order",
      answer: "faq_answer_track_order"
    },
    {
      question: "faq_question_payment_methods",
      answer: "faq_answer_payment_methods"
    },
    {
      question: "faq_question_change_cancel_order",
      answer: "faq_answer_change_cancel_order"
    },
    {
      question: "faq_question_international_shipping",
      answer: "faq_answer_international_shipping"
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const filteredFaq = faqData.filter(faq =>
    t(faq.question).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t(faq.answer).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Placeholder for user role check (e.g., from context or auth state)
  const isBaker = true; // This should be dynamic based on user's role

  return (
    <div className="help-page">
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">{t('help_page_title')}</h1>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('help_page_search_placeholder')}
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
            {t('help_page_contact_support')}
          </Link>
          {/* Policy Buttons */}
          <div className="policy-buttons">
            <button onClick={() => setShowTermsPopup(true)} className="policy-button">
              <FileText size={20} />
              {t('help_page_terms_of_service')}
            </button>
            <button onClick={() => setShowPrivacyPopup(true)} className="policy-button">
              <Shield size={20} />
              {t('help_page_privacy_policy')}
            </button>
            <button onClick={() => setShowRefundPopup(true)} className="policy-button">
              <DollarSign size={20} />
              {t('help_page_refund_policy')}
            </button>
             {/* Baker Resources (Conditional) */}
          {isBaker && (
            <div className="baker-resources-card">
              <h2>{t('help_page_baker_resources')}</h2>
              <p>{t('help_page_baker_resources_subtitle')}</p>
              <Link to="/baker-dashboard" className="button-link">{t('help_page_go_to_baker_dashboard')}</Link>
            </div>
          )}
          </div>
          {/* Support Contact Cards */}
          <div className="support-contact-cards">
            <div className="support-card">
              <Phone size={24} />
              <h3>{t('help_page_phone_support')}</h3>
              <p>+1 (123) 456-7890</p>
              <span>{t('help_page_phone_support_hours')}</span>
            </div>
            <div className="support-card">
              <Mail size={24} />
              <h3>{t('help_page_email_support')}</h3>
              <p>support@sweetcakes.com</p>
              <span>{t('help_page_email_support_reply')}</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>{t('help_page_faq')}</h2>
          <div className="faq-items">
            {filteredFaq.length > 0 ? (
              filteredFaq.map((faq, index) => (
                <div key={index} className={`faq-item ${openFaqIndex === index ? 'active' : ''}`}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`faq-question ${openFaqIndex === index ? 'active' : ''}`}
                  >
                    {t(faq.question)}
                    <ChevronDown
                      size={16}
                      className={openFaqIndex === index ? 'rotated' : ''}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="faq-answer">
                      <p className="answer-content">
                        {t(faq.answer)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-results">{t('help_page_no_faq')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Popups for Policies */}
      {showTermsPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowTermsPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('help_page_terms_of_service')}</h3>
            <p>{t('help_page_terms_of_service_text')}</p>
            <p>{t('help_page_terms_lorem')}</p>
            <button onClick={() => setShowTermsPopup(false)}>{t('help_page_close')}</button>
          </div>
        </div>
      )}

      {showPrivacyPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowPrivacyPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('help_page_privacy_policy')}</h3>
            <p>{t('help_page_privacy_policy_text')}</p>
            <p>{t('help_page_privacy_lorem')}</p>
            <button onClick={() => setShowPrivacyPopup(false)}>{t('help_page_close')}</button>
          </div>
        </div>
      )}

      {showRefundPopup && (
        <div className="policy-popup-overlay" onClick={() => setShowRefundPopup(false)}>
          <div className="policy-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('help_page_refund_policy')}</h3>
            <p>{t('help_page_refund_policy_text_1')}</p>
            <p>{t('help_page_refund_policy_text_2')}</p>
            <button onClick={() => setShowRefundPopup(false)}>{t('help_page_close')}</button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Help;