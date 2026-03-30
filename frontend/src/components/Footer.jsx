// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-section pt-12 pb-6 mt-12">
            <div className="footer-container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Column 1 */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">ABOUT</h4>
                        <div className="footer-links">
                            <Link to="#">Contact Us</Link>
                            <Link to="#">About Us</Link>
                            <Link to="#">Careers</Link>
                            <Link to="#">Press</Link>
                            <Link to="#">Corporate Information</Link>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">POLICIES</h4>
                        <div className="footer-links">
                            <Link to="/terms-and-condition">Terms & Conditions</Link>
                            <Link to="/privacy-policy">Privacy Policy</Link>
                            <Link to="/refund-policy">Refund Policy</Link>
                            <Link to="/cancellation-policy">Cancellation Policy</Link>
                            <Link to="#">FAQ</Link>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">CONSUMER POLICY</h4>
                        <div className="footer-links">
                            <Link to="#">Return Policy</Link>
                            <Link to="#">Security</Link>
                            <Link to="#">Sitemap</Link>
                            <Link to="#">Grievance Redressal</Link>
                        </div>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">MAIL US</h4>
                        <div className="text-gray-300">
                            <p>SHARNETIC TECHNOLOGIES PRIVATE LIMITED</p>
                            <p>SHOP NO. 4, NAROTTAMPURA</p>
                            <p>SANGANER</p>
                            <p>Jaipur, Rajasthan - 302026</p>
                            <p className="mt-2">Email: info@sharnetic.in</p>
                            <p>Phone: +91 80009 05713</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <i className="fas fa-briefcase text-yellow-400 mr-2"></i>
                            <span className="text-gray-300">Become a Seller</span>
                        </div>
                        <div className="flex items-center mb-4 md:mb-0">
                            <i className="fas fa-star text-yellow-400 mr-2"></i>
                            <span className="text-gray-300">Advertise</span>
                        </div>
                        <div className="flex items-center mb-4 md:mb-0">
                            <i className="fas fa-gift text-yellow-400 mr-2"></i>
                            <span className="text-gray-300">Gift Cards</span>
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-question-circle text-yellow-400 mr-2"></i>
                            <span className="text-gray-300">Help Center</span>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-gray-400 text-sm">
                        <p>&copy; 2026 SHARNETIC TECHNOLOGIES PRIVATE LIMITED. All rights reserved.</p>
                        <p className="mt-2">Made with <i className="fas fa-heart text-red-500"></i> in India</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;