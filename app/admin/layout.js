'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4 text-xl font-bold border-b">
          Admin Panel
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin/locations"
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              pathname === '/admin/locations'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Locations
          </Link>
          <Link
            href="/admin/companys"
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              pathname === '/admin/locations'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Companies
          </Link>
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
