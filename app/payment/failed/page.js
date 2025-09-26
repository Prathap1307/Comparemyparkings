'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailed() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has payment intent ID in localStorage
    const paymentIntentId = localStorage.getItem('paymentIntentId');
    
    if (!paymentIntentId) {
      router.push('/not-found');
      return;
    }

    // Clean up payment intent ID from localStorage
    localStorage.removeItem('paymentIntentId');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <div className="h-10 w-48 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">ParkCompare</span>
              </div>
            </div>
            
            {/* Help button */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Help & Contact
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Failed</h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but your payment could not be processed. This could be due to insufficient funds, 
                an issue with your card, or a temporary problem with our payment system.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your booking has not been confirmed. Please try again with a different payment method.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Try Again
                </button>
                <Link
                  href="/compare"
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium text-center"
                >
                  Choose Different Parking
                </Link>
                <Link
                  href="/contact"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 font-medium text-center"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} ParkCompare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}