// frontend/src/pages/About.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, adminCategoryAPI } from '../services/api';
import '../assets/css/about.css';

const About = () => {
    const [stats, setStats] = useState({
        customers: 0,
        products: 0,
        orders: 0,
        years: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch products count
            const productsRes = await productAPI.getAll({ limit: 1 });
            const productCount = productsRes.data.totalProducts || 0;

            // Fetch categories count
            const categoriesRes = await adminCategoryAPI.getAll({ isActive: true });
            const categoryCount = categoriesRes.data.total || 0;

            setStats({
                customers: 12500,
                products: productCount,
                orders: 8750,
                years: 3
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback stats
            setStats({
                customers: 12500,
                products: 500,
                orders: 8750,
                years: 3
            });
        } finally {
            setLoading(false);
        }
    };

    const values = [
        {
            icon: 'fas fa-heart',
            title: 'Customer First',
            description: 'We prioritize our customers\' needs and strive to provide the best shopping experience possible.'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Trust & Transparency',
            description: 'We believe in honest business practices and maintain complete transparency with our customers.'
        },
        {
            icon: 'fas fa-leaf',
            title: 'Sustainability',
            description: 'We are committed to sustainable practices and eco-friendly packaging for a better tomorrow.'
        },
        {
            icon: 'fas fa-bolt',
            title: 'Innovation',
            description: 'We continuously innovate to bring you the latest products and best shopping experience.'
        },
        {
            icon: 'fas fa-users',
            title: 'Community',
            description: 'We build a community of happy customers and support local businesses and artisans.'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Growth',
            description: 'We are constantly growing and improving to serve you better every day.'
        }
    ];

    const team = [
        {
            name: 'Rajesh Kumar',
            position: 'Founder & CEO',
            image: '/Blog2.jpg',
            bio: 'Visionary leader with 15+ years of e-commerce experience.',
            social: {
                linkedin: '#',
                twitter: '#'
            }
        },
        {
            name: 'Priya Sharma',
            position: 'Head of Operations',
            image: '/Blog2.jpg',
            bio: 'Ensures smooth operations and customer satisfaction.',
            social: {
                linkedin: '#',
                twitter: '#'
            }
        },
        {
            name: 'Amit Patel',
            position: 'Tech Lead',
            image: '/Blog2.jpg',
            bio: 'Leading technology innovation and platform development.',
            social: {
                linkedin: '#',
                github: '#'
            }
        },
        {
            name: 'Neha Gupta',
            position: 'Customer Experience Head',
            image: '/Blog2.jpg',
            bio: 'Passionate about delivering exceptional customer service.',
            social: {
                linkedin: '#',
                twitter: '#'
            }
        }
    ];

    const milestones = [
        { year: '2021', title: 'Company Founded', description: 'Started our journey with a vision to revolutionize online shopping.' },
        { year: '2022', title: 'First 10,000 Customers', description: 'Reached milestone of 10,000 happy customers across India.' },
        { year: '2023', title: 'Expanded Product Range', description: 'Added 500+ new products across multiple categories.' },
        { year: '2024', title: 'Launched Mobile App', description: 'Made shopping easier with our new mobile application.' }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <div className="about-hero">
                <div className="container-about">
                    <h1>About SHARNETIC TECHNOLOGIES</h1>
                    <p>Redefining online shopping experience with quality, trust, and innovation</p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="container-about">
                    <div className="stats-grid">
                        <div className="stat-card" data-aos="fade-up">
                            <div className="stat-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="stat-number">{stats.customers.toLocaleString()}+</div>
                            <div className="stat-label">Happy Customers</div>
                        </div>
                        <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="stat-icon">
                                <i className="fas fa-box"></i>
                            </div>
                            <div className="stat-number">{stats.products.toLocaleString()}+</div>
                            <div className="stat-label">Products</div>
                        </div>
                        <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="stat-icon">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                            <div className="stat-number">{stats.orders.toLocaleString()}+</div>
                            <div className="stat-label">Orders Delivered</div>
                        </div>
                        <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                            <div className="stat-icon">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="stat-number">{stats.years}+</div>
                            <div className="stat-label">Years of Excellence</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="story-section">
                <div className="container-about">
                    <div className="story-grid">
                        <div className="story-content" data-aos="fade-right">
                            <h2>Our Story</h2>
                            <p className="story-subtitle">From humble beginnings to your favorite online store</p>
                            <p>SHARNETIC TECHNOLOGIES PRIVATE LIMITED was founded in 2021 with a simple vision: to make quality products accessible to everyone, everywhere. What started as a small team of passionate individuals has grown into a trusted e-commerce platform serving thousands of customers across India.</p>
                            <p>We believe that online shopping should be simple, secure, and enjoyable. That's why we've curated a wide range of products from trusted brands and artisans, ensuring quality at every step. Our commitment to customer satisfaction drives everything we do, from product selection to fast delivery and easy returns.</p>
                            <p>Today, we're proud to be one of India's fastest-growing e-commerce platforms, but our journey is just beginning. We're constantly evolving, adding new products, and improving our services to serve you better.</p>
                            <Link to="/contact" className="story-btn">
                                Get in Touch
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                        <div className="story-image" data-aos="fade-left">
                            <img src="/about.jpg" alt="Our Story" />
                            <div className="story-badge">
                                <i className="fas fa-star"></i>
                                <span>Trusted by 10,000+ Customers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="mission-vision">
                <div className="container-about">
                    <div className="mv-grid">
                        <div className="mv-card mission" data-aos="fade-right">
                            <div className="mv-icon">
                                <i className="fas fa-bullseye"></i>
                            </div>
                            <h3>Our Mission</h3>
                            <p>To democratize online shopping by providing quality products at affordable prices, with exceptional customer service and a seamless shopping experience.</p>
                        </div>
                        <div className="mv-card vision" data-aos="fade-left">
                            <div className="mv-icon">
                                <i className="fas fa-eye"></i>
                            </div>
                            <h3>Our Vision</h3>
                            <p>To become India's most trusted and loved e-commerce platform, empowering millions of customers and supporting local businesses and artisans.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="values-section">
                <div className="container-about">
                    <div className="section-header">
                        <h2>Our Core Values</h2>
                        <p>The principles that guide everything we do</p>
                    </div>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card" data-aos="fade-up" data-aos-delay={index * 100}>
                                <div className="value-icon">
                                    <i className={value.icon}></i>
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="team-section">
                <div className="container-about">
                    <div className="section-header">
                        <h2>Meet Our Leadership</h2>
                        <p>The passionate team behind your favorite shopping destination</p>
                    </div>
                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div key={index} className="team-card" data-aos="fade-up" data-aos-delay={index * 100}>
                                <div className="team-image">
                                    <img src={member.image} alt={member.name} />
                                    <div className="team-social">
                                        {member.social.linkedin && (
                                            <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-linkedin-in"></i>
                                            </a>
                                        )}
                                        {member.social.twitter && (
                                            <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-twitter"></i>
                                            </a>
                                        )}
                                        {member.social.github && (
                                            <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-github"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="team-info">
                                    <h3>{member.name}</h3>
                                    <p className="team-position">{member.position}</p>
                                    <p className="team-bio">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="why-choose-section">
                <div className="container-about">
                    <div className="section-header">
                        <h2>Why Choose SHARNETIC?</h2>
                        <p>What makes us different from the rest</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card" data-aos="fade-up">
                            <div className="feature-icon">
                                <i className="fas fa-truck-fast"></i>
                            </div>
                            <h3>Fast Delivery</h3>
                            <p>Guaranteed delivery within 3-7 business days across India</p>
                        </div>
                        <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="feature-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure Payments</h3>
                            <p>100% secure transactions with multiple payment options</p>
                        </div>
                        <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="feature-icon">
                                <i className="fas fa-undo-alt"></i>
                            </div>
                            <h3>Easy Returns</h3>
                            <p>10-day hassle-free return policy for your peace of mind</p>
                        </div>
                        <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
                            <div className="feature-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Dedicated customer support team always ready to help</p>
                        </div>
                        <div className="feature-card" data-aos="fade-up" data-aos-delay="400">
                            <div className="feature-icon">
                                <i className="fas fa-gem"></i>
                            </div>
                            <h3>Quality Assured</h3>
                            <p>Every product undergoes strict quality checks</p>
                        </div>
                        <div className="feature-card" data-aos="fade-up" data-aos-delay="500">
                            <div className="feature-icon">
                                <i className="fas fa-gift"></i>
                            </div>
                            <h3>Best Offers</h3>
                            <p>Exclusive deals and discounts for our loyal customers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="testimonials-section">
                <div className="container-about">
                    <div className="section-header">
                        <h2>What Our Customers Say</h2>
                        <p>Real stories from real customers</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card" data-aos="fade-up">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star"></i>
                                ))}
                            </div>
                            <p className="testimonial-text">"Excellent shopping experience! The product quality is amazing and delivery was faster than expected. Highly recommended!"</p>
                            <div className="testimonial-author">
                                <img src="/Blog2.jpg" alt="Customer" />
                                <div>
                                    <h4>Rahul Mehta</h4>
                                    <p>Verified Buyer</p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star"></i>
                                ))}
                            </div>
                            <p className="testimonial-text">"Great customer service! Had an issue with my order and they resolved it immediately. Will definitely shop again."</p>
                            <div className="testimonial-author">
                                <img src="/Blog2.jpg" alt="Customer" />
                                <div>
                                    <h4>Priya Singh</h4>
                                    <p>Verified Buyer</p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="testimonial-rating">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star"></i>
                                ))}
                            </div>
                            <p className="testimonial-text">"Best online shopping platform! Wide variety of products and amazing discounts. Love shopping here!"</p>
                            <div className="testimonial-author">
                                <img src="/Blog2.jpg" alt="Customer" />
                                <div>
                                    <h4>Amit Kumar</h4>
                                    <p>Verified Buyer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <div className="container-about">
                    <div className="cta-content">
                        <h2>Ready to Start Shopping?</h2>
                        <p>Join thousands of happy customers who trust SHARNETIC for their shopping needs</p>
                        <div className="cta-buttons">
                            <Link to="/shop" className="cta-btn-primary">
                                Shop Now
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                            <Link to="/contact" className="cta-btn-secondary">
                                Contact Us
                                <i className="fas fa-envelope"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;