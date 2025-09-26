'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function PaymentSuccess() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [searchData, setSearchData] = useState(null); // Add state for search data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has payment intent ID in localStorage
    const paymentIntentId = localStorage.getItem('paymentIntentId');
    
    if (!paymentIntentId) {
      router.push('/not-found');
      return;
    }

    // Get booking data from localStorage
    const bookingConfirmation = localStorage.getItem('bookingConfirmation');
    if (bookingConfirmation) {
      setBookingData(JSON.parse(bookingConfirmation));
    }

    // Get search data from localStorage
    const savedSearch = localStorage.getItem('parkingSearch');
    if (savedSearch) {
      setSearchData(JSON.parse(savedSearch));
    }
    
    setLoading(false);
    
    // Clean up payment intent ID from localStorage
    localStorage.removeItem('paymentIntentId');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your booking. Your payment has been processed successfully.
              </p>
              
              {bookingData && searchData && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking Reference</p>
                      <p className="font-medium">{bookingData.bookingReference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Paid</p>
                      <p className="font-medium">£{bookingData.paidAmount}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Parking Location</p>
                    <p className="font-medium">{bookingData.ParkingName || bookingData.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Date & Time</p>
                      <p className="font-medium">
                        {searchData.startDate} at {searchData.startTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date & Time</p>
                      <p className="font-medium">
                        {searchData.endDate} at {searchData.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to {bookingData?.customerDetails?.email}. 
                Please check your inbox (and spam folder) for booking details.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Print Confirmation
                </button>
                <Link
                  href="/"
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium text-center"
                >
                  Book Another Parking
                </Link>
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