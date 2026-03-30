import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CancellationPolicy = () => {
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
                                <span className="text-sm font-medium text-gray-500">Cancellation Policy</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Cancellation Policy Content */}
            <div className="policy-container max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Cancellation Policy</h1>
                    <p className="text-gray-600">Last updated: June 2025</p>
                </div>

                {/* Introduction */}
                <div className="policy-section mb-8">
                    <div className="highlight-box bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="mb-0 text-gray-700">
                            At <strong>Sharnetic Technologies</strong>, we understand that sometimes plans change. Our cancellation policy is designed to be fair and flexible for our customers while ensuring smooth operations.
                        </p>
                    </div>
                </div>

                {/* Section 1: Order Cancellation */}
                <div className="policy-section mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-ban text-red-500 mr-3"></i>
                        Order Cancellation
                    </h2>
                    <div className="space-y-4">
                        <div className="step-box flex items-start gap-4 p-3 bg-gray-50 rounded">
                            <span className="step-number w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">1</span>
                            <p className="text-gray-700">You may cancel your order within <strong>12 hours</strong> of placing it or before it has been shipped, whichever is earlier.</p>
                        </div>
                        <div className="step-box flex items-start gap-4 p-3 bg-gray-50 rounded">
                            <span className="step-number w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">2</span>
                            <p className="text-gray-700">To cancel an order, please contact us at <a href="mailto:support@sharnetic.com" className="text-blue-600 underline font-medium">support@sharnetic.com</a> with your order ID.</p>
                        </div>
                        <div className="step-box flex items-start gap-4 p-3 bg-gray-50 rounded">
                            <span className="step-number w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">3</span>
                            <p className="text-gray-700">Alternatively, you can cancel through your account dashboard if the order is still in "Processing" status.</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: After Shipment */}
                <div className="policy-section mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-shipping-fast text-orange-500 mr-3"></i>
                        After Shipment
                    </h2>
                    <p className="text-gray-700 mb-4">
                        If your order has already been shipped, it <strong>cannot be canceled</strong>. In such cases, you may:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Initiate a return request once the order is delivered (within 7 days for most products)</li>
                        <li>Refuse delivery at the time of shipment (charges may apply for return shipping)</li>
                        <li>Contact our customer support for assistance with returns</li>
                    </ul>
                </div>

                {/* Section 3: Refund Processing */}
                <div className="policy-section mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-credit-card text-green-500 mr-3"></i>
                        Refund Processing
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                                <i className="fas fa-check-circle text-green-600 mr-2"></i>
                                Prepaid Orders
                            </h3>
                            <p className="text-gray-700">For prepaid orders, the refund will be processed to your original payment method within <strong>5–7 business days</strong> after cancellation approval.</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                                <i className="fas fa-truck text-blue-600 mr-2"></i>
                                COD Orders
                            </h3>
                            <p className="text-gray-700">Cash on Delivery orders can also be canceled by contacting us before shipment. <strong>No charges apply</strong> for COD cancellations.</p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Processing Time Table */}
                <div className="policy-section mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-clock text-purple-500 mr-3"></i>
                        Processing Time
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Order Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Cancellation Timeframe</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Refund Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50 border-b">
                                    <td className="py-3 px-4">Not Shipped</td>
                                    <td className="py-3 px-4">Within 12 hours of order</td>
                                    <td className="py-3 px-4">5-7 business days</td>
                                </tr>
                                <tr className="hover:bg-gray-50 border-b">
                                    <td className="py-3 px-4">Processing</td>
                                    <td className="py-3 px-4">Before shipment</td>
                                    <td className="py-3 px-4">5-7 business days</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4">Shipped</td>
                                    <td className="py-3 px-4">Not allowed</td>
                                    <td className="py-3 px-4">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 5: Need Help */}
                <div className="policy-section mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-headset text-blue-500 mr-3"></i>
                        Need Help?
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-gray-700 mb-5">
                            If you need assistance with cancellations or have any concerns, our customer support team is here to help you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href="mailto:support@sharnetic.com"
                               className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 transition text-sm font-medium">
                                <i className="fas fa-envelope mr-2"></i>
                                Email Support
                            </a>
                            <a href="tel:+918220153747"
                               className="inline-flex items-center justify-center bg-green-600 text-white px-5 py-2.5 rounded hover:bg-green-700 transition text-sm font-medium">
                                <i className="fas fa-phone mr-2"></i>
                                Call +91 82201 53747
                            </a>
                            <Link to="/contact"
                               className="inline-flex items-center justify-center bg-gray-600 text-white px-5 py-2.5 rounded hover:bg-gray-700 transition text-sm font-medium">
                                <i className="fas fa-comments mr-2"></i>
                                Contact Form
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Important Notes
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-yellow-700">
                        <li>Some products (like personalized items) may not be eligible for cancellation</li>
                        <li>Promotional offers may have specific cancellation terms</li>
                        <li>Keep your order ID ready when contacting support</li>
                        <li>Refund times may vary depending on your bank or payment provider</li>
                    </ul>
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
                        <Link to="/refund" className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                            <div className="flex items-center">
                                <i className="fas fa-undo-alt text-purple-600 text-xl mr-3"></i>
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

export default CancellationPolicy;