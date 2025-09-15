import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, ChevronDown } from 'lucide-react';
import './Contact.scss';

const Contact = () => {
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
      question: "How can I place an order?",
      answer: "You can place an order directly through our website by adding items to your cart and proceeding to checkout. We also accept phone orders during business hours."
    },
    {
      question: "Do you offer custom cake designs?",
      answer: "Yes, we specialize in custom cake designs! Please use the contact form below to discuss your requirements with our design team. We recommend placing custom orders at least 3-5 days in advance."
    },
    {
      question: "What are your delivery options?",
      answer: "We offer local delivery within a 20-mile radius of our bakery. Delivery fees start at $10 and vary based on distance. We also provide pickup options if you prefer to collect your order."
    },
    {
      question: "How far in advance should I order?",
      answer: "For regular cakes from our menu, we recommend ordering at least 24 hours in advance. For custom designs and special occasions, please allow 3-5 days notice to ensure we can create exactly what you envision."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Absolutely! We offer gluten-free, sugar-free, vegan, and other dietary-friendly options. Please mention your specific requirements when placing your order so we can ensure your cake meets your needs."
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">Get in Touch</h1>
          <p className="hero-description">
            Have questions about our cakes or need a custom design? We'd love to hear from you!
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
                Contact Information
              </h2>
             
              <div className="contact-items">
                <div className="contact-item">
                  <Mail size={20} />
                  <div className="contact-info">
                    <p className="label">Email</p>
                    <p className="value">info@sweetcakes.com</p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <Phone size={20} />
                  <div className="contact-info">
                    <p className="label">Phone</p>
                    <p className="value">+1 (123) 456-7890</p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <MapPin size={20} />
                  <div className="contact-info">
                    <p className="label">Address</p>
                    <p className="value">
                      123 Cake Street<br />
                      Sweet City, CA 90210
                    </p>
                  </div>
                </div>
               
                <div className="contact-item">
                  <Clock size={20} />
                  <div className="contact-info">
                    <p className="label">Business Hours</p>
                    <p className="value">
                      Mon-Fri: 9 AM - 6 PM<br />
                      Sat: 10 AM - 4 PM<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FAQ Accordion */}
          <div className="faq-card">
            <h2 className="card-header">Frequently Asked Questions</h2>
           
            <div className="faq-items">
              {faqData.map((faq, index) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <h2 className="card-header">
              <Send size={28} />
              Send us a Message
            </h2>

            {submitStatus === 'success' && (
              <div className="success-message">
                <p>
                  ✅ Message sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="What's this about?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    <option value="order">Order Inquiry</option>
                    <option value="custom">Custom Cake Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="delivery">Delivery Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
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