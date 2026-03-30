import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
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
                                <span className="text-sm font-medium text-gray-500">Refund Policy</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Refund Policy Content */}
            <div className="policy-container max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Refund Policy</h1>
                    <p className="text-gray-600">Last updated: June 2025</p>
                </div>

                {/* Content Navigation */}
                <div className="content-nav bg-gray-50 p-4 rounded-lg mb-8">
                    <h3 className="font-bold text-gray-800 mb-3">Quick Navigation</h3>
                    <ul className="nav-links grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <li><a href="#introduction" onClick={(e) => handleAnchorClick(e, '#introduction')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Introduction</a></li>
                        <li><a href="#eligibility" onClick={(e) => handleAnchorClick(e, '#eligibility')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Eligibility</a></li>
                        <li><a href="#non-refundable" onClick={(e) => handleAnchorClick(e, '#non-refundable')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Non-Refundable</a></li>
                        <li><a href="#process" onClick={(e) => handleAnchorClick(e, '#process')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Refund Process</a></li>
                        <li><a href="#timeline" onClick={(e) => handleAnchorClick(e, '#timeline')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Timeline</a></li>
                        <li><a href="#shipping" onClick={(e) => handleAnchorClick(e, '#shipping')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Shipping Costs</a></li>
                        <li><a href="#contact" onClick={(e) => handleAnchorClick(e, '#contact')} className="text-blue-600 hover:underline"><i className="fas fa-chevron-right text-xs mr-2"></i> Contact Us</a></li>
                    </ul>
                </div>

                {/* Introduction */}
                <div className="policy-section mb-8" id="introduction">
                    <div className="highlight-box bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="mb-0 text-gray-700">
                            Thank you for shopping with <strong>Sharnetic Technologies</strong>. We strive to ensure complete customer satisfaction with every purchase. 
                            If you are not entirely satisfied with your purchase, we're here to help. This Refund Policy outlines the terms and conditions 
                            for requesting and receiving refunds for products purchased through our platform.
                        </p>
                    </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="policy-section mb-8" id="eligibility">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-check-circle text-green-600 mr-2"></i>
                        Eligibility for Refunds
                    </h2>
                    
                    <p className="text-gray-700 mb-4">
                        To be eligible for a refund, your item must meet the following criteria:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Condition Requirements</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>Unused and in original condition</li>
                                <li>In original packaging with all tags attached</li>
                                <li>No signs of wear, damage, or alteration</li>
                                <li>Accompanied by proof of purchase</li>
                            </ul>
                        </div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Time Requirements</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>Return request within 7 days of delivery</li>
                                <li>Item received by us within 14 days of request</li>
                                <li>Refund processing within 5-7 business days after approval</li>
                            </ul>
                        </div>
                    </div>

                    <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-3">Common Refund Reasons</h3>
                    <div className="overflow-x-auto">
                        <table className="eligibility-table w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-left">Reason for Return</th>
                                    <th className="border border-gray-300 p-2 text-left">Eligible for Refund</th>
                                    <th className="border border-gray-300 p-2 text-left">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-gray-300 p-2">Received wrong/damaged product</td><td className="eligible border border-gray-300 p-2 text-green-600">Yes</td><td className="border border-gray-300 p-2">Full refund + return shipping covered</td></tr>
                                <tr><td className="border border-gray-300 p-2">Product not as described</td><td className="eligible border border-gray-300 p-2 text-green-600">Yes</td><td className="border border-gray-300 p-2">Full refund + return shipping covered</td></tr>
                                <tr><td className="border border-gray-300 p-2">Changed your mind</td><td className="eligible border border-gray-300 p-2 text-green-600">Yes</td><td className="border border-gray-300 p-2">Refund minus shipping costs</td></tr>
                                <tr><td className="border border-gray-300 p-2">Missing parts/accessories</td><td className="eligible border border-gray-300 p-2 text-green-600">Yes</td><td className="border border-gray-300 p-2">Partial or full refund based on situation</td></tr>
                                <tr><td className="border border-gray-300 p-2">Product used/opened</td><td className="not-eligible border border-gray-300 p-2 text-red-600">No</td><td className="border border-gray-300 p-2">Unless defective or wrong item</td></tr>
                                <tr><td className="border border-gray-300 p-2">Past return period</td><td className="not-eligible border border-gray-300 p-2 text-red-600">No</td><td className="border border-gray-300 p-2">Contact customer support for exceptions</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Non-Refundable Items */}
                <div className="policy-section mb-8" id="non-refundable">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-ban text-red-600 mr-2"></i>
                        Non-Refundable Items
                    </h2>
                    
                    <p className="text-gray-700 mb-4">
                        The following items are generally not eligible for refunds unless they arrive damaged or defective:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-2">Product Categories</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li><strong>Gift cards and vouchers</strong></li>
                                <li><strong>Digital products</strong> (downloadable software, e-books)</li>
                                <li><strong>Personalized/customized items</strong></li>
                                <li><strong>Perishable goods</strong> (food, flowers, newspapers)</li>
                                <li><strong>Intimate/sanitary products</strong> (for health/hygiene reasons)</li>
                                <li><strong>Items marked as "Final Sale" or "Clearance"</strong></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-2">Services</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li><strong>Completed services</strong> (installation, repair)</li>
                                <li><strong>Event tickets</strong> (after the event date)</li>
                                <li><strong>Gift wrapping services</strong></li>
                                <li><strong>Shipping and handling charges</strong> (unless our error)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <h4 className="font-bold text-yellow-800 mb-2">Special Circumstances</h4>
                        <p className="text-yellow-700">
                            In case of defective or wrong items, even non-refundable items may be eligible for replacement or refund. 
                            Please contact our customer support for assistance.
                        </p>
                    </div>
                </div>

                {/* Refund Process */}
                <div className="policy-section mb-8" id="process">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-sync-alt text-blue-600 mr-2"></i>
                        Refund Process
                    </h2>
                    
                    <p className="text-gray-700 mb-6">
                        Follow these simple steps to request a refund:
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: 1, title: "Initiate Return Request", desc: "Log into your account, go to 'My Orders,' select the item, and click 'Return/Refund.' Alternatively, contact our customer support with your order details." },
                            { step: 2, title: "Get Return Authorization", desc: "We'll review your request and provide a Return Authorization Number (RAN) and return instructions within 24-48 hours." },
                            { step: 3, title: "Pack and Ship", desc: "Pack the item securely in its original packaging with all accessories. Include the RAN in the package and ship to the address provided." },
                            { step: 4, title: "Quality Check", desc: "Our team will inspect the returned item upon receipt (usually within 3-5 business days after delivery)." },
                            { step: 5, title: "Refund Processing", desc: "Once approved, we'll process your refund to the original payment method within 5-7 business days." }
                        ].map((item) => (
                            <div key={item.step} className="process-step flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <span className="step-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.step}</span>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
                                    <p className="text-gray-700">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Refund Timeline */}
                <div className="policy-section mb-8" id="timeline">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-clock text-purple-600 mr-2"></i>
                        Refund Timeline
                    </h2>
                    
                    <div className="timeline space-y-3">
                        {[
                            { days: "Day 1-7", desc: "Request refund within 7 days of delivery" },
                            { days: "Day 1-2", desc: "Receive Return Authorization and instructions" },
                            { days: "Day 3-7", desc: "Ship item back to us (customer responsibility)" },
                            { days: "Day 8-12", desc: "We receive and inspect the returned item" },
                            { days: "Day 13-20", desc: "Refund processed to original payment method" },
                            { days: "Day 21-25", desc: "Refund appears in your account (varies by bank)" }
                        ].map((item, index) => (
                            <div key={index} className="timeline-item flex items-start gap-4">
                                <div className="timeline-date font-semibold text-blue-600 w-24 flex-shrink-0">{item.days}</div>
                                <p className="text-gray-700">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-bold text-blue-800 mb-2">Important Notes</h4>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700">
                            <li>Timelines are business days (Monday-Friday, excluding holidays)</li>
                            <li>Bank processing times may vary (especially for international cards)</li>
                            <li>Keep your return tracking number for reference</li>
                            <li>Contact us if refund doesn't appear within 10 business days of approval</li>
                        </ul>
                    </div>
                </div>

                {/* Shipping & Returns */}
                <div className="policy-section mb-8" id="shipping">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-truck text-orange-600 mr-2"></i>
                        Shipping & Return Costs
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Our Responsibility</h4>
                            <p className="text-gray-700">We cover return shipping costs when:</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                                <li>You received a wrong item</li>
                                <li>Item arrived damaged or defective</li>
                                <li>Product not as described on website</li>
                                <li>Our error in processing your order</li>
                            </ul>
                        </div>
                        <div className="info-card bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Customer Responsibility</h4>
                            <p className="text-gray-700">You cover return shipping costs when:</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
                                <li>You changed your mind</li>
                                <li>Ordered wrong size/color</li>
                                <li>No longer need the product</li>
                                <li>Found better price elsewhere</li>
                            </ul>
                        </div>
                    </div>

                    <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-2">Original Shipping Charges</h3>
                    <p className="text-gray-700 mb-4">
                        Original shipping charges are non-refundable unless the return is due to our error. 
                        For changed-mind returns, we refund only the product price.
                    </p>

                    <h3 className="policy-subtitle text-xl font-semibold text-gray-800 mb-2">Restocking Fees</h3>
                    <p className="text-gray-700">
                        We do not charge any restocking fees for eligible returns. However, we may deduct 
                        a fee if the item is returned in a condition that reduces its resale value.
                    </p>
                </div>

                {/* Contact Us */}
                <div className="policy-section mb-8" id="contact">
                    <h2 className="policy-title text-2xl font-bold text-gray-800 mb-4">
                        <i className="fas fa-headset text-teal-600 mr-2"></i>
                        Need Help? Contact Us
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-lg mb-3 text-gray-800">Customer Support</h3>
                                <div className="space-y-3 text-gray-700">
                                    <p><i className="fas fa-envelope mr-2 text-blue-600"></i> Email: support@sharnetic.com</p>
                                    <p><i className="fas fa-phone mr-2 text-blue-600"></i> Phone: +91 82201 53747</p>
                                    <p><i className="fas fa-clock mr-2 text-blue-600"></i> Hours: Mon-Sun, 9 AM - 9 PM IST</p>
                                    <p><i className="fas fa-comments mr-2 text-blue-600"></i> Live Chat: Available on website</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-3 text-gray-800">Return Address</h3>
                                <div className="text-gray-700">
                                    <p>SHARNETIC TECHNOLOGIES RETURNS CENTER</p>
                                    <p>PLOT NO.-B, 404, 4TH FLOOR</p>
                                    <p>MANSAROVAR PLAZA, SECTOR-07</p>
                                    <p>Jaipur, Rajasthan - 302020</p>
                                    <p className="mt-3 text-sm">Please include your Return Authorization Number (RAN) in the package.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-bold text-green-800 mb-2">Quick Resolution Tips</h4>
                        <ul className="list-disc pl-5 space-y-1 text-green-700">
                            <li>Have your order number ready when contacting support</li>
                            <li>Take photos of damaged/wrong items before returning</li>
                            <li>Keep all packaging and documentation until refund is complete</li>
                            <li>Use insured/trackable shipping for returns</li>
                            <li>Check your spam folder for refund confirmation emails</li>
                        </ul>
                    </div>
                </div>

                {/* Policy Updates */}
                <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Policy Updates
                    </h3>
                    <p className="text-yellow-700">
                        We may update this Refund Policy from time to time. We will notify you of any changes by posting the new 
                        Refund Policy on this page and updating the "Last updated" date. We encourage you to review this Refund 
                        Policy periodically for any changes.
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
                        <Link to="/privacy" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-shield-alt text-green-600 text-xl mr-3"></i>
                                <span className="font-medium text-gray-800">Privacy Policy</span>
                            </div>
                        </Link>
                        <Link to="/cancellation" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-ban text-red-600 text-xl mr-3"></i>
                                <span className="font-medium text-gray-800">Cancellation Policy</span>
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

export default RefundPolicy;