'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FAQ() {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const faqCategories = [
        {
            id: 'booking',
            title: 'Booking & Reservations',
            items: [
                {
                    id: 1,
                    question: 'How do I make a booking?',
                    answer: 'To make a booking, simply search for your desired parking location, select your dates and times, choose a parking option that suits your needs, and proceed to payment. You will receive a confirmation email with all the details.'
                },
                {
                    id: 2,
                    question: 'Can I book parking for someone else?',
                    answer: 'Yes, you can book parking for someone else. Just make sure to provide the correct vehicle details and contact information for the driver who will be using the parking space.'
                },
                {
                    id: 3,
                    question: 'What payment methods do you accept?',
                    answer: 'We accept all major credit and debit cards including Visa, MasterCard, and American Express. We also support PayPal and other digital payment methods.'
                }
            ]
        },
        {
            id: 'cancellation',
            title: 'Cancellations & Modifications',
            items: [
                {
                    id: 4,
                    question: 'How do I cancel my booking?',
                    answer: 'You can cancel your booking by logging into your account and navigating to "My Bookings" or by contacting our customer service team. Please refer to our cancellation policy for specific terms.'
                },
                {
                    id: 5,
                    question: 'Is there a fee for cancelling?',
                    answer: 'Cancellation fees depend on how close to your booking time you cancel. Free cancellation is usually available up to 24 hours before your booking start time.'
                },
                {
                    id: 6,
                    question: 'Can I modify my booking dates?',
                    answer: 'Yes, you can modify your booking dates subject to availability. Modifications may be subject to price differences and should be made at least 24 hours in advance.'
                }
            ]
        },
        {
            id: 'parking',
            title: 'Parking & Facilities',
            items: [
                {
                    id: 7,
                    question: 'What facilities are available at the parking locations?',
                    answer: 'Facilities vary by location but may include CCTV surveillance, security patrols, disabled access, electric vehicle charging points, and shuttle services to airports.'
                },
                {
                    id: 8,
                    question: 'Is my vehicle insured while parked?',
                    answer: 'While we ensure all our partner car parks have adequate security measures, vehicle insurance remains the responsibility of the vehicle owner. We recommend checking your own insurance policy.'
                },
                {
                    id: 9,
                    question: 'What happens if I arrive late?',
                    answer: 'If you arrive later than your scheduled time, your parking space will still be available. However, we recommend informing the car park operator if you anticipate a significant delay.'
                }
            ]
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
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
                            <p className="text-gray-600 text-lg">
                                Find answers to common questions about our parking services, bookings, and policies.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="relative max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Search FAQs..."
                                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* FAQ Categories */}
                        <div className="space-y-6">
                            {faqCategories.map(category => (
                                <div key={category.id} className="bg-white rounded-lg shadow-md">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {category.items.map(item => (
                                            <div key={item.id} className="p-6">
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className="flex justify-between items-center w-full text-left"
                                                >
                                                    <span className="text-lg font-semibold text-gray-800 pr-4">
                                                        {item.question}
                                                    </span>
                                                    <svg 
                                                        className={`w-5 h-5 text-gray-600 transform transition-transform ${
                                                            openItems[item.id] ? 'rotate-180' : ''
                                                        }`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                {openItems[item.id] && (
                                                    <div className="mt-4 text-gray-600 leading-relaxed">
                                                        {item.answer}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
                            <p className="text-gray-600 mb-4">Cant find the answer you are looking for? Please contact our friendly team.</p>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}