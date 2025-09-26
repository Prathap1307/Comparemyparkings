'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsConditions() {
    const [activeSection, setActiveSection] = useState('introduction');

    const sections = [
        {
            id: 'introduction',
            title: 'Introduction',
            content: `
                <p><strong>All service providers are verified so 100% verified service provider.</strong></p>
                <p>CompareMyParkings.co.uk acts solely as a comparison and booking agent for parking services. We do not own or operate any car parks. All responsibility and liability for your vehicle lie with the chosen parking service provider.</p>
                <p>Our aim is to make your airport parking booking simple and transparent by comparing multiple providers. Please read these Terms carefully, along with the provider's own Terms, before making a booking.</p>
                <p>By booking through CompareMyParkings.co.uk, you agree to both our Terms and the Terms of the selected provider.</p>
                <p>These Terms are governed by English law and are effective once we issue a booking confirmation by email or phone.</p>
                <p>CompareMyParkings.co.uk may amend these Terms at any time. However, the Terms valid at the time of your booking will apply.</p>
            `
        },
        {
            id: 'bookings',
            title: 'Bookings',
            content: `
                <p>Customers must read all details and the provider's own Terms before booking.</p>
                <p>A booking is confirmed when a reference number and confirmation email are issued. If you do not receive a confirmation, contact us immediately.</p>
                <p>Bookings made by phone or chat will also include a reference number.</p>
                <p>Bookings are subject to provider availability. If a provider cannot fulfil the booking, we will issue a refund but accept no liability for additional losses.</p>
                <p>Bookings are non-transferable.</p>
                <p>You must provide correct contact details and carry your confirmation when travelling.</p>
                <p>Saver or Mystery products may not disclose the provider name until after booking.</p>
                <p>Providers may move your car between their compounds/yards (usually within 15–20 miles) for operational reasons.</p>
                <p>Providers may disallow dashcams or trackers for insurance/security reasons.</p>
            `
        },
        {
            id: 'prices-payments',
            title: 'Prices and Payments',
            content: `
                <p>All prices are quoted in GBP for advance bookings only.</p>
                <p>Prices include a non-refundable booking fee.</p>
                <p>Payments are accepted via major debit/credit cards and PayPal. You may see the name of a third-party payment processor on your statement.</p>
                <p>If a card payment fails, your booking will not be confirmed.</p>
                <p>Providers may charge additional fees for extras (e.g., large vehicles, delays, terminal access). These charges are set by the provider, not CompareMyParkings.co.uk.</p>
                <p>VAT invoices must be requested directly from the provider.</p>
            `
        },
        {
            id: 'amendments-cancellations',
            title: 'Amendments and Cancellations',
            content: `
                <p>Requests must be made in writing to cancellations@comparemyparkings.co.uk with your booking reference.</p>
                <p>Cancellations up to 48 hours before drop-off (excluding non-flexible deals) incur a £15 admin fee unless Cancellation Cover was purchased.</p>
                <p>Cancellation Cover allows cancellation up to 48 hours prior with a refund (excluding booking fees and extras).</p>
                <p>No refunds for cancellations within 48 hours, no-shows, or same/next-day bookings.</p>
                <p>Amendments within 48 hours incur a £15 admin fee plus any price difference.</p>
                <p>Non-refundable/saver products cannot be cancelled or amended.</p>
            `
        },
        {
            id: 'liability',
            title: 'Liability of CompareMyParkings.co.uk',
            content: `
                <p>We act only as a booking agent. Your contract for parking is with the provider.</p>
                <p>Complaints about parking services will be forwarded to the provider, who is solely responsible.</p>
                <p>Providers may drive and reposition vehicles within/around their yards. Cars may be moved up to 15–20 miles.</p>
                <p>CompareMyParkings.co.uk is not responsible for damage, loss, or theft – such matters must be addressed directly with the provider.</p>
                <p>Vehicles are left at your own risk. Do not leave valuables inside.</p>
                <p>Our liability is limited to booking errors caused by our negligence, capped at the amount you paid to us.</p>
                <p>We are not liable for indirect or consequential losses (missed flights, travel costs, loss of earnings, etc.).</p>
                <p>Website information is provided by the providers. While we aim for accuracy, we cannot guarantee ongoing accuracy or completeness.</p>
            `
        },
        {
            id: 'complaints',
            title: 'Complaints',
            content: `
                <p>For complaints regarding parking services, email complaints@comparemyparkings.co.uk. We will forward your complaint to the provider, but they will handle it directly.</p>
                <p>For booking process issues caused by CompareMyParkings.co.uk, email us with your booking reference and details.</p>
                <p>Our liability is limited to booking process errors only.</p>
            `
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms & Conditions</h1>
                            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                                Please read these terms carefully before using our services. These terms govern 
                                your relationship with CompareMyParkings.
                            </p>
                        </div>

                        {/* Effective Date */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-blue-800 font-medium">Effective Date: January 1, 2024</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar Navigation */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md sticky top-24">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Table of Contents</h3>
                                    </div>
                                    <nav className="p-4">
                                        <ul className="space-y-2">
                                            {sections.map(section => (
                                                <li key={section.id}>
                                                    <button
                                                        onClick={() => setActiveSection(section.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                                            activeSection === section.id 
                                                                ? 'bg-blue-100 text-blue-700' 
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {section.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-lg shadow-md">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {sections.find(s => s.id === activeSection)?.title}
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div 
                                            className="prose max-w-none text-gray-600"
                                            dangerouslySetInnerHTML={{ 
                                                __html: sections.find(s => s.id === activeSection)?.content 
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Important Notice */}
                                <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                <strong>Important:</strong> These terms constitute a legally binding agreement. 
                                                By using our services, you acknowledge that you have read, understood, 
                                                and agree to be bound by these terms.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact for Questions */}
                                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Questions?</h3>
                                    <p className="text-gray-600 mb-4">
                                        If you have any questions about these Terms and Conditions, please contact us.
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> legal@comparemyparkings.co.uk</p>
                                        <p><strong>Phone:</strong> +44 7876 239148</p>
                                        <p><strong>Address:</strong> 595 Sipson Rd, Sipson, West Drayton UB7 0JD</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}