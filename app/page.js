'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState('default');
    const [errors, setErrors] = useState({});
    const [minStartDateTime, setMinStartDateTime] = useState('');
    const [minEndDateTime, setMinEndDateTime] = useState('');

    // State for form data
    const [searchData, setSearchData] = useState({
        airport: "",
        terminal: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
    });

    const [datetimeInputs, setDatetimeInputs] = useState({
        startDateTime: "",
        endDateTime: ""
    });

    // State for active navigation link
    const [activeLink, setActiveLink] = useState('Home');

    useEffect(() => {
        // Set minimum datetime for start date (current datetime)
        const now = new Date();
        // Round to nearest 15 minutes
        const minutes = Math.ceil(now.getMinutes() / 15) * 15;
        now.setMinutes(minutes);
        const currentDateTimeLocal = now.toISOString().slice(0, 16);
        setMinStartDateTime(currentDateTimeLocal);

        // Convert date and time to datetime-local format
        const convertToDateTimeLocal = (date, time) => {
            if (!date) return '';
            
            const time24h = convertTo24Hour(time);
            return `${date}T${time24h}`;
        };

        const savedSearchData = localStorage.getItem('parkingSearch');
        if (savedSearchData) {
            try {
                const parsedData = JSON.parse(savedSearchData);
                setSearchData(prevState => ({
                    ...prevState,
                    ...parsedData
                }));
                
                // Convert saved date/time to datetime-local format for inputs
                if (parsedData.startDate && parsedData.startTime) {
                    const startDateTime = convertToDateTimeLocal(parsedData.startDate, parsedData.startTime);
                    setDatetimeInputs(prev => ({ ...prev, startDateTime }));
                    
                    // Set minimum end date based on saved start date
                    if (parsedData.startDate) {
                        const startDate = new Date(parsedData.startDate);
                        const minEndDate = new Date(startDate);
                        minEndDate.setDate(minEndDate.getDate() + 1);
                        const minEndDateTimeLocal = minEndDate.toISOString().slice(0, 16);
                        setMinEndDateTime(minEndDateTimeLocal);
                    }
                }
                if (parsedData.endDate && parsedData.endTime) {
                    const endDateTime = convertToDateTimeLocal(parsedData.endDate, parsedData.endTime);
                    setDatetimeInputs(prev => ({ ...prev, endDateTime }));
                }
            } catch (error) {
                console.error("Error parsing saved search data:", error);
            }
        }   
    }, []);

    
    // Validation function
    const validateForm = () => {
        const newErrors = {};
        
        if (!searchData.airport.trim()) {
            newErrors.airport = 'Please select an airport';
        }
        
        if (!searchData.terminal.trim()) {
            newErrors.terminal = 'Please select a terminal';
        }
        
        if (!searchData.startDate.trim()) {
            newErrors.startDateTime = 'Please select start date and time';
        }
        
        if (!searchData.endDate.trim()) {
            newErrors.endDateTime = 'Please select end date and time';
        }
        
        // Validate that end date/time is after start date/time
        if (searchData.startDate && searchData.endDate) {
            const start = new Date(`${searchData.startDate}T${convertTo24Hour(searchData.startTime)}`);
            const end = new Date(`${searchData.endDate}T${convertTo24Hour(searchData.endTime)}`);
            
            if (end <= start) {
                newErrors.endDateTime = 'End date/time must be after start date/time';
            }
            
            // Validate minimum 1 day difference
            const timeDiff = end.getTime() - start.getTime();
            const dayDiff = timeDiff / (1000 * 3600 * 24);
            if (dayDiff < 1) {
                newErrors.endDateTime = 'Parking duration must be at least 1 day';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear specific error when user starts typing
    const clearError = (fieldName) => {
        setErrors(prev => ({
            ...prev,
            [fieldName]: ''
        }));
    };

    // Convert 12-hour time to 24-hour time
    const convertTo24Hour = (time12h) => {
        if (!time12h) return '00:00';
        
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
            hours = '00';
        }
        
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
    };

    // Convert 24-hour time to 12-hour time
    const convertTo12Hour = (time24h) => {
        if (!time24h) return '12:00 AM';
        
        let [hours, minutes] = time24h.split(':');
        hours = parseInt(hours, 10);
        
        const modifier = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        
        return `${hours}:${minutes} ${modifier}`;
    };

    // Handle datetime-local input changes and split into date/time
    const handleDateTimeChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        clearError(name);
        
        // Update datetime inputs
        setDatetimeInputs(prev => ({
            ...prev,
            [name]: value
        }));

        // Split datetime-local value into separate date and time
        if (value) {
            const [date, time] = value.split('T');
            const time12h = convertTo12Hour(time);
            
            if (name === 'startDateTime') {
                setSearchData(prev => ({
                    ...prev,
                    startDate: date,
                    startTime: time12h
                }));

                // Update minimum end date to be at least 1 day after start date
                if (date) {
                    const startDate = new Date(date);
                    const minEndDate = new Date(startDate);
                    minEndDate.setDate(minEndDate.getDate() + 1);
                    const minEndDateTimeLocal = minEndDate.toISOString().slice(0, 16);
                    setMinEndDateTime(minEndDateTimeLocal);

                    // If current end date is before new minimum, clear it
                    if (datetimeInputs.endDateTime && new Date(datetimeInputs.endDateTime) < minEndDate) {
                        setDatetimeInputs(prev => ({ ...prev, endDateTime: '' }));
                        setSearchData(prev => ({
                            ...prev,
                            endDate: "",
                            endTime: "12:00 AM"
                        }));
                    }
                }
            } else if (name === 'endDateTime') {
                setSearchData(prev => ({
                    ...prev,
                    endDate: date,
                    endTime: time12h
                }));
            }
        } else {
            // Clear values if input is empty
            if (name === 'startDateTime') {
                setSearchData(prev => ({
                    ...prev,
                    startDate: "",
                    startTime: "12:00 AM"
                }));
                // Reset min end date
                setMinEndDateTime('');
            } else if (name === 'endDateTime') {
                setSearchData(prev => ({
                    ...prev,
                    endDate: "",
                    endTime: "12:00 AM"
                }));
            }
        }
    }

    // Handle other input changes (airport, terminal)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        clearError(name);
        
        setSearchData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission with minimum 3-second loading
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('parkingSearch', JSON.stringify(searchData));
        
        // Show loading with compare type
        setIsLoading(true);
        setLoadingType('compare');
        
        // Start timing for minimum 3 seconds
        const startTime = Date.now();
        
        try {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(3000 - elapsedTime, 0);
            
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            
        } catch (error) {
            console.error('Error during search:', error);
        } finally {
            // Redirect to compare page
            router.push('/compare?loading=compare');
        }
    };

    // Helper function to determine input border color
    const getInputBorderColor = (fieldName) => {
        return errors[fieldName] ? 'border-red-500' : 'border-gray-300';
    };

    if (isLoading) {
        return <Loading type={loadingType} count={76} />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Head>
                <title>Compare Airport Parking | Best Deals at Heathrow</title>
                <meta name="description" content="Compare and save on airport parking at Heathrow. Best prices guaranteed on meet & greet, park & ride, and onsite parking." />
            </Head>
            
            {/* Main header */}
            <Header />
            
            {/* Main content */}
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Airport Parking Made Simple</h1>
                        <p className="text-xl text-blue-100 mb-8">Compare prices across all major providers</p>
                        
                        {/* Search form - Holiday Extras style */}
                        <div className="bg-white p-6 rounded-lg shadow-xl w-[80%] mx-auto">
                            <div className="flex items-center mb-4">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-gray-700">Compare airport parking deals</span>
                            </div>
                            
                            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4" onSubmit={handleSubmit}>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Airport</label>
                                    <div className="relative">
                                        <select
                                            name="airport"
                                            value={searchData.airport}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-black bg-white ${getInputBorderColor('airport')}`}
                                        >
                                            <option value="">Select Airport</option>
                                            <option value="Heathrow">London Heathrow (LHR)</option>
                                            <option disabled value="Gatwick">London Gatwick (LGW)</option>
                                            <option disabled value="Stansted">London Stansted (STN)</option>
                                            <option disabled value="Luton">London Luton (LTN)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.airport && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.airport}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
                                    <div className="relative">
                                        <select 
                                            name="terminal"
                                            value={searchData.terminal}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 border rounded-md text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white ${getInputBorderColor('terminal')}`}
                                        >
                                            <option value="">Select Terminal</option>
                                            <option>All terminals</option>
                                            <option>Terminal 2</option>
                                            <option>Terminal 3</option>
                                            <option>Terminal 4</option>
                                            <option>Terminal 5</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.terminal && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.terminal}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="startDateTime"
                                        value={datetimeInputs.startDateTime}
                                        onChange={handleDateTimeChange}
                                        min={minStartDateTime}
                                        className={`w-full p-3 border rounded-md text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent ${getInputBorderColor('startDateTime')}`} 
                                    />
                                    {errors.startDateTime && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.startDateTime}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="endDateTime"
                                        value={datetimeInputs.endDateTime}
                                        onChange={handleDateTimeChange}
                                        min={minEndDateTime}
                                        className={`w-full p-3 text-black border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${getInputBorderColor('endDateTime')}`}
                                    />
                                    {errors.endDateTime && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.endDateTime}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex items-end lg:col-span-2">
                                    <button type="submit" className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 font-medium cursor-pointer transition-colors text-lg h-[52px] flex items-center justify-center whitespace-nowrap">
                                        Find Parking
                                    </button>
                                </div>
                            </form>
                            
                            <div className="mt-4 text-sm text-gray-600">
                                <p>💡 <strong>Top tip:</strong> Book early to secure the best prices!</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Rest of your components remain the same */}
                <section className="py-8 bg-gray-50 border-b">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">4.8/5</div>
                                <div className="text-sm text-gray-600">Trustpilot Rating</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">98%</div>
                                <div className="text-sm text-gray-600">Customer Satisfaction</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">10M+</div>
                                <div className="text-sm text-gray-600">Happy Customers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">24/7</div>
                                <div className="text-sm text-gray-600">Customer Support</div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Popular Services */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Popular Heathrow Parking Options</h2>
                        <p className="text-center text-gray-600 mb-8">Choose the parking option thats right for you</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Meet and Greet */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="h-48 bg-blue-100 relative">
                                    <Image 
                                        src="/meet and greet.jpg" 
                                        alt="Meet and Greet Parking" 
                                        className="w-full h-full object-cover"
                                        width={400}
                                        height={300}
                                    />
                                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Meet & Greet</h3>
                                    <p className="text-gray-600 mb-4">Meet at the terminal - no transfers needed</p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Meet at terminal</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Ideal for families</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Secure compound</span>
                                        </li>
                                    </ul>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-900">From £89.99</span>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                            View Deals
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Park and Ride */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="h-48 bg-blue-100">
                                    <Image
                                        src="/Park and ride.jpg" 
                                        alt="Park and Ride" 
                                        className="w-full h-full object-cover"
                                        width={400}
                                        height={300}
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Park & Ride</h3>
                                    <p className="text-gray-600 mb-4">Park yourself and take a short shuttle bus</p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Best value</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Frequent transfers</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Secure parking</span>
                                        </li>
                                    </ul>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-900">From £49.99</span>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                            View Deals
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Popular Services */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Popular Heathrow Parking Options</h2>
                        <p className="text-center text-gray-600 mb-8">Choose the parking option thats right for you</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Meet and Greet */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="h-48 bg-blue-100 relative">
                                    <Image 
                                        src="/meet and greet.jpg" 
                                        alt="Meet and Greet Parking" 
                                        className="w-full h-full object-cover"
                                        width={400}  // Add width
                                        height={300} // Add height
                                    />
                                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Meet & Greet</h3>
                                    <p className="text-gray-600 mb-4">Meet at the terminal - no transfers needed</p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Meet at terminal</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Ideal for families</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Secure compound</span>
                                        </li>
                                    </ul>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-900">From £89.99</span>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                            View Deals
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Park and Ride */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="h-48 bg-blue-100">
                                    <Image
                                        src="/Park and ride.jpg" 
                                        alt="Park and Ride" 
                                        className="w-full h-full object-cover"
                                        width={400}  // Add width
                                        height={300} // Add height
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Park & Ride</h3>
                                    <p className="text-gray-600 mb-4">Park yourself and take a short shuttle bus</p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Best value</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Frequent transfers</span>
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">Secure parking</span>
                                        </li>
                                    </ul>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-900">From £49.99</span>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                            View Deals
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Why Book With Us?</h2>
                        <p className="text-center text-gray-600 mb-12">We make airport parking simple and stress-free</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">Best Price Guarantee</h3>
                                <p className="text-gray-600">Found it cheaper? We will match the price and give you 10% of the difference.</p>
                            </div>
                            
                            <div className="text-center p-6">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">ABTA & ATOL Protected</h3>
                                <p className="text-gray-600">Your money is safe with us. We are fully protected and accredited.</p>
                            </div>
                            
                            <div className="text-center p-6">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">Free Cancellation</h3>
                                <p className="text-gray-600">Change of plans? Cancel for free up to 24 hours before your booking.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">What Our Customers Say</h2>
                        <p className="text-center text-gray-600 mb-12">Dont just take our word for it</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="text-orange-400 flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Absolutely brilliant service! The meet and greet was seamless and saved us so much time with young children. Will definitely use again.
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                                        <p className="text-gray-500 text-sm">Heathrow Terminal 5</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <div className="text-orange-400 flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Great prices and even better service. The park and ride was efficient and the staff were very helpful. Saved over £30 compared to booking direct.
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Michael Thompson</h4>
                                        <p className="text-gray-500 text-sm">Business Traveller</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Frequently Asked Questions</h2>
                        
                        <div className="max-w-3xl mx-auto mt-8">
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-4">
                                    <button className="flex justify-between items-center w-full text-left font-medium text-gray-900">
                                        <span>How does the price comparison work?</span>
                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <div className="mt-2 text-gray-600">
                                        <p>We search across all major parking providers at your chosen airport to find you the best deals. Our system compares prices, services, and customer reviews to present you with options that match your specific needs.</p>
                                    </div>
                                </div>
                                
                                <div className="border-b border-gray-200 pb-4">
                                    <button className="flex justify-between items-center w-full text-left font-medium text-gray-900">
                                        <span>What is your cancellation policy?</span>
                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <div className="mt-2 text-gray-600">
                                        <p>Most bookings can be cancelled free of charge up to 24 hours before your parking start date. Some providers may have different policies, which will be clearly displayed before you book.</p>
                                    </div>
                                </div>
                                
                                <div className="border-b border-gray-200 pb-4">
                                    <button className="flex justify-between items-center w-full text-left font-medium text-gray-900">
                                        <span>Are the parking facilities secure?</span>
                                        <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <div className="mt-2 text-gray-600">
                                        <p>Yes, all parking providers we work with must meet our security standards. Most facilities feature 24/7 surveillance, security fencing, regular patrols, and well-lit areas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>   
        </div>
    );
}