'use client';

export default function Footer({ variant = "default" }) {
  const currentYear = new Date().getFullYear();

  if (variant === "simple") {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">&copy; {currentYear} ParkCompare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
      <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                      <h3 className="text-lg font-semibold mb-4">CompareMyParkings</h3>
                      <p className="text-gray-400">
                          Comparing airport parking options to help you find the best deal for your needs.
                      </p>
                  </div>
                  
                  <div>
                      <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Heathrow Parking</a></li>
                          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gatwick Parking (coming soon)</a></li>
                          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Stansted Parking (coming soon)</a></li>
                          <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Luton Parking (coming soon)</a></li>
                      </ul>
                  </div>
                  
                  <div>
                      <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
                      <ul className="space-y-2">
                          <li><a href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms and conditions</a></li>
                          <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                          <li><a href="/cancellation-policy" className="text-gray-400 hover:text-white transition-colors">Cancellation Policy</a></li>
                          <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                      </ul>
                  </div>
                  
                  <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                      <address className="not-italic text-gray-400">
                          <p>Email: info@comparemyparkings.co.uk</p>
                          <p>Phone: +44 7876 239148</p>
                          <p className="mt-2">Open 7 days a week</p>
                          <p>8am - 8pm</p>
                      </address>
                  </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                  <p>&copy; {new Date().getFullYear()} CompareMyParkings. All rights reserved.</p>
              </div>
          </div>
      </footer>
  );
}