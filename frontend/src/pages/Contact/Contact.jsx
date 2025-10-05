import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, ChevronDown } from 'lucide-react';
import './Contact.scss';

import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
   
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Failed to send message', response.statusText);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "contact_faq_question_place_order",
      answer: "contact_faq_answer_place_order"
    },
    {
      question: "contact_faq_question_custom_designs",
      answer: "contact_faq_answer_custom_designs"
    },
    {
      question: "contact_faq_question_delivery_options",
      answer: "contact_faq_answer_delivery_options"
    },
    {
      question: "contact_faq_question_advance_order",
      answer: "contact_faq_answer_advance_order"
    },
    {
      question: "contact_faq_question_dietary_restrictions",
      answer: "contact_faq_answer_dietary_restrictions"
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">{t('contact_page_title')}</h1>
          <p className="hero-description">
            {t('contact_page_subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="contact-main">
        <div className="contact-top-section">
          {/* Sidebar */}
          <div className="contact-sidebar">
            {/* Contact Information Card */}
            <div className="contact-info-card">
              <h2 className="card-header">
                <MessageCircle size={28} />
                {t('contact_page_contact_information')}
              </h2>
             
              <div className="contact-items">
                <div className="contact-item">
                  <Mail size={20} />
                  <div className="contact-info">
                    <p className="label">{t('contact_page_email')}</p>
                    <p className="value">info@sweetcakes.com</p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <Phone size={20} />
                  <div className="contact-info">
                    <p className="label">{t('contact_page_phone')}</p>
                    <p className="value">+1 (123) 456-7890</p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <MapPin size={20} />
                  <div className="contact-info">
                    <p className="label">{t('contact_page_address')}</p>
                    <p className="value">
                      123 Cake Street<br />
                      Sweet City, CA 90210
                    </p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <Clock size={20} />
                  <div className="contact-info">
                    <p className="label">{t('contact_page_business_hours')}</p>
                    <p className="value">
                      {t('contact_page_mon_fri')}<br />
                      {t('contact_page_sat')}<br />
                      {t('contact_page_sun')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FAQ Accordion */}
          <div className="faq-card">
            <h2 className="card-header">{t('contact_page_faq')}</h2>
           
            <div className="faq-items">
              {faqData.map((faq, index) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <h2 className="card-header">
              <Send size={28} />
              {t('contact_page_send_message_title')}
            </h2>

            {submitStatus === 'success' && (
              <div className="success-message">
                <p>
                  ✅ {t('contact_page_send_message_success')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('contact_page_full_name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t('contact_page_full_name_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contact_page_email_address')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t('contact_page_email_placeholder')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">{t('contact_page_subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder={t('contact_page_subject_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">{t('contact_page_category')}</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">{t('contact_page_select_category')}</option>
                    <option value="order">{t('contact_page_order_inquiry')}</option>
                    <option value="custom">{t('contact_page_custom_cake_request')}</option>
                    <option value="feedback">{t('contact_page_feedback')}</option>
                    <option value="delivery">{t('contact_page_delivery_question')}</option>
                    <option value="other">{t('contact_page_other')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('contact_page_message')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder={t('contact_page_message_placeholder')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    {t('contact_page_sending')}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t('contact_page_send_message')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;