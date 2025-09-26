'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
    const [activeSection, setActiveSection] = useState('introduction');

    const sections = [
        {
            id: 'introduction',
            title: 'Introduction',
            content: `
                <p>Welcome to CompareMyParkings' Privacy Policy. This policy explains how we collect, use, disclose, 
                and safeguard your information when you use our parking comparison services.</p>
                <p>We are committed to protecting your personal data and respecting your privacy. Please read this 
                policy carefully to understand our views and practices regarding your personal data.</p>
            `
        },
        {
            id: 'data-collection',
            title: 'Information We Collect',
            content: `
                <h4>Personal Information</h4>
                <p>We collect information that you provide directly to us, including:</p>
                <ul>
                    <li>Name and contact details</li>
                    <li>Vehicle information</li>
                    <li>Payment information</li>
                    <li>Booking history and preferences</li>
                </ul>
                
                <h4>Automated Information</h4>
                <p>We automatically collect certain information when you use our services:</p>
                <ul>
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage patterns and search queries</li>
                    <li>Cookies and similar technologies</li>
                </ul>
            `
        },
        {
            id: 'data-use',
            title: 'How We Use Your Information',
            content: `
                <p>We use the information we collect for various purposes:</p>
                <ul>
                    <li>To provide and maintain our parking comparison services</li>
                    <li>To process your bookings and payments</li>
                    <li>To communicate with you about your bookings</li>
                    <li>To improve our services and user experience</li>
                    <li>To send marketing communications (with your consent)</li>
                    <li>To comply with legal obligations</li>
                </ul>
            `
        },
        {
            id: 'data-sharing',
            title: 'Information Sharing',
            content: `
                <p>We may share your information with:</p>
                <ul>
                    <li>Parking providers to fulfill your bookings</li>
                    <li>Payment processors to complete transactions</li>
                    <li>Service providers who assist our operations</li>
                    <li>Legal authorities when required by law</li>
                    <li>Business partners (with your consent)</li>
                </ul>
                <p>We never sell your personal information to third parties.</p>
            `
        },
        {
            id: 'data-protection',
            title: 'Data Security',
            content: `
                <p>We implement appropriate technical and organizational measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction.</p>
                <p>Security measures include:</p>
                <ul>
                    <li>SSL encryption for data transmission</li>
                    <li>Secure storage systems</li>
                    <li>Regular security assessments</li>
                    <li>Employee training on data protection</li>
                </ul>
            `
        },
        {
            id: 'your-rights',
            title: 'Your Rights',
            content: `
                <p>Under data protection laws, you have rights including:</p>
                <ul>
                    <li><strong>Right to access:</strong> You can request copies of your personal data</li>
                    <li><strong>Right to rectification:</strong> You can request correction of inaccurate data</li>
                    <li><strong>Right to erasure:</strong> You can request deletion of your personal data</li>
                    <li><strong>Right to restrict processing:</strong> You can request limitation of data processing</li>
                    <li><strong>Right to data portability:</strong> You can request transfer of your data</li>
                    <li><strong>Right to object:</strong> You can object to certain processing activities</li>
                </ul>
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
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
                            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                                Your privacy is important to us. This policy explains how we collect, use, and protect 
                                your personal information when you use our services.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar Navigation */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md sticky top-24">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Policy Sections</h3>
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
                                        <p className="text-gray-500 text-sm">Last updated: January 1, 2024</p>
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

                                {/* Contact Information */}
                                <div className="mt-6 bg-blue-50 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Privacy Concerns</h3>
                                    <p className="text-gray-600 mb-4">
                                        If you have any questions about this Privacy Policy or how we handle your 
                                        personal data, please contact our Data Protection Officer.
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> privacy@comparemyparkings.co.uk</p>
                                        <p><strong>Phone:</strong> +44 7876 239148</p>
                                        <p><strong>Address:</strong> 595 Sipson Rd, Sipson, West Drayton UB7 0JD</p>
                                    </div>
                                </div>

                                {/* Policy Updates */}
                                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                We may update this privacy policy from time to time. We will notify you 
                                                of any changes by posting the new policy on this page.
                                            </p>
                                        </div>
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