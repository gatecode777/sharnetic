// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-section pt-12 pb-6 mt-12 bg-gray-900 text-gray-300">
            <div className="footer-container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Column 1 */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wider">ABOUT FINOXIS</h4>
                        <div className="footer-links flex flex-col space-y-2 text-xs">
                            <Link to="/about" className="hover:text-white transition">About Finoxis Network</Link>
                            <Link to="/sellers" className="hover:text-white transition">Verified Supplier Network</Link>
                            <Link to="/shop" className="hover:text-white transition">Wholesale Products Directory</Link>
                            <Link to="/contact" className="hover:text-white transition">Corporate Contact</Link>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wider">POLICIES & TERMS</h4>
                        <div className="footer-links flex flex-col space-y-2 text-xs">
                            <Link to="/terms-and-condition" className="hover:text-white transition">Terms & Conditions</Link>
                            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                            <Link to="/refund-policy" className="hover:text-white transition">Supplier Code of Conduct</Link>
                            <Link to="/cancellation-policy" className="hover:text-white transition">Buyer Dispute Policy</Link>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wider">QUICK DIRECTORY</h4>
                        <div className="footer-links flex flex-col space-y-2 text-xs">
                            <Link to="/sellers" className="hover:text-white transition">Manufacturers by Category</Link>
                            <Link to="/shop" className="hover:text-white transition">Trending Wholesale Leads</Link>
                            <Link to="/contact" className="hover:text-white transition">Post Buying Requirement</Link>
                            <Link to="/contact" className="hover:text-white transition">Trade Grievance Redressal</Link>
                        </div>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white uppercase tracking-wider">HEADQUARTERS</h4>
                        <div className="text-gray-300 text-xs space-y-1">
                            <p className="font-bold text-white">FINOXIS TECHNOLOGIES PRIVATE LIMITED</p>
                            <p>SHOP NO. 4, NAROTTAMPURA, SANGANER</p>
                            <p>Jaipur, Rajasthan - 302026</p>
                            <p className="mt-2 text-blue-300">Email: info@finoxis.in</p>
                            <p className="text-blue-300">Phone: +91 80009 05713</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 text-xs">
                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
                        <div className="flex items-center mb-4 md:mb-0">
                            <i className="fas fa-handshake text-yellow-400 mr-2"></i>
                            <span className="text-gray-300">India's Trusted Supplier & Wholesale Directory</span>
                        </div>
                        <div className="flex items-center mb-4 md:mb-0">
                            <i className="fas fa-shield-alt text-green-400 mr-2"></i>
                            <span className="text-gray-300">100% GST Verified Suppliers</span>
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-headset text-blue-400 mr-2"></i>
                            <span className="text-gray-300">Buyer Support Helpline</span>
                        </div>
                    </div>

                    <div className="text-center mt-8 text-gray-500 text-xs">
                        <p>&copy; 2026 FINOXIS TECHNOLOGIES PRIVATE LIMITED. All rights reserved.</p>
                        <p className="mt-1">Connecting Indian Manufacturers, Exporters, and Wholesale Buyers.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
