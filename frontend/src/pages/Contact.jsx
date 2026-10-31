// frontend/src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import '../assets/css/contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showToast } = useToast();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Replace with your actual API endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                showToast(data.message || 'Failed to send message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showToast('Failed to send message. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: 'fas fa-map-marker-alt',
            title: 'Visit Us',
            details: ['123 Business Park', 'MG Road, Bangalore', 'Karnataka - 560001', 'India']
        },
        {
            icon: 'fas fa-phone-alt',
            title: 'Call Us',
            details: ['+91 98765 43210', '+91 12345 67890'],
            action: 'tel:+919876543210'
        },
        {
            icon: 'fas fa-envelope',
            title: 'Email Us',
            details: ['support@finoxis.com', 'careers@finoxis.com'],
            action: 'mailto:support@finoxis.com'
        },
        {
            icon: 'fas fa-clock',
            title: 'Business Hours',
            details: ['Monday - Friday: 9:00 AM - 7:00 PM', 'Saturday: 10:00 AM - 5:00 PM', 'Sunday: Closed']
        }
    ];

    const faqs = [
        {
            question: 'How can I track my order?',
            answer: 'You can track your order by logging into your account and visiting the "My Orders" section. You\'ll also receive tracking updates via email and SMS.'
        },
        {
            question: 'What is your return policy?',
            answer: 'We offer a 10-day easy return policy on most products. Items must be unused and in original packaging. Some products may have specific return conditions.'
        },
        {
            question: 'Do you offer international shipping?',
            answer: 'Currently, we ship only within India. We are working on expanding our shipping network internationally.'
        },
        {
            question: 'How long does delivery take?',
            answer: 'Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive delivery within 2-4 days.'
        },
        {
            question: 'Is my payment information secure?',
            answer: 'Yes, we use industry-standard SSL encryption and secure payment gateways to protect your payment information.'
        },
        {
            question: 'Can I cancel my order?',
            answer: 'Orders can be cancelled within 24 hours of placement or before shipment, whichever is earlier. You can cancel from your account or contact support.'
        }
    ];

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <div className="contact-hero">
                <div className="container-contact">
                    <h1>Get in Touch</h1>
                    <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </div>

            <div className="container-contact">
                {/* Contact Info Cards */}
                <div className="contact-info-grid">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="contact-info-card" data-aos="fade-up" data-aos-delay={index * 100}>
                            <div className="info-icon">
                                <i className={info.icon}></i>
                            </div>
                            <h3>{info.title}</h3>
                            {info.action ? (
                                <a href={info.action} className="info-details">
                                    {info.details.map((detail, idx) => (
                                        <p key={idx}>{detail}</p>
                                    ))}
                                </a>
                            ) : (
                                <div className="info-details">
                                    {info.details.map((detail, idx) => (
                                        <p key={idx}>{detail}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Form and Map Section */}
                <div className="contact-form-section">
                    <div className="form-container" data-aos="fade-right">
                        <h2>Send Us a Message</h2>
                        <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        Full Name <span className="required">*</span>
                                    </label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className={errors.name ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        Email Address <span className="required">*</span>
                                    </label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className={errors.email ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number (Optional)</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-phone"></i>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className={errors.phone ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">
                                        Subject <span className="required">*</span>
                                    </label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-tag"></i>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What is this regarding?"
                                            className={errors.subject ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="message">
                                    Message <span className="required">*</span>
                                </label>
                                <div className="textarea-wrapper">
                                    <i className="fas fa-comment"></i>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us how we can help you..."
                                        className={errors.message ? 'error' : ''}
                                    ></textarea>
                                </div>
                                {errors.message && <span className="error-message">{errors.message}</span>}
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="map-container" data-aos="fade-left">
                        <h2>Find Us Here</h2>
                        <div className="map-wrapper">
                            <iframe
                                title="Finoxis Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.032452429929!2d77.59473531482268!3d12.971598790858384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3c8517e4fe0!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1698765432100!5m2!1sen!2sin"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        <div className="map-address">
                            <i className="fas fa-location-dot"></i>
                            <p>123 Business Park, MG Road, Bangalore, Karnataka - 560001, India</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <div className="faq-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>Can't find what you're looking for? Check out our most common questions.</p>
                    </div>
                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-card" data-aos="fade-up" data-aos-delay={index * 50}>
                                <div className="faq-icon">
                                    <i className="fas fa-question-circle"></i>
                                </div>
                                <div className="faq-content">
                                    <h3>{faq.question}</h3>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Connect Section */}
                <div className="social-connect">
                    <h2>Connect With Us</h2>
                    <p>Follow us on social media for updates, offers, and more</p>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                            <i className="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;