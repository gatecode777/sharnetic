import React, {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);

    const handlePrint = () => {
        window.print();
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
                                <span className="text-sm font-medium text-gray-500">Terms & Conditions</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Terms & Conditions Content */}
            <div className="terms-container max-w-4xl mx-auto">
                {/* Header */}
                <div className="terms-header bg-gradient-to-r from-blue-700 to-blue-500 text-white p-8 rounded-t-lg shadow-md">
                    <div className="terms-icon text-5xl mb-4">
                        <i className="fas fa-file-contract"></i>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">Terms & Conditions</h1>
                    <p className="text-lg opacity-90">Please read these terms carefully before using Finoxis Technologies</p>
                    <div className="mt-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">Last Updated: June 2025</span>
                    </div>
                </div>

                {/* Content */}
                <div className="terms-content bg-white p-8 rounded-b-lg shadow-md">
                    {/* Introduction */}
                    <div className="terms-section mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
                        <p className="text-gray-700 mb-4">
                            Welcome to Finoxis Technologies ("we," "our," or "us"). By accessing and using our website, mobile application, or services (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully.
                        </p>
                        <p className="text-gray-700">
                            These Terms constitute a legally binding agreement between you and Finoxis Technologies PRIVATE LIMITED regarding your use of our Services. If you do not agree with any part of these Terms, you must not use our Services.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <h2 className="text-xl font-bold text-gray-800">Acceptance of Terms</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">
                                By accessing, browsing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                            </p>
                            <div className="highlight-box bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                                <p className="text-gray-700"><strong>Important:</strong> These Terms may be updated periodically. We will notify you of significant changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Services after such changes constitutes your acceptance of the revised Terms.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <h2 className="text-xl font-bold text-gray-800">Account Registration</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">To access certain features of our Services, you may need to register for an account. You agree to:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>Provide accurate, current, and complete information during registration</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                                <li>Notify us immediately of any unauthorized use of your account</li>
                                <li>Be responsible for all activities that occur under your account</li>
                            </ul>
                            <div className="highlight-box warning bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mt-4">
                                <p className="text-gray-700"><i className="fas fa-exclamation-triangle mr-2 text-yellow-600"></i> <strong>Security Notice:</strong> We reserve the right to disable any account at any time if we believe you have violated these Terms or for any other reason at our sole discretion.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <h2 className="text-xl font-bold text-gray-800">Products & Pricing</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">We strive to ensure that all product information, including descriptions, images, and prices, is accurate. However, please note:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise</li>
                                <li>Prices are subject to change without prior notice</li>
                                <li>Product availability is not guaranteed</li>
                                <li>Errors in product information may occasionally occur</li>
                                <li>We reserve the right to cancel any order if we detect pricing errors</li>
                            </ul>
                            <div className="highlight-box success bg-green-50 border-l-4 border-green-600 p-4 rounded mt-4">
                                <p className="text-gray-700"><i className="fas fa-check-circle mr-2 text-green-600"></i> <strong>Price Protection:</strong> If you find a lower price on the same product within 7 days of purchase, contact our customer support for a price match.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                            <h2 className="text-xl font-bold text-gray-800">Orders & Payments</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">When you place an order through our Services:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>You agree to provide valid payment information</li>
                                <li>All payments are processed through secure payment gateways</li>
                                <li>We accept various payment methods including credit/debit cards, net banking, UPI, and cash on delivery</li>
                                <li>Orders are subject to acceptance and availability</li>
                                <li>We will send you an order confirmation email upon successful placement</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                            <h2 className="text-xl font-bold text-gray-800">Shipping & Delivery</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">We ship products across India. Please note:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>Delivery times are estimates and may vary</li>
                                <li>Shipping charges may apply based on location and order value</li>
                                <li>We are not liable for delays caused by logistics partners</li>
                                <li>Some locations may have restricted delivery options</li>
                                <li>You must provide accurate shipping information</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                            <h2 className="text-xl font-bold text-gray-800">Returns & Refunds</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">Our return and refund policy includes:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>Returns accepted within 7 days of delivery for eligible products</li>
                                <li>Products must be unused and in original packaging</li>
                                <li>Refunds processed within 7-10 business days after return inspection</li>
                                <li>Some products may be non-returnable (e.g., personalized items)</li>
                                <li>Return shipping may be the customer's responsibility in some cases</li>
                            </ul>
                            <div className="mt-4">
                                <p className="text-gray-700">For detailed information, please refer to our <Link to="/refund" className="text-blue-600 hover:underline">Refund Policy</Link>.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">7</div>
                            <h2 className="text-xl font-bold text-gray-800">Intellectual Property</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">
                                All content on our Services, including text, graphics, logos, images, and software, is the property of Finoxis Technologies or its content suppliers and is protected by Indian and international copyright laws.
                            </p>
                            <p className="text-gray-700">
                                You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content without our express written permission.
                            </p>
                        </div>
                    </div>

                    {/* Section 8 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">8</div>
                            <h2 className="text-xl font-bold text-gray-800">Limitation of Liability</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">To the maximum extent permitted by law, Finoxis Technologies shall not be liable for:</p>
                            <ul className="terms-list list-disc pl-5 space-y-2 text-gray-700 mb-4">
                                <li>Any indirect, incidental, special, or consequential damages</li>
                                <li>Loss of profits, revenue, data, or use</li>
                                <li>Damages related to third-party products or services</li>
                                <li>Issues beyond our reasonable control</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                Our total liability for any claim shall not exceed the amount you paid for the product or service in question.
                            </p>
                        </div>
                    </div>

                    {/* Section 9 */}
                    <div className="terms-section mb-8">
                        <div className="section-title flex items-center gap-4 mb-3">
                            <div className="section-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">9</div>
                            <h2 className="text-xl font-bold text-gray-800">Governing Law</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 mb-4">
                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
                            </p>
                            <p className="text-gray-700">
                                Any disputes arising from these Terms or your use of our Services shall be subject to the exclusive jurisdiction of the courts located in Jaipur, Rajasthan, India.
                            </p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="contact-info-box bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                        <p className="text-gray-700 mb-2">For any questions about these Terms & Conditions, please contact us:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-gray-700">
                                    <i className="fas fa-envelope text-blue-600 mr-2"></i>
                                    <strong>Email:</strong> support@finoxis.com
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-700">
                                    <i className="fas fa-phone text-blue-600 mr-2"></i>
                                    <strong>Phone:</strong> +91 82201 53747
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-700">
                                    <i className="fas fa-clock text-blue-600 mr-2"></i>
                                    <strong>Support Hours:</strong> Mon-Sat, 9 AM - 8 PM
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-700">
                                    <i className="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                                    <strong>Address:</strong> Jaipur, Rajasthan 302020
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons flex flex-wrap gap-3 justify-center">
                        <button onClick={handlePrint} className="action-btn primary-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition inline-flex items-center">
                            <i className="fas fa-print mr-2"></i> Print Terms
                        </button>
                        <Link to="/" className="action-btn secondary-btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition inline-flex items-center">
                            <i className="fas fa-home mr-2"></i> Back to Home
                        </Link>
                        <Link to="/privacy" className="action-btn secondary-btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition inline-flex items-center">
                            <i className="fas fa-shield-alt mr-2"></i> Privacy Policy
                        </Link>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-500 text-sm">
                            <i className="fas fa-history mr-1"></i> These Terms & Conditions were last updated on June 1, 2025
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                            © 2026 Finoxis Technologies PRIVATE LIMITED. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default TermsAndConditions;