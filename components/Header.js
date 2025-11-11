'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigation = (path) => {
        setIsMenuOpen(false);
        router.push(path);
    };

    return (
      <div>
          <div className="bg-blue-800 text-white text-center py-2 text-sm">
              <p>⭐ Rated Excellent on Trustpilot | Best Price Guarantee ⭐</p>
          </div>
          <header className="bg-white shadow-sm sticky top-0 z-50 pt-2 pb-2">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    {/* Logo */}
                    <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <div className="flex items-center">
                            <span className="text-blue-600 text-2xl font-bold mr-1">CompareMy</span>
                            <span className="text-orange-500 text-2xl font-bold">Parkings</span>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button 
                            className="text-blue-600 hover:text-orange-500 transition-colors font-medium"
                            onClick={() => handleNavigation('/help')}
                        >
                            Help & Contact
                        </button>
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => handleNavigation('/manage-booking')}
                        >
                            My Bookings
                        </button>
                    </div>

                    {/* Mobile Hamburger Menu - Visible only on mobile */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={toggleMenu}
                            className="text-blue-600 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute left-0 right-0">
                        <div className="py-2 space-y-0">
                            <button 
                                className="w-full text-left px-4 py-4 text-blue-600 hover:bg-blue-50 transition-colors font-medium border-b border-gray-100 flex items-center justify-between"
                                onClick={() => handleNavigation('/')}
                            >
                                Home
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button 
                                className="w-full text-left px-4 py-4 text-blue-600 hover:bg-blue-50 transition-colors font-medium border-b border-gray-100 flex items-center justify-between"
                                onClick={() => handleNavigation('/manage-booking')}
                            >
                                My Bookings
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button 
                                className="w-full text-left px-4 py-4 text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-between"
                                onClick={() => handleNavigation('/help')}
                            >
                                Help & Contact
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
      </div>
    );
}