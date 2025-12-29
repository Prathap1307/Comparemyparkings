'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import PromoValidation from '@/components/PromoValidation';

import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/* ---------------- STRIPE FORM ---------------- */

const CheckoutForm = ({
  formData,
  bookingData,
  searchData,
  totalPrice,
  onProcessingChange,
  handleBooking,
}) => {
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
      // Validate required fields (first car is required)
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.contactNumber ||
        !formData.email ||
        !formData.cars?.[0]?.carReg
      ) {
        alert('Please complete all required fields');
        return;
      }

      // Process payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) throw error;

      if (paymentIntent?.status === 'succeeded') {
        await handleBooking(paymentIntent.id);
      } else {
        alert('Payment is processing. You will receive a confirmation email shortly.');
        router.push('/payment/failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error?.message || 'Unknown error'}`);
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

/* ---------------- PAGE ---------------- */

export default function Checkout() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [bookingData, setBookingData] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cars, setCars] = useState([
    { carReg: '' }, // car 1 required
  ]);
  
  const [savedCars, setSavedCars] = useState([]);

  // ✅ Keep your formData & UI same, but carReg moved to cars[0].carReg internally
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    // carReg removed (we will keep backward compatibility below)
    flightNumber: '',
    departureTerminal: '',
    returnFlightNumber: '',
    arrivalTerminal: '',
    customerInstruction: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [shouldValidatePromo, setShouldValidatePromo] = useState(false);

  /* ---------------- EXPRESS CHECKOUT (AUTO-FILL) ---------------- */

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const loadProfile = async () => {
      const res = await fetch("/api/user/profile", {
        credentials: "include",
      });

      const data = await res.json();

      console.log("PROFILE DATA →", data); 

      if (!data) return;

      setFormData({
        title: "Mr",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        contactNumber: data.phone || "",
        flightNumber: "",
        departureTerminal: "",
        returnFlightNumber: "",
        arrivalTerminal: "",
        customerInstruction: "",
      });

      if (data.vehicles?.length) {
        setSavedCars(data.vehicles);
        setCars(
          data.vehicles.slice(0, 3).map(v => ({
            carReg: v.registration || "",
            saveForLater: true,
          }))
        );
      }

    };

    loadProfile();
  }, [isLoaded, isSignedIn, user?.id]);




  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const savedBooking = localStorage.getItem('selectedParking');
    const savedSearch = localStorage.getItem('parkingSearch');

    if (savedBooking) setBookingData(JSON.parse(savedBooking));
    if (savedSearch) setSearchData(JSON.parse(savedSearch));

    if (!savedBooking) router.push('/compare');
  }, [router]);

  /* ---------------- PRICE HELPERS ---------------- */

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculatePrice = (pricingTiers, duration) => {
    if (!pricingTiers || pricingTiers.length === 0) return 0;

    for (const tier of pricingTiers) {
      const minDays = parseInt(tier.minDays);
      const maxDays = parseInt(tier.maxDays);
      if (duration >= minDays && duration <= maxDays) {
        const basic = parseFloat(tier.basic);
        const perDay = parseFloat(tier.perDay);
        return basic + perDay * duration;
      }
    }

    const lastTier = pricingTiers[pricingTiers.length - 1];
    const minDays = parseInt(lastTier.minDays);
    const basic = parseFloat(lastTier.basic);
    const perDay = parseFloat(lastTier.perDay);
    return basic + perDay * (duration - minDays);
  };

  // Base price for 1 car (before promo)
  const baseTotal = useMemo(() => {
    if (!bookingData || !searchData) return 0;
    const duration = calculateDuration(searchData.startDate, searchData.endDate);
    return calculatePrice(bookingData.pricingTiers, duration);
  }, [bookingData, searchData]);

  // Cars total with multiplier: car1 x1, car2 x2, car3 x3
  const carsMultiplierTotal = useMemo(() => {
    const validCars = cars.filter(
      (c) => (c.carReg || '').trim().length > 0
    );

    // Always charge at least for 1 car
    const carCount = Math.max(1, validCars.length);

    return baseTotal * carCount;
  }, [cars, baseTotal]);


  const calculateTotal = useCallback(() => {
    if (!bookingData || !searchData) return 0;
    if (appliedPromo) return appliedPromo.newTotal;
    return carsMultiplierTotal;
  }, [bookingData, searchData, appliedPromo, carsMultiplierTotal]);

  const calculateOriginalTotal = () => {
    if (!bookingData || !searchData) return 0;
    return carsMultiplierTotal;
  };

  /* ---------------- PAYMENT INTENT ---------------- */

  useEffect(() => {
    if (!bookingData || !searchData) return;

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(calculateTotal() * 100),
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          if (data.paymentIntentId) localStorage.setItem('paymentIntentId', data.paymentIntentId);
        } else {
          console.error('No client secret received');
        }
      } catch (error) {
        console.error('Payment intent error:', error);
        alert('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [bookingData, searchData, calculateTotal]);

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Backward compatibility: if old UI still uses carReg name, map to car #1
    if (name === 'carReg') {
      setCars((prev) => {
        const copy = [...prev];
        copy[0] = { ...copy[0], carReg: value };
        return copy;
      });
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const setCarReg = (index, value) => {
    setCars((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], carReg: value };
      return copy;
    });
  };

  const addCar = () => {
    if (cars.length >= 3) return;
    setCars((prev) => [...prev, { carReg: '' }]);
  };

  const removeCar = (index) => {
    // keep at least 1 car field
    if (cars.length === 1) return;
    setCars((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- PROMO ---------------- */

  const handlePromoCodeApply = () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }
    setShouldValidatePromo(true);
  };

  const handlePromoValidationResult = (result) => {
    if (result && result.valid) {
      setAppliedPromo(result);
    } else {
      setAppliedPromo(null);
      setShouldValidatePromo(true);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setShouldValidatePromo(false);
    setShowPromoInput(false);
  };

  /* ---------------- SAVE BOOKING ---------------- */

  const handleBooking = async (paymentId) => {
    // Validate required fields (first car required)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.contactNumber ||
      !formData.email ||
      !cars?.[0]?.carReg
    ) {
      console.error('Please complete all required fields');
      return;
    }

    setProcessing(true);

    try {
      const cleanCars = cars
        .map((c, idx) => ({
          carReg: (c.carReg || '').trim(),
          priceMultiplier: idx + 1,
        }))
        .filter((c) => c.carReg.length > 0);

      const bookingReference = `PC${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const completeBooking = {
        ...bookingData,
        ...searchData,
        customerDetails: {
          ...formData,
          cars: cleanCars,
        },
        bookingDate: new Date().toISOString(),
        bookingReference,
        paymentIntentId: paymentId,
        status: 'confirmed',
        paidAmount: calculateTotal().toFixed(2),
        isTestBooking: false,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ParkingName: bookingData.title,
          orderId: bookingReference,
          Location: searchData?.terminal || 'Heathrow Airport',
          customerDetails: {
            ...formData,
            cars: cleanCars,
          },
          bookingDetails: {
            startDate: searchData?.startDate,
            endDate: searchData?.endDate,
            startTime: searchData?.startTime,
            endTime: searchData?.endTime,
            terminal: searchData?.terminal,
            duration: calculateDuration(searchData.startDate, searchData.endDate),
            totalPrice: calculateTotal(),
            status: 'confirmed',
          },
          services: bookingData.services,
          instruction: formData.customerInstruction || '',
          isTest: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to save booking to database');

      // Email payload updated: include ALL cars
      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          orderId: bookingReference,
          bookingDate: new Date().toISOString(),
          fromDate: searchData.startDate,
          toDate: searchData.endDate,
          fromTime: searchData.startTime,
          toTime: searchData.endTime,
          airport: searchData.terminal,
          // ✅ keep old field for compatibility + add new list
          carNumber: cleanCars?.[0]?.carReg || '',
          carNumbers: cleanCars.map((c) => c.carReg),
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

      localStorage.setItem('bookingConfirmation', JSON.stringify(completeBooking));
      if (isSignedIn && user) {
        await fetch('/api/user/save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: "include",
          body: JSON.stringify({
            clerkUserId: user.id,
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.contactNumber,
            vehicles: cleanCars.map(c => c.carReg),
          }),
        });
      }
      window.location.href = '/payment/success';
    } catch (error) {
      console.error('Booking failed:', error?.message || error);
    } finally {
      setProcessing(false);
    }
  };



  const toggleSavedCar = (reg) => {
    setCars((prev) => {
      const exists = prev.find(c => c.carReg === reg);
      if (exists) {
        return prev.filter(c => c.carReg !== reg);
      }
      if (prev.length >= 3) return prev;
      return [...prev, { carReg: reg }];
    });
  };


  /* ---------------- LOADING ---------------- */

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Checkout | ParkCompare</title>
        <meta name="description" content="Complete your parking booking" />
      </Head>

      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600 mb-8">Please review your booking details and complete the form below</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Form */}
            <div className="lg:col-span-2">

              {/* ✅ EXPRESS CHECKOUT (NEW, but same design language) */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Express checkout</h2>
                <p className="text-gray-600 mb-4">
                  Save your details for next time. Sign in once and checkout faster.
                </p>

                <SignedOut>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SignInButton >
                      <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors font-medium">
                        Continue with Email / Google / Apple
                      </button>
                    </SignInButton>
                    <p className="text-sm text-gray-500 self-center">
                      Or continue as guest below (no account needed).
                    </p>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700 font-medium">
                      You are signed in. We’ll auto-fill your name and email.
                    </p>
                  </div>
                </SignedIn>
              </div>

              {/* Personal details (same UI) */}
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

                  {/* ✅ Vehicles (NEW, same design) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle details</h3>
                    {isSignedIn && savedCars.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Saved vehicles
                        </h3>

                        <div className="space-y-2">
                          {savedCars.map((car) => (
                            <label
                              key={car.id}
                              className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={cars.some(c => c.carReg === car.registration)}
                                  onChange={() => toggleSavedCar(car.registration)}
                                />
                                <span className="font-medium text-black">
                                  {car.registration}
                                </span>

                                {car.is_default && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {cars.map((c, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Car Registration Number {idx === 0 ? '*' : ''} (Car {idx + 1})
                            </label>
                            <input
                              type="text"
                              value={c.carReg}
                              onChange={(e) => setCarReg(idx, e.target.value)}
                              required={idx === 0}
                              className="w-full p-3 border border-gray-300 rounded-md text-black"
                              placeholder="AB12 CDE"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {idx === 0
                                ? 'Car 1 included in base price.'
                                : idx === 1
                                ? 'Car 2 price is double.'
                                : 'Car 3 price is triple.'}
                            </p>
                          </div>
                          {isSignedIn && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={c.saveForLater || false}
                                onChange={(e) => {
                                  setCars(prev => {
                                    const copy = [...prev];
                                    copy[idx].saveForLater = e.target.checked;
                                    return copy;
                                  });
                                }}
                              />
                              <span className="text-sm text-gray-600">
                                Save this car for next time
                              </span>
                            </div>
                          )}



                          <div className="flex gap-2">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removeCar(idx)}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {cars.length < 3 && (
                        <button
                          type="button"
                          onClick={addCar}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          + Add another car (up to 3)
                        </button>
                        
                      )}
                    </div>
                  </div>

                  {/* Flight info (same UI) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Flight information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  {/* Instruction (same UI) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">instruction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer instruction</label>
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

              {/* Promo code (same UI) */}
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
                        <button
                          type="button"
                          onClick={handlePromoCodeApply}
                          disabled={!promoCode.trim()}
                          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          Apply
                        </button>
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

                    {shouldValidatePromo && (
                      <PromoValidation
                        promoCode={promoCode}
                        totalPrice={calculateOriginalTotal()}
                        onValidationResult={handlePromoValidationResult}
                        shouldValidate={shouldValidatePromo}
                      />
                    )}

                    {appliedPromo && appliedPromo.valid && (
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

              {/* Stripe Payment Element (same UI) */}
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    formData={{ ...formData, cars }}
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

            {/* Right column - Booking summary (same UI) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">{bookingData.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{bookingData.description}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>
                      {bookingData.rating} ({bookingData.reviewCount || bookingData.reviews?.length || 0} reviews)
                    </span>
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
                        <span className="font-medium text-black">
                          {searchData.startDate} at {searchData.startTime}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End:</span>
                        <span className="font-medium text-black">
                          {searchData.endDate} at {searchData.endTime}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Show cars summary (minimal add) */}
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-gray-800">Vehicles</h3>
                  {cars
                    .filter((c) => (c.carReg || '').trim().length > 0)
                    .map((c, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">Car {idx + 1}:</span>
                        <span className="font-medium text-black">{c.carReg}</span>
                      </div>
                    ))}
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
                        <span className="text-black">£0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black">Discount:</span>
                        <span className="text-green-600">-£0.00</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-black">Total:</span>
                      <span className="text-black">£{calculateTotal().toFixed(2)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                        <span>You save:</span>
                        <span className="text-black">£{appliedPromo.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Included Services</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {bookingData.services.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
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

      <Footer />
    </div>
  );
}
