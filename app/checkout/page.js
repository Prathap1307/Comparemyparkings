'use client';

import { useState, useEffect,useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import PromoValidation from '@/components/PromoValidation';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// CheckoutForm component for Stripe Elements
const CheckoutForm = ({ 
  formData, 
  bookingData, 
  searchData, 
  totalPrice,
  onProcessingChange, 
  handleBooking
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    onProcessingChange(true);

    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.contactNumber || !formData.email || !formData.carReg) {
        alert('Please complete all required fields');
        return;
      }

      // Process payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw error;
      }

      // After successful payment processing
      if (paymentIntent?.status === "succeeded") {
        await handleBooking(paymentIntent.id)
      } else {
        // Payment is processing (not immediately successful)
        alert('Payment is processing. You will receive a confirmation email shortly.');
        router.push('/payment/failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
        <PaymentElement options={{ layout: 'tabs' }} />
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-md hover:bg-green-700 font-medium text-lg mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Pay Now - £${totalPrice.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    carReg: '',
    flightNumber: '',
    departureTerminal: '',
    returnFlightNumber: '',
    arrivalTerminal: '',
    customerInstruction: ''
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

    // Update the handleBooking function

  const handleBooking = async (paymentId) => {
      // Validate form first
      if (!formData.firstName || !formData.lastName || !formData.contactNumber || !formData.email || !formData.carReg) {
          console.error('Please complete all required fields');
          return;
      }

      setProcessing(true);

      try {
          // Create complete booking object
          const completeBooking = {
              ...bookingData,
              ...searchData,
              customerDetails: formData,
              bookingDate: new Date().toISOString(),
              bookingReference: `PC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              paymentIntentId: paymentId,
              status: 'confirmed',
              paidAmount: calculateTotal().toFixed(2),
              isTestBooking: false
          };

          // Save to API
          const response = await fetch('/api/bookings', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  ParkingName: bookingData.title,
                  orderId: completeBooking.bookingReference,
                  Location: searchData?.terminal || 'Heathrow Airport',
                  customerDetails: formData,
                  bookingDetails: {
                      startDate: searchData?.startDate,
                      endDate: searchData?.endDate,
                      startTime: searchData?.startTime,
                      endTime: searchData?.endTime,
                      terminal: searchData?.terminal,
                      duration: calculateDuration(searchData.startDate, searchData.endDate),
                      totalPrice: calculateTotal(),
                      status: 'confirmed'
                  },
                  services: bookingData.services,
                  instruction: formData.customerInstruction || '',
                  isTest: false
              }),
          });

          if (!response.ok) {
              throw new Error('Failed to save booking to database');
          }

          // Send confirmation email
          const emailResponse = await fetch('/api/sendmail', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  customerName: `${formData.firstName} ${formData.lastName}`,
                  customerEmail: formData.email,
                  orderId: completeBooking.bookingReference,
                  bookingDate: new Date().toISOString(),
                  fromDate: searchData.startDate,
                  toDate: searchData.endDate,
                  fromTime: searchData.startTime,
                  toTime: searchData.endTime,
                  airport: searchData.terminal,
                  carNumber: formData.carReg,
                  parkingSlot: bookingData.title,
                  paidAmount: calculateTotal().toFixed(2),
                  paymentMethod: 'Credit Card',
                  departureTerminal: formData.departureTerminal,
                  departureFlightNumber: formData.flightNumber,
                  arrivalTerminal: formData.arrivalTerminal,
                  returnFlightNumber: formData.returnFlightNumber,
                  customerInstruction: formData.customerInstruction,
                  offerApplied: bookingData.offerApplied || 'None',
                  couponApplied: bookingData.couponApplied || 'None',
                  couponDetails: bookingData.couponDetails || 'None',
                  offerDetails: bookingData.offerDetails || 'None',
              }),
          });
          
          if (emailResponse.ok) {
              console.log("Email sent successfully.");
          } else {
              const errorData = await emailResponse.json();
              console.error('Email failed to send:', errorData.error || 'Unknown error');
          }

          // Save to localStorage for confirmation page
          localStorage.setItem('bookingConfirmation', JSON.stringify(completeBooking));
          
          // Redirect to confirmation page
          window.location.href = '/payment/success';

      } catch (error) {
          console.error('Booking failed:', error.message);
      } finally {
          setProcessing(false);
      }
  };
    
  useEffect(() => {
    // Load booking data from localStorage
    const savedBooking = localStorage.getItem('selectedParking');
    const savedSearch = localStorage.getItem('parkingSearch');
    
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    }
    
    if (savedSearch) {
      setSearchData(JSON.parse(savedSearch));
    }
    
    if (!savedBooking) {
      router.push('/compare');
    }
  }, [router]);

  const calculateTotal = useCallback(() => {
    if (!bookingData || !searchData) return 0;
    
    // Recalculate the price using the same logic as Compare page
    const duration = calculateDuration(searchData.startDate, searchData.endDate);
    const baseTotal = calculatePrice(bookingData.pricingTiers, duration);
    
    // Apply promo discount if available
    if (appliedPromo) {
      return appliedPromo.newTotal;
    }
    
    return baseTotal;
  }, [bookingData, searchData, appliedPromo]); // Add all dependencies

  const calculateOriginalTotal = () => {
    if (!bookingData || !searchData) return 0;
    
    const duration = calculateDuration(searchData.startDate, searchData.endDate);
    return calculatePrice(bookingData.pricingTiers, duration);
  };

  // Add this helper function
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Reuse your calculatePrice function from Compare page
  const calculatePrice = (pricingTiers, duration) => {
    if (!pricingTiers || pricingTiers.length === 0) return 0;
    
    for (const tier of pricingTiers) {
      const minDays = parseInt(tier.minDays);
      const maxDays = parseInt(tier.maxDays);
      
      if (duration >= minDays && duration <= maxDays) {
        const basic = parseFloat(tier.basic);
        const perDay = parseFloat(tier.perDay);
        return basic + (perDay * duration);
      }
    }
    
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const minDays = parseInt(lastTier.minDays);
    const basic = parseFloat(lastTier.basic);
    const perDay = parseFloat(lastTier.perDay);
    return basic + (perDay * (duration - minDays));
  };

  useEffect(() => {
    if (!bookingData) return;

    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(calculateTotal() * 100),
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          localStorage.setItem('paymentIntentId', data.paymentIntentId);
        } else {
          console.error("No client secret received");
        }
      } catch (error) {
        console.error("Payment intent error:", error);
        alert("Failed to initialize payment");
      }
    };

    createPaymentIntent();
  }, [bookingData, calculateTotal]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePromoCodeApply = () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }
    // The PromoValidation component will automatically validate when promoCode changes
  };

  const handlePromoValidationResult = (result) => {
    if (result) {
      setAppliedPromo(result);
    } else {
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Checkout | ParkCompare</title>
        <meta name="description" content="Complete your parking booking" />
      </Head>

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600 mb-8">Please review your booking details and complete the form below</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal details</h2>
                <p className="text-red-600 mb-6">Please complete all sections marked *</p>
                
                <div className="space-y-6">
                  {/* Name section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your name</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name Title</label>
                        <select
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                        >
                          <option>Mr</option>
                          <option>Mrs</option>
                          <option>Ms</option>
                          <option>Miss</option>
                          <option>Dr</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact number *</label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                          placeholder="+44 123 456 789"
                        />
                        <p className="text-sm text-gray-500 mt-1">This field is required.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle and flight details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle details and flight information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Car Registration Number *</label>
                        <input
                          type="text"
                          name="carReg"
                          value={formData.carReg}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                          placeholder="AB12 CDE"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number (Departure)*</label>
                        <input
                          type="text"
                          name="flightNumber"
                          value={formData.flightNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                          placeholder="BA 123"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Terminal*</label>
                        <select
                          name="departureTerminal"
                          value={formData.departureTerminal}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                        >
                          <option value="">Select terminal</option>
                          <option>Terminal 2</option>
                          <option>Terminal 3</option>
                          <option>Terminal 4</option>
                          <option>Terminal 5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number (Return)*</label>
                        <input
                          type="text"
                          name="returnFlightNumber"
                          value={formData.returnFlightNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                          placeholder="BA 124"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Terminal*</label>
                        <select
                          name="arrivalTerminal"
                          value={formData.arrivalTerminal}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md text-black"
                        >
                          <option value="">Select terminal</option>
                          <option>Terminal 2</option>
                          <option>Terminal 3</option>
                          <option>Terminal 4</option>
                          <option>Terminal 5</option>
                        </select>
                      </div>
                    </div>
                  </div>
                                    
                  {/* Vehicle and flight details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">instruction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer instruction </label>
                        <input
                            type="text"
                            name="customerInstruction" 
                            value={formData.customerInstruction}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                            placeholder="Customer instruction (if any)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Add this after the customer instruction section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Promo Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    {showPromoInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="flex-1 p-3 border border-gray-300 rounded-md text-black"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPromoInput(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add a promo code
                      </button>
                    )}
                    
                    {/* Promo validation component */}
                    {promoCode && (
                      <PromoValidation
                        promoCode={promoCode}
                        totalPrice={calculateOriginalTotal()}
                        onValidationResult={handlePromoValidationResult}
                      />
                    )}
                    
                    {/* Show applied promo details */}
                    {appliedPromo && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-green-700 font-medium">Promo applied: {promoCode}</span>
                            <p className="text-green-600 text-sm">{appliedPromo.message}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              
              {/* Stripe Payment Element */}
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    formData={formData}
                    bookingData={bookingData}
                    searchData={searchData}
                    totalPrice={calculateTotal()}
                    onProcessingChange={setProcessing}
                    handleBooking={handleBooking}
                  />
                </Elements>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                  <span>Loading payment options...</span>
                </div>
              )}
            </div>
            
            {/* Right column - Booking summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">{bookingData.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{bookingData.description}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{bookingData.rating} ({bookingData.reviewCount || bookingData.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-800">Booking Details</h3>
                  {searchData && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Terminal:</span>
                        <span className="font-medium text-black">{searchData.terminal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Start:</span>
                        <span className="font-medium text-black">{searchData.startDate} at {searchData.startTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End:</span>
                        <span className="font-medium text-black">{searchData.endDate} at {searchData.endTime}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-gray-800">Price Breakdown</h3>
                  
                  {appliedPromo ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-black">Original price:</span>
                        <span>£{appliedPromo.originalTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black">Promo discount:</span>
                        <span className="text-green-600">-£{appliedPromo.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-black">Taxes & fees:</span>
                        <span className='text-black'>£0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black">Discount:</span>
                        <span className="text-green-600">-£0.00</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className='text-black'>Total:</span>
                      <span className='text-black'>£{calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                        <span>You save:</span>
                        <span className='text-black'>£{appliedPromo.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Included Services</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {bookingData.services.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 text-xs text-gray-500">
                  <p>Free cancellation up to 24 hours before your booking start time.</p>
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