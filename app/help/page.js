'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Help() {
    const [activeTab, setActiveTab] = useState('contact');

    const contactInfo = {
        general: {
            email: 'info@comparemyparkings.co.uk ',
            phone: '+44 7876 239148',
            address: '595 Sipson Rd, Sipson, West Drayton UB7 0JD (Headoffice)'
        },
        complaints: 'complaints@comparemyparkings.co.uk',
        departureUpdates: 'departure@comparemyparkings.co.uk',
        cancellations: 'cancellations@comparemyparkings.co.uk',
        arrivalInfo: 'arrival@comparemyparkings.co.uk',
        generalEnquiry: 'enquiry@comparemyparkings.co.uk'
    };

    const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.63007498944!2d-0.45436004525363005!3d51.48330414933871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487672383aaede37%3A0x31a4e3fc23ff1bf9!2sSipson!5e0!3m2!1sen!2suk!4v1758891700511!5m2!1sen!2suk";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Page Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Help & Contact</h1>
                            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                                We are here to help you with any questions or concerns about your parking booking. 
                                Choose the appropriate contact method below for faster assistance.
                            </p>
                        </div>

                        {/* Chatbot Button */}
                        <div className="text-center mb-8">
                            <button 
                                disabled
                                className="bg-gray-400 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-50 inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Chatbot Assistant (Coming Soon)
                            </button>
                            <p className="text-gray-500 text-sm mt-2">Our AI assistant will be available soon to help you 24/7</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Contact Information */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                                    
                                    {/* General Contact Info */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">General Contact</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-700">{contactInfo.general.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-gray-700">{contactInfo.general.phone}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-700">{contactInfo.general.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specific Contact Emails */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Specific Inquiries</h3>
                                        
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="font-semibold text-gray-800">Complaints & Issues</h4>
                                            <p className="text-gray-600 text-sm mb-2">For any complaints or service issues</p>
                                            <a href={`mailto:${contactInfo.complaints}`} className="text-blue-600 hover:text-blue-800">
                                                {contactInfo.complaints}
                                            </a>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-4">
                                            <h4 className="font-semibold text-gray-800">Departure Updates</h4>
                                            <p className="text-gray-600 text-sm mb-2">If you need to update your departure information from UK</p>
                                            <a href={`mailto:${contactInfo.departureUpdates}`} className="text-blue-600 hover:text-blue-800">
                                                {contactInfo.departureUpdates}
                                            </a>
                                        </div>

                                        <div className="border-l-4 border-red-500 pl-4">
                                            <h4 className="font-semibold text-gray-800">Booking Cancellations</h4>
                                            <p className="text-gray-600 text-sm mb-2">To cancel or modify your booking</p>
                                            <a href={`mailto:${contactInfo.cancellations}`} className="text-blue-600 hover:text-blue-800">
                                                {contactInfo.cancellations}
                                            </a>
                                        </div>

                                        <div className="border-l-4 border-purple-500 pl-4">
                                            <h4 className="font-semibold text-gray-800">Arrival Information</h4>
                                            <p className="text-gray-600 text-sm mb-2">To provide arrival details or changes</p>
                                            <a href={`mailto:${contactInfo.arrivalInfo}`} className="text-blue-600 hover:text-blue-800">
                                                {contactInfo.arrivalInfo}
                                            </a>
                                        </div>

                                        <div className="border-l-4 border-orange-500 pl-4">
                                            <h4 className="font-semibold text-gray-800">General Enquiries</h4>
                                            <p className="text-gray-600 text-sm mb-2">For all other questions not covered above</p>
                                            <a href={`mailto:${contactInfo.generalEnquiry}`} className="text-blue-600 hover:text-blue-800">
                                                {contactInfo.generalEnquiry}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Operating Hours */}
                                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Operating Hours</h4>
                                        <p className="text-blue-700">Monday - Sunday: 8:00 AM - 8:00 PM</p>
                                        <p className="text-blue-700 text-sm">We are available 7 days a week to assist you</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Map */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Our Location</h3>
                                    <div className="h-64 mb-4">
                                        <iframe
                                            src={mapUrl}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><strong>Address:</strong> {contactInfo.general.address}</p>
                                        <p><strong>Phone:</strong> {contactInfo.general.phone}</p>
                                        <p><strong>Email:</strong> {contactInfo.general.email}</p>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-semibold text-red-800 mb-1">Emergency Contact</h4>
                                        <p className="text-red-700 text-sm">For urgent issues during your parking period</p>
                                        <p className="text-red-800 font-medium">(emergency chat coming soon..) </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">How do I modify my booking?</h3>
                                    <p className="text-gray-600">Send an email to {contactInfo.cancellations} with your booking reference and requested changes.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">What is your cancellation policy?</h3>
                                    <p className="text-gray-600">Free cancellation up to 24 hours before your booking start time.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">How long does it take to receive a response?</h3>
                                    <p className="text-gray-600">We typically respond within 2-4 hours during operating hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}