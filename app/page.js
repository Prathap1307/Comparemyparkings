'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

export default function Home() {
  const router = useRouter();

  /* ---------------- STATE ---------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('default');
  const [errors, setErrors] = useState({});

  const [locations, setLocations] = useState([]);

  const [minStartDateTime, setMinStartDateTime] = useState('');
  const [minEndDateTime, setMinEndDateTime] = useState('');

  const [searchData, setSearchData] = useState({
    airport: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const [datetimeInputs, setDatetimeInputs] = useState({
    startDateTime: '',
    endDateTime: '',
  });

  /* ---------------- INIT DATE LIMITS ---------------- */
  useEffect(() => {
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    setMinStartDateTime(now.toISOString().slice(0, 16));
  }, []);

  /* ---------------- LOAD LOCATIONS (SAFE) ---------------- */
  useEffect(() => {
    fetch('/api/locations')
      .then(async res => {
        if (!res.ok) return [];
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  /* ---------------- HELPERS ---------------- */
  const clearError = name =>
    setErrors(prev => ({ ...prev, [name]: '' }));

  const to24h = time12 => {
    if (!time12) return '00:00';
    const [time, mod] = time12.split(' ');
    let [h, m] = time.split(':');
    if (h === '12') h = '00';
    if (mod === 'PM') h = Number(h) + 12;
    return `${String(h).padStart(2, '0')}:${m || '00'}`;
  };

  const to12h = time24 => {
    if (!time24) return '12:00 AM';
    let [h, m] = time24.split(':');
    h = Number(h);
    const mod = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${mod}`;
  };

  /* ---------------- INPUT HANDLERS ---------------- */
  const handleInputChange = e => {
    clearError(e.target.name);
    setSearchData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDateTimeChange = e => {
    const { name, value } = e.target;
    clearError(name);

    setDatetimeInputs(prev => ({ ...prev, [name]: value }));

    if (!value) return;

    const [date, time] = value.split('T');
    const time12 = to12h(time);

    if (name === 'startDateTime') {
      setSearchData(prev => ({
        ...prev,
        startDate: date,
        startTime: time12,
      }));

      const minEnd = new Date(date);
      minEnd.setDate(minEnd.getDate() + 1);
      setMinEndDateTime(minEnd.toISOString().slice(0, 16));
    } else {
      setSearchData(prev => ({
        ...prev,
        endDate: date,
        endTime: time12,
      }));
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const e = {};

    if (!searchData.airport) e.airport = 'Please select an airport';
    if (!searchData.startDate) e.startDateTime = 'Select start date & time';
    if (!searchData.endDate) e.endDateTime = 'Select end date & time';

    if (searchData.startDate && searchData.endDate) {
      const start = new Date(
        `${searchData.startDate}T${to24h(searchData.startTime)}`
      );
      const end = new Date(
        `${searchData.endDate}T${to24h(searchData.endTime)}`
      );

      if (end <= start) {
        e.endDateTime = 'End date must be after start date';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    localStorage.setItem('parkingSearch', JSON.stringify(searchData));

    setIsLoading(true);
    setLoadingType('compare');

    await new Promise(r => setTimeout(r, 3000));
    router.push('/compare?loading=compare');
  };

  if (isLoading) {
    return <Loading type={loadingType} count={76} />;
  }

  /* ---------------- UI ---------------- */
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <Header />

          <main className="flex-grow">
            {/* HERO */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
              <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Airport Parking Made Simple
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Compare prices across all major providers
                </p>

                <div className="bg-white p-6 rounded-lg shadow-xl w-[80%] mx-auto">
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
                  >
                    {/* AIRPORT */}
                    <div className="lg:col-span-2">
                      <label className="text-sm font-medium text-black">Airport</label>
                      <select
                        name="airport"
                        value={searchData.airport}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md bg-white text-black"
                      >
                        <option value="">Select Airport</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.location_name}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                      {errors.airport && (
                        <p className="text-xs text-red-500">{errors.airport}</p>
                      )}
                    </div>

                    {/* FROM */}
                    <div>
                      <label className="text-sm font-medium text-black">From</label>
                      <input
                        type="datetime-local"
                        name="startDateTime"
                        min={minStartDateTime}
                        value={datetimeInputs.startDateTime}
                        onChange={handleDateTimeChange}
                        className="w-full p-3 border rounded-md text-black"
                      />
                    </div>

                    {/* TO */}
                    <div>
                      <label className="text-sm font-medium text-black">To</label>
                      <input
                        type="datetime-local"
                        name="endDateTime"
                        min={minEndDateTime}
                        value={datetimeInputs.endDateTime}
                        onChange={handleDateTimeChange}
                        className="w-full p-3 border rounded-md text-black"
                      />
                    </div>

                    <div className="flex items-end lg:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-3 rounded-md text-lg hover:bg-orange-600"
                      >
                        Find Parking
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
                
                {/* Rest of your components remain the same */}
                <section className="py-8 bg-gray-50 border-b">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">4.8/5</div>
                                <div className="text-sm text-gray-600">Rating</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">98%</div>
                                <div className="text-sm text-gray-600">Customer Satisfaction</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">10K+</div>
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
