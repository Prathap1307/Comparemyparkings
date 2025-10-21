'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Tracking() {
    const router = useRouter();
    const [trackingData, setTrackingData] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('');
    const [showReview, setShowReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // Tracking status data with emojis and descriptions
    const trackingStatuses = [
        {
            id: 'collected',
            emoji: '👋',
            title: 'Car Collected',
            description: 'Your car has been collected by our driver',
            time: '10:30 AM',
            date: 'Nov 15, 2024',
            active: true,
            completed: true
        },
        {
            id: 'transit',
            emoji: '🚗',
            title: 'In Transit',
            description: 'Your car is being transported to our secure facility',
            time: '10:45 AM',
            date: 'Nov 15, 2024',
            active: true,
            completed: true
        },
        {
            id: 'secured',
            emoji: '🏢',
            title: 'Secured in Short Stay Yard',
            description: 'Your car is safely stored in our monitored facility',
            time: '11:15 AM',
            date: 'Nov 15, 2024',
            active: true,
            completed: true
        },
        {
            id: 'ready',
            emoji: '⏰',
            title: 'Ready for Return',
            description: 'Your car will be returned before your flight arrival',
            time: 'Estimated 2:30 PM',
            date: 'Nov 20, 2024',
            active: false,
            completed: false
        },
        {
            id: 'returned',
            emoji: '✅',
            title: 'Car Returned',
            description: 'Your car will be waiting at the terminal',
            time: 'Before your arrival',
            date: 'Nov 20, 2024',
            active: false,
            completed: false
        }
    ];

    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: '',
        categories: {
            punctuality: 5,
            communication: 5,
            cleanliness: 5,
            overall: 5
        }
    });

    useEffect(() => {
        // Simulate loading tracking data
        const loadTrackingData = () => {
            // In real app, this would come from an API
            const data = {
                bookingId: 'PK78901234',
                carDetails: {
                    make: 'Audi',
                    model: 'Q5',
                    color: 'Black',
                    license: 'AB23 CDE'
                },
                driver: {
                    name: 'Mike Johnson',
                    phone: '+44 7911 123456'
                },
                facility: {
                    name: 'Heathrow Secure Parking',
                    address: 'Terminal 3 Short Stay Car Park'
                },
                status: 'secured'
            };
            setTrackingData(data);
            setCurrentStatus(data.status);
        };

        loadTrackingData();
    }, []);

    const handleRatingClick = (rating) => {
        setReviewData(prev => ({
            ...prev,
            rating
        }));
    };

    const handleCategoryChange = (category, value) => {
        setReviewData(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: value
            }
        }));
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the review to your backend
        console.log('Review submitted:', reviewData);
        setReviewSubmitted(true);
        setShowReview(false);
        
        // Show success message
        setTimeout(() => {
            router.push('/');
        }, 3000);
    };

    const getStatusEmoji = (statusId) => {
        const status = trackingStatuses.find(s => s.id === statusId);
        return status ? status.emoji : '⏳';
    };

    if (!trackingData) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading tracking information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>Track Your Car | Airport Parking</title>
                <meta name="description" content="Track your car's current status and location" />
            </Head>
            
            <Header />
            
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Tracking</h1>
                                <p className="text-gray-600">Booking ID: {trackingData.bookingId}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-center">
                                <div className="text-6xl mb-2">{getStatusEmoji(currentStatus)}</div>
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Tracking Timeline */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h2>
                                
                                <div className="space-y-4">
                                    {trackingStatuses.map((status, index) => (
                                        <div key={status.id} className="flex items-start space-x-4">
                                            {/* Timeline line */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                                    status.completed 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : status.active
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {status.emoji}
                                                </div>
                                                {index < trackingStatuses.length - 1 && (
                                                    <div className={`w-1 h-16 ${
                                                        status.completed ? 'bg-green-200' : 'bg-gray-200'
                                                    }`}></div>
                                                )}
                                            </div>
                                            
                                            {/* Status content */}
                                            <div className={`flex-1 pb-6 ${
                                                index < trackingStatuses.length - 1 ? 'border-b border-gray-200' : ''
                                            }`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className={`font-semibold ${
                                                            status.completed || status.active 
                                                                ? 'text-gray-900' 
                                                                : 'text-gray-500'
                                                        }`}>
                                                            {status.title}
                                                        </h3>
                                                        <p className={`text-sm ${
                                                            status.completed || status.active 
                                                                ? 'text-gray-600' 
                                                                : 'text-gray-400'
                                                        }`}>
                                                            {status.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-medium ${
                                                            status.completed || status.active 
                                                                ? 'text-gray-900' 
                                                                : 'text-gray-400'
                                                        }`}>
                                                            {status.time}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{status.date}</p>
                                                    </div>
                                                </div>
                                                
                                                {status.active && !status.completed && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center space-x-2 text-blue-600">
                                                            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                                                            <span className="text-sm font-medium">In progress</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Car & Driver Info */}
                        <div className="space-y-6">
                            {/* Car Details */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Car</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🚗</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {trackingData.carDetails.make} {trackingData.carDetails.model}
                                        </p>
                                        <p className="text-sm text-gray-600">{trackingData.carDetails.color}</p>
                                        <p className="text-sm text-gray-500">{trackingData.carDetails.license}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Info */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Driver</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl">👨‍💼</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{trackingData.driver.name}</p>
                                        <p className="text-sm text-gray-600">{trackingData.driver.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Location */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Storage Location</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl">🏢</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{trackingData.facility.name}</p>
                                        <p className="text-sm text-gray-600">{trackingData.facility.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Review Button */}
                            {!reviewSubmitted && (
                                <button
                                    onClick={() => setShowReview(true)}
                                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 font-medium transition-colors"
                                >
                                    📝 Fill Review
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors">
                                <span>📞</span>
                                <span>Contact Driver</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 px-4 rounded-lg hover:bg-green-100 transition-colors">
                                <span>🗺️</span>
                                <span>View Facility Map</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 transition-colors">
                                <span>📄</span>
                                <span>View Booking Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {showReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">How was your experience?</h2>
                            <p className="text-gray-600 mb-6">Share your feedback to help us improve</p>
                            
                            <form onSubmit={handleReviewSubmit}>
                                {/* Star Rating */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Overall Rating
                                    </label>
                                    <div className="flex space-x-2 justify-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingClick(star)}
                                                className="text-3xl focus:outline-none"
                                            >
                                                {star <= reviewData.rating ? '⭐' : '☆'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Ratings */}
                                <div className="space-y-4 mb-6">
                                    {Object.entries(reviewData.categories).map(([category, value]) => (
                                        <div key={category}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                                {category}
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm text-gray-500">Poor</span>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => handleCategoryChange(category, num)}
                                                            className={`w-8 h-8 rounded-full border ${
                                                                num <= value 
                                                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                                                    : 'bg-white border-gray-300 text-gray-400'
                                                            }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">Excellent</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comment */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Comments
                                    </label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData(prev => ({
                                            ...prev,
                                            comment: e.target.value
                                        }))}
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tell us about your experience..."
                                    />
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowReview(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition-colors"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {reviewSubmitted && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-4">Your review has been submitted successfully.</p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to homepage...</p>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}