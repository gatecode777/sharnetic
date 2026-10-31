import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    // Back to Top functionality
    useEffect(() => {
        const handleScroll = () => {
            const backToTopButton = document.getElementById('backToTop');
            if (backToTopButton) {
                if (window.pageYOffset > 300) {
                    backToTopButton.style.display = 'flex';
                } else {
                    backToTopButton.style.display = 'none';
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);

    const handleAnchorClick = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="inline-flex items-center text-sm text-gray-700 hover:text-blue-600">
                                <i className="fas fa-home mr-2"></i> Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                                <span className="text-sm font-medium text-gray-500">Privacy Policy</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Privacy Policy Content */}
            <div className="policy-container max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Last updated: June 2025</p>
                </div>

                {/* Content Navigation */}
                <div className="content-nav bg-gray-50 p-4 rounded-lg mb-8">
                    <h3 className="font-bold text-gray-800 mb-3">Quick Navigation</h3>
                    <ul className="nav-links grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <li><a href="#introduction" onClick={(e) => handleAnchorClick(e, '#introduction')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Introduction</a></li>
                        <li><a href="#information-we-collect" onClick={(e) => handleAnchorClick(e, '#information-we-collect')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Information We Collect</a></li>
                        <li><a href="#how-we-use" onClick={(e) => handleAnchorClick(e, '#how-we-use')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> How We Use Your Info</a></li>
                        <li><a href="#data-protection" onClick={(e) => handleAnchorClick(e, '#data-protection')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Data Protection</a></li>
                        <li><a href="#cookies" onClick={(e) => handleAnchorClick(e, '#cookies')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Cookies</a></li>
                        <li><a href="#third-party" onClick={(e) => handleAnchorClick(e, '#third-party')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Third-Party Services</a></li>
                        <li><a href="#your-rights" onClick={(e) => handleAnchorClick(e, '#your-rights')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Your Rights</a></li>
                        <li><a href="#contact" onClick={(e) => handleAnchorClick(e, '#contact')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Contact Us</a></li>
                    </ul>
                </div>

                {/* Introduction */}
                <div className="policy-section mb-8" id="introduction">
                    <div className="highlight-box bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="mb-0 text-gray-700">
                            At <strong>Finoxis Technologies</strong>, we are committed to protecting your privacy and ensuring the security of your personal information.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </p>
                    </div>
                </div>

                {/* Information We Collect */}
                <div className="policy-section mb-8" id="information-we-collect">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                        Information We Collect
                    </h2>

                    <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Personal Information</h4>
                            <p className="text-gray-700">Name, email address, phone number, shipping address, and payment details when you make a purchase.</p>
                        </div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Account Information</h4>
                            <p className="text-gray-700">Username, password, and profile information when you create an account on our platform.</p>
                        </div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Transaction Information</h4>
                            <p className="text-gray-700">Details about purchases you make, including products, prices, and payment methods.</p>
                        </div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Technical Information</h4>
                            <p className="text-gray-700">IP address, browser type, device information, and cookies when you browse our website.</p>
                        </div>
                    </div>

                    <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-3">Automatic Data Collection</h3>
                    <p className="text-gray-700 mb-4">
                        We automatically collect certain information when you visit our website, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Device information (type, operating system, browser)</li>
                        <li>Log information (IP address, access times, pages viewed)</li>
                        <li>Location information (approximate location based on IP address)</li>
                        <li>Usage data (how you interact with our website)</li>
                    </ul>
                </div>

                {/* How We Use Your Information */}
                <div className="policy-section mb-8" id="how-we-use">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-cogs text-green-600 mr-2"></i>
                        How We Use Your Information
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="data-table w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                                    <th className="border border-gray-300 p-2 text-left">Examples</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-gray-300 p-2"><strong>Order Processing</strong></td><td className="border border-gray-300 p-2">To process and fulfill your orders, send order confirmations, and provide customer support</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Account Management</strong></td><td className="border border-gray-300 p-2">To create and manage your account, authenticate you, and maintain your preferences</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Communication</strong></td><td className="border border-gray-300 p-2">To send transactional emails, order updates, and respond to your inquiries</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Service Improvement</strong></td><td className="border border-gray-300 p-2">To analyze website usage, improve our services, and develop new features</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Marketing</strong></td><td className="border border-gray-300 p-2">To send promotional offers, newsletters, and product recommendations (with your consent)</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Security</strong></td><td className="border border-gray-300 p-2">To detect and prevent fraud, unauthorized activities, and security breaches</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Data Protection */}
                <div className="policy-section mb-8" id="data-protection">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-shield-alt text-red-600 mr-2"></i>
                        Data Protection & Security
                    </h2>

                    <p className="text-gray-700 mb-4">
                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Security Measures</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>SSL encryption for data transmission</li>
                                <li>Secure servers with firewalls</li>
                                <li>Regular security audits</li>
                                <li>Access controls and authentication</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Data Retention</h4>
                            <p className="text-gray-700">
                                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cookies */}
                <div className="policy-section mb-8" id="cookies">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-cookie-bite text-orange-600 mr-2"></i>
                        Cookies & Tracking Technologies
                    </h2>

                    <p className="text-gray-700 mb-4">
                        We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content.
                    </p>

                    <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-3">Types of Cookies We Use</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr><th className="border border-gray-300 p-2">Type</th><th className="border border-gray-300 p-2">Purpose</th><th className="border border-gray-300 p-2">Duration</th></tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-gray-300 p-2"><strong>Essential Cookies</strong></td><td className="border border-gray-300 p-2">Required for basic site functionality</td><td className="border border-gray-300 p-2">Session</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Performance Cookies</strong></td><td className="border border-gray-300 p-2">Collect anonymous data for analytics</td><td className="border border-gray-300 p-2">1-2 years</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Functionality Cookies</strong></td><td className="border border-gray-300 p-2">Remember your preferences</td><td className="border border-gray-300 p-2">Up to 1 year</td></tr>
                                <tr><td className="border border-gray-300 p-2"><strong>Advertising Cookies</strong></td><td className="border border-gray-300 p-2">Deliver relevant advertisements</td><td className="border border-gray-300 p-2">Up to 1 year</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-bold text-blue-800 mb-2">Cookie Management</h4>
                        <p className="text-blue-700">
                            You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
                        </p>
                    </div>
                </div>

                {/* Third-Party Services */}
                <div className="policy-section mb-8" id="third-party">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-exchange-alt text-purple-600 mr-2"></i>
                        Third-Party Services
                    </h2>

                    <p className="text-gray-700 mb-4">
                        We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Payment Processors</h4><p className="text-gray-700">Secure payment gateways for transaction processing</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Shipping Partners</h4><p className="text-gray-700">Logistics companies for order delivery</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Analytics Providers</h4><p className="text-gray-700">Tools for analyzing website usage and performance</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Marketing Services</h4><p className="text-gray-700">Platforms for email marketing and promotions</p></div>
                    </div>

                    <p className="text-gray-700">
                        These third-party providers are contractually obligated to protect your information and are prohibited from using it for any other purpose.
                    </p>
                </div>

                {/* Your Rights */}
                <div className="policy-section mb-8" id="your-rights">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-user-check text-teal-600 mr-2"></i>
                        Your Privacy Rights
                    </h2>

                    <p className="text-gray-700 mb-4">
                        You have certain rights regarding your personal information under applicable data protection laws:
                    </p>

                    <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="info-card bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Access Right</h4><p className="text-gray-700">Request access to the personal information we hold about you</p></div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Correction Right</h4><p className="text-gray-700">Request correction of inaccurate or incomplete information</p></div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Deletion Right</h4><p className="text-gray-700">Request deletion of your personal information in certain circumstances</p></div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg"><h4 className="font-bold text-gray-800 mb-2">Objection Right</h4><p className="text-gray-700">Object to processing of your personal information for marketing purposes</p></div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-bold text-green-800 mb-2">How to Exercise Your Rights</h4>
                        <p className="text-green-700">
                            To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
                        </p>
                    </div>
                </div>

                {/* Contact Us */}
                <div className="policy-section mb-8" id="contact">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-envelope text-yellow-600 mr-2"></i>
                        Contact Us
                    </h2>

                    <p className="text-gray-700 mb-4">
                        If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-3 text-gray-800">Contact Information</h4>
                                <div className="space-y-2 text-gray-700">
                                    <p><i className="fas fa-envelope mr-2 text-blue-600"></i> Email: support@finoxis.com</p>
                                    <p><i className="fas fa-phone mr-2 text-blue-600"></i> Phone: +91 82201 53747</p>
                                    <p><i className="fas fa-map-marker-alt mr-2 text-blue-600"></i> Address: PLOT NO.-B, 404, 4TH FLOOR, MANSAROVAR PLAZA, SECTOR-07, Jaipur</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-3 text-gray-800">Data Protection Officer</h4>
                                <p className="text-gray-700">
                                    For data protection related inquiries, please contact our Data Protection Officer at:
                                    <a href="mailto:dpo@finoxis.com" className="text-blue-600 hover:underline block mt-1">dpo@finoxis.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policy Updates */}
                <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Policy Updates
                    </h3>
                    <p className="text-yellow-700">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                    </p>
                    <p className="text-sm text-yellow-600 mt-3">
                        <strong>Last Updated:</strong> June 2025
                    </p>
                </div>

                {/* Related Policies */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Related Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link to="/terms" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-file-contract text-blue-600 text-xl mr-3"></i>
                                <span className="font-medium text-gray-800">Terms & Conditions</span>
                            </div>
                        </Link>
                        <Link to="/cancellation" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-ban text-red-600 text-xl mr-3"></i>
                                <span className="font-medium text-gray-800">Cancellation Policy</span>
                            </div>
                        </Link>
                        <Link to="/refund" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-undo-alt text-green-600 text-xl mr-3"></i>
                                <span className="font-medium text-gray-800">Refund Policy</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            <div
                id="backToTop"
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors z-50"
                style={{ display: 'none' }}
            >
                <i className="fas fa-chevron-up"></i>
            </div>
        </main>
    );
};

export default PrivacyPolicy;