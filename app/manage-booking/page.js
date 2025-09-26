'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function ManageBooking() {
  const router = useRouter();
  const [bookingReference, setBookingReference] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!bookingReference.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setLoading(true);
    setError('');
    setBookingData(null);
    setSearchPerformed(true);

    try {
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const allBookings = await response.json();
      
      // Find the booking with matching orderId
      const foundBooking = allBookings.find(booking => 
        booking.orderId.toUpperCase() === bookingReference.toUpperCase()
      );

      if (foundBooking) {
        setBookingData(foundBooking);
      } else {
        setError('Booking not found. Please check your reference number.');
      }
    } catch (err) {
      setError('Error searching for booking. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDynamoDBData = (data) => {
    if (!data) return null;

    // Helper function to extract values from DynamoDB format
    const extractValue = (value) => {
      if (value?.S) return value.S;
      if (value?.N) return parseFloat(value.N);
      if (value?.BOOL !== undefined) return value.BOOL;
      if (value?.L) return value.L.map(item => extractValue(item));
      if (value?.M) {
        const obj = {};
        Object.keys(value.M).forEach(key => {
          obj[key] = extractValue(value.M[key]);
        });
        return obj;
      }
      return value;
    };

    return {
      orderId: extractValue(data.orderId) || extractValue(data.id),
      ParkingName: extractValue(data.ParkingName),
      Location: extractValue(data.Location),
      bookingDetails: extractValue(data.bookingDetails) || {},
      customerDetails: extractValue(data.customerDetails) || {},
      services: extractValue(data.services) || [],
      instruction: extractValue(data.instruction),
      isTest: extractValue(data.isTest),
      createdAt: extractValue(data.createdAt),
      updatedAt: extractValue(data.updatedAt)
    };
  };

  const downloadConfirmation = () => {
    if (!bookingData) return;

    const formattedData = formatDynamoDBData(bookingData);
    const confirmationText = `
Booking Confirmation
===================

Booking Reference: ${formattedData.orderId}
Parking Location: ${formattedData.ParkingName}
Airport: ${formattedData.Location}

Customer Details:
-----------------
Name: ${formattedData.customerDetails.title} ${formattedData.customerDetails.firstName} ${formattedData.customerDetails.lastName}
Email: ${formattedData.customerDetails.email}
Phone: ${formattedData.customerDetails.contactNumber}
Vehicle: ${formattedData.customerDetails.carReg}

Booking Details:
----------------
Start: ${formattedData.bookingDetails.startDate} at ${formattedData.bookingDetails.startTime}
End: ${formattedData.bookingDetails.endDate} at ${formattedData.bookingDetails.endTime}
Duration: ${formattedData.bookingDetails.duration} days
Terminal: ${formattedData.bookingDetails.terminal}
Status: ${formattedData.bookingDetails.status}
Total Paid: £${formattedData.bookingDetails.totalPrice}

Flight Information:
------------------
Departure Flight: ${formattedData.customerDetails.flightNumber}
Departure Terminal: ${formattedData.customerDetails.departureTerminal}
Return Flight: ${formattedData.customerDetails.returnFlightNumber}
Arrival Terminal: ${formattedData.customerDetails.arrivalTerminal}

Included Services:
------------------
${formattedData.services.map(service => `• ${service}`).join('\n')}

Special Instructions: ${formattedData.customerDetails.customerInstruction || 'None'}

Booking Date: ${new Date(formattedData.createdAt).toLocaleDateString()}

Thank you for choosing ParkCompare!
    `.trim();

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${formattedData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedBooking = bookingData ? formatDynamoDBData(bookingData) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Your Booking</h1>
              <p className="text-gray-600">Enter your booking reference to view and manage your parking reservation</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="bookingReference" className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Reference
                  </label>
                  <input
                    type="text"
                    id="bookingReference"
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                    placeholder="Enter your booking reference (e.g., PCKPLOYJSE9)"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {loading ? 'Searching...' : 'Find Booking'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Booking Details */}
            {searchPerformed && !loading && formattedBooking && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmation</h2>
                    <p className="text-green-600 font-medium">Booking Found ✓</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadConfirmation}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-medium">{formattedBooking.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-green-600 capitalize">{formattedBooking.bookingDetails.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Paid:</span>
                          <span className="font-medium">£{formattedBooking.bookingDetails.totalPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Date:</span>
                          <span className="font-medium">{new Date(formattedBooking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Parking Details</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-600">Provider:</span>
                          <p className="font-medium">{formattedBooking.ParkingName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-medium">{formattedBooking.Location}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Start:</span>
                            <p className="font-medium">{formattedBooking.bookingDetails.startDate} at {formattedBooking.bookingDetails.startTime}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">End:</span>
                            <p className="font-medium">{formattedBooking.bookingDetails.endDate} at {formattedBooking.bookingDetails.endTime}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{formattedBooking.bookingDetails.duration} days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">{formattedBooking.customerDetails.title} {formattedBooking.customerDetails.firstName} {formattedBooking.customerDetails.lastName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium">{formattedBooking.customerDetails.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <p className="font-medium">{formattedBooking.customerDetails.contactNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Vehicle:</span>
                          <p className="font-medium">{formattedBooking.customerDetails.carReg}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Flight Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Departure:</span>
                            <p className="font-medium">{formattedBooking.customerDetails.flightNumber}</p>
                            <p className="text-sm text-gray-500">Terminal {formattedBooking.customerDetails.departureTerminal}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Return:</span>
                            <p className="font-medium">{formattedBooking.customerDetails.returnFlightNumber}</p>
                            <p className="text-sm text-gray-500">Terminal {formattedBooking.customerDetails.arrivalTerminal}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formattedBooking.services && formattedBooking.services.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Included Services</h3>
                        <ul className="space-y-1">
                          {formattedBooking.services.map((service, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {formattedBooking.customerDetails.customerInstruction && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Special Instructions</h3>
                    <p className="text-gray-700">{formattedBooking.customerDetails.customerInstruction}</p>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium text-center"
                  >
                    Book Another Parking
                  </Link>
                  <button
                    onClick={() => setBookingReference('')}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Search Another Booking
                  </button>
                </div>
              </div>
            )}

            {searchPerformed && !loading && !bookingData && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Booking Found</h3>
                <p className="text-gray-600 mb-6">Please check your booking reference and try again.</p>
                <button
                  onClick={() => setSearchPerformed(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}