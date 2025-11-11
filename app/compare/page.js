'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import Image from 'next/image';


export default function Compare() {
    const router = useRouter();
    const [searchData, setSearchData] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recommended');
    const [selectedParking, setSelectedParking] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [parkingOptions, setParkingOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Calculate duration from search data
    const calculateDuration = () => {
        if (!searchData?.startDate || !searchData?.endDate) return 0;
        
        const start = new Date(searchData.startDate);
        const end = new Date(searchData.endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return duration > 0 ? duration : 1;
    };

    const duration = calculateDuration();

    // Calculate price based on pricing tiers and duration
    const calculatePrice = (pricingTiers, duration) => {
        if (!pricingTiers || !duration) return 0;
        
        // Find the appropriate pricing tier
        const tier = pricingTiers.find(tier => 
            duration >= tier.minDays && duration <= tier.maxDays
        );
        
        if (!tier) {
            // If no tier found, use the last tier for longer durations
            const lastTier = pricingTiers[pricingTiers.length - 1];
            return lastTier.basic + (lastTier.perDay * duration);
        }
        
        return tier.basic + (tier.perDay * duration);
    };

    
    // Fetch parking companies data from API
    useEffect(() => {
        const fetchParkingData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/companys');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch parking data');
                }
                
                const data = await response.json();
                
                // Transform the API data to match our frontend structure
                const transformedData = data.map(company => ({
                    id: company.id,
                    name: company.name,
                    title: company.name, // Added for checkout page compatibility
                    type: company.type,
                    price: calculatePrice(company.pricingTiers, duration),
                    rating: parseFloat(company.Stars),
                    reviewCount: parseInt(company.StarredRatingsCount),
                    reviews: parseInt(company.StarredRatingsCount), // Added for checkout page
                    distance: company.distance,
                    transferTime: company.transferTime,
                    features: company.AvailableFacilities.split('\n-.\n').filter(f => f.trim()),
                    logo: company.Displaypicture,
                    images: company.images,
                    mapUrl: company.mapUrl,
                    reviews: company.reviews || [], // Ensure reviews array exists
                    pricingTiers: company.pricingTiers,
                    description: `${company.type} parking at ${company.distance} from terminal`, // Added for checkout
                    services: company.AvailableFacilities.split('\n-.\n').filter(f => f.trim()).slice(0, 3) // Added for checkout
                }));
                
                setParkingOptions(transformedData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching parking data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchParkingData();
    }, [duration]);

    // Load search data from localStorage
    useEffect(() => {
        const savedSearchData = localStorage.getItem('parkingSearch');
        if (savedSearchData) {
            try {
                const parsedData = JSON.parse(savedSearchData);
                setSearchData(parsedData);
            } catch (error) {
                console.error("Error parsing saved search data:", error);
            }
        }
    }, []);

    // Handle booking selection
    const handleSelectBooking = (parking) => {
        try {
            // Prepare the booking data for checkout page
            const bookingData = {
                id: parking.id,
                name: parking.name,
                title: parking.title || parking.name,
                type: parking.type,
                price: parking.price,
                rating: parking.rating,
                reviewCount: parking.reviewCount,
                reviews: parking.reviews,
                distance: parking.distance,
                transferTime: parking.transferTime,
                features: parking.features,
                logo: parking.logo,
                images: parking.images,
                mapUrl: parking.mapUrl,
                pricingTiers: parking.pricingTiers,
                description: parking.description || `${parking.type} parking at ${parking.distance} from terminal`,
                services: parking.services || parking.features.slice(0, 3)
            };

            // Save to localStorage
            localStorage.setItem('selectedParking', JSON.stringify(bookingData));
            
            // Navigate to checkout page
            router.push('/checkout');
            
        } catch (error) {
            console.error('Error saving booking selection:', error);
            alert('There was an error processing your selection. Please try again.');
        }
    };

    // Filter parking options based on active filter
    const filteredOptions = parkingOptions.filter(option => {
        if (activeFilter === 'all') return true;
        return option.type === activeFilter;
    });

    // Sort parking options
    const sortedOptions = [...filteredOptions].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'distance':
                return a.distance.localeCompare(b.distance);
            default:
                return b.rating - a.rating; // recommended
        }
    });

    const openModal = (parking, type) => {
        setSelectedParking(parking);
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedParking(null);
        setModalType(null);
    };

    const getRatingColor = (rating) => {
        if (rating >= 8.5) return 'bg-green-500';
        if (rating >= 7.5) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <Loading type="default" message="Loading parking options..." />
            </div>
            );
        }


    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center text-red-600">
                        <p>Error loading parking options: {error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>Compare Heathrow Parking Deals | Best Prices</title>
                <meta name="description" content="Compare all Heathrow airport parking options. Find the best deals on meet & greet, park & ride, and onsite parking." />
            </Head>
            
            {/* Main header */}
            <Header/>
            
            {/* Search Summary */}
            <section className="bg-white border-b py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Heathrow Airport Parking
                            </h1>
                            {searchData && (
                                <div className="text-gray-600">
                                    <p>
                                        {searchData.startDate} to {searchData.endDate} • Terminal {searchData.terminal}
                                    </p>
                                    <p className="text-sm text-orange-600 font-medium">
                                        Duration: {duration} day{duration !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button 
                                onClick={() => router.push('/')}
                                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                            >
                                Modify Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Sorting */}
            <section className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        {/* Filter Tabs */}
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Options
                            </button>
                            <button
                                onClick={() => setActiveFilter('meet-greet')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'meet-greet' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Meet & Greet
                            </button>
                            <button
                                onClick={() => setActiveFilter('park-ride')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'park-ride' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Park & Ride
                            </button>
                            <button
                                onClick={() => setActiveFilter('on-airport')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeFilter === 'on-airport' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                On Airport
                            </button>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="recommended">Recommended</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Customer Rating</option>
                                <option value="distance">Distance</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Count */}
            <section className="bg-gray-50 py-4">
                <div className="container mx-auto px-4">
                    <p className="text-gray-600">
                        Showing {sortedOptions.length} parking options for {duration} day{duration !== 1 ? 's' : ''}
                    </p>
                </div>
            </section>

            {/* Parking Options Grid */}
            <main className="flex-grow py-8">
                <div className="container mx-auto px-4">
                    {sortedOptions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No parking options found for your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {sortedOptions.map((parking) => (
                                <div key={parking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    {/* Parking Card Header with Logo */}
                                    <div className="p-6 border-b">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start space-x-4">
                                                {/* Logo */}
                                                <div className="flex-shrink-0">
                                                    <Image 
                                                        src={parking.logo} 
                                                        alt={`${parking.name} logo`}
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                        width={400}  // Add width
                                                        height={300} // Add height
                                                    />
                                                </div>
                                                {/* Parking Info */}
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{parking.name}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span>{parking.distance} from terminal</span>
                                                        <span>•</span>
                                                        <span>Transfer: {parking.transferTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Rating */}
                                            <div className={`${getRatingColor(parking.rating)} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center`}>
                                                <span className="text-2xl font-bold">{parking.rating}</span>
                                                <span className="text-xs">/10</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {parking.features.map((feature, index) => (
                                                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Action Buttons 
                                        <div className="flex space-x-3">
                                            <button 
                                                onClick={() => openModal(parking, 'photos')}
                                                className="flex items-center text-blue-600 hover:text-orange-500 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Photos
                                            </button>
                                            <button 
                                                onClick={() => openModal(parking, 'map')}
                                                className="flex items-center text-blue-600 hover:text-orange-500 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Map
                                            </button>
                                            <button 
                                                onClick={() => openModal(parking, 'reviews')}
                                                className="flex items-center text-blue-600 hover:text-orange-500 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Reviews ({parking.reviewCount})
                                            </button>
                                        </div>
                                        */}
                                    </div>``
                                    

                                    {/* Parking Card Footer */}
                                    <div className="p-6 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-2xl font-bold text-gray-900">£{parking.price.toFixed(2)}</span>
                                                <span className="text-gray-600 text-sm ml-1">total</span>
                                                <p className="text-green-600 text-sm font-medium mt-1">Free cancellation until 24 hours before</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSelectBooking(parking)}
                                                className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors font-medium"
                                            >
                                                Select & Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {selectedParking && modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedParking.name} - {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                            </h3>
                            <button 
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-auto max-h-[70vh]">
                            {modalType === 'photos' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedParking.images.map((image, index) => (
                                        <Image 
                                            key={index}
                                            src={image} 
                                            alt={`${selectedParking.name} ${index + 1}`}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            )}

                            {modalType === 'map' && (
                                <div className="h-96">
                                    <iframe
                                        src={selectedParking.mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}

                            {modalType === 'reviews' && (
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className={`${getRatingColor(selectedParking.rating)} text-white rounded-full w-20 h-20 flex flex-col items-center justify-center mr-6`}>
                                            <span className="text-3xl font-bold">{selectedParking.rating}</span>
                                            <span className="text-sm">/10</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedParking.rating}/10</div>
                                            <div className="text-gray-600">Based on {selectedParking.reviewCount} reviews</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {selectedParking.reviews.map((review, index) => (
                                            <div key={index} className="border-b pb-4 last:border-b-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium text-gray-900">{review.name}</div>
                                                    <div className="text-yellow-400 flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mb-2">{review.comment}</p>
                                                <div className="text-sm text-gray-500">{review.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-gray-50">
                            <button 
                                onClick={closeModal}
                                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}

            <Footer />
        </div>
    );
}