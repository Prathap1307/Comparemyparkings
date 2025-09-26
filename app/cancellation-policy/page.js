'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CancellationPolicy() {
    const policies = [
        {
            title: 'Standard Cancellation',
            timeframe: 'More than 24 hours before booking',
            policy: 'Full refund will be processed within 5-7 business days',
            note: 'No cancellation fee applies'
        },
        {
            title: 'Short Notice Cancellation',
            timeframe: 'Within 24 hours of booking start time',
            policy: '50% refund or full credit for future booking',
            note: 'Administrative fee may apply'
        },
        {
            title: 'No-Show',
            timeframe: 'After booking start time',
            policy: 'No refund available',
            note: 'Considered as service rendered'
        },
        {
            title: 'Special Circumstances',
            timeframe: 'Flight cancellations, emergencies',
            policy: 'Case-by-case consideration',
            note: 'Documentation may be required'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Cancellation Policy</h1>
                            <p className="text-gray-600 text-lg">
                                Understanding our cancellation terms helps ensure a smooth experience for all customers.
                            </p>
                        </div>

                        {/* Last Updated */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Last updated:</strong> January 1, 2024
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Overview */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Policy Overview</h2>
                            <p className="text-gray-600 mb-4">
                                We understand that plans can change. Our cancellation policy is designed to be fair to both 
                                our customers and our parking partners. Below you'll find detailed information about our 
                                cancellation terms and conditions.
                            </p>
                            <p className="text-gray-600">
                                All cancellation requests must be made through our website, mobile app, or by contacting 
                                our customer service team. Email requests should be sent to{' '}
                                <a href="mailto:cancellations@comparemyparkings.co.uk" className="text-blue-600 hover:underline">
                                    cancellations@comparemyparkings.co.uk
                                </a>.
                            </p>
                        </div>

                        {/* Policy Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Cancellation Terms</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {policies.map((policy, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="mb-4 md:mb-0 md:flex-1">
                                                <h4 className="font-semibold text-gray-800">{policy.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{policy.timeframe}</p>
                                            </div>
                                            <div className="md:flex-1">
                                                <p className="text-gray-700">{policy.policy}</p>
                                                <p className="text-sm text-gray-500 mt-1">{policy.note}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Refund Process */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Process</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">1</span>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="font-semibold text-gray-800">Cancellation Request</h4>
                                        <p className="text-gray-600">Submit your cancellation through any of our available channels.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">2</span>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="font-semibold text-gray-800">Confirmation</h4>
                                        <p className="text-gray-600">Receive confirmation of your cancellation within 2 hours.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">3</span>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="font-semibold text-gray-800">Refund Processing</h4>
                                        <p className="text-gray-600">Refunds are processed within 5-7 business days to your original payment method.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Need Help with Cancellation?</h3>
                            <p className="text-gray-600 mb-4">
                                If you have any questions about our cancellation policy or need assistance with 
                                cancelling your booking, please contact our support team.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="mailto:cancellations@comparemyparkings.co.uk" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                                    Email Cancellations Team
                                </a>
                                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    Live Chat Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}