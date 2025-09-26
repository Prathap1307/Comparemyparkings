export default function Navigation() {
  return (
    <nav className="border-t border-gray-200 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap space-x-2 md:space-x-8 py-3 md:py-4 text-sm md:text-base">
          {['Home', 'Parking Deals', 'How It Works', 'About Us', 'Blog'].map((item) => (
            <li key={item}>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">{item}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}