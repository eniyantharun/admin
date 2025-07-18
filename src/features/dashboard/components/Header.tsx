'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/redux';
import { toggleSidebar } from '../store/dashboard.slice';
import { logoutAsync } from '../../auth/store/auth.slice';
import { STRINGS } from '../../../constants/strings';
import { Menu, LogOut, User, BookOpen, Map, HelpCircle, Search as SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import packageJson from '../../../../package.json';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.dashboard);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    router.push('/login');
  };

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  let dropdownTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    dropdownTimeout = setTimeout(() => setDropdownOpen(false), 150);
  };

  const currentPathname = pathname || '';
  // Show search bar on dashboard, products, orders, etc.
  const showSearch = [
    '/dashboard',
    '/products',
    '/orders',
    '/categories',
    '/themes',
    '/keywords',
    '/brands',
    '/quotes',
    '/suppliers',
    '/customers',
    '/blog',
    '/searches',
    '/sitemaps',
    '/faq',
  ].some((route) => currentPathname.startsWith(route));

  // Add a mapping for page labels and subtexts
  const pageInfo: Record<string, { label: string; subtext: string }> = {
    '/dashboard': { label: 'Dashboard', subtext: 'Overview & stats' },
    '/products': { label: 'Products', subtext: 'Manage your products' },
    '/orders': { label: 'Orders', subtext: 'Track and manage orders' },
    '/categories': { label: 'Categories', subtext: 'Organize your catalog' },
    '/themes': { label: 'Themes', subtext: 'Customize your store look' },
    '/keywords': { label: 'Keywords', subtext: 'SEO and search terms' },
    '/brands': { label: 'Brands', subtext: 'Manage brands' },
    '/quotes': { label: 'Quotes', subtext: 'Customer quotations' },
    '/suppliers': { label: 'Suppliers', subtext: 'Supplier management' },
    '/customers': { label: 'Customers', subtext: 'Customer database' },
    '/blog': { label: 'Blog', subtext: 'Content & news' },
    '/searches': { label: 'Searches', subtext: 'User search analytics' },
    '/sitemaps': { label: 'SiteMaps', subtext: 'SEO & indexing' },
    '/faq': { label: 'FAQ', subtext: 'Frequently asked questions' },
  };

  // Find the current page info
  const currentPage = Object.keys(pageInfo).find((route) => currentPathname.startsWith(route));
  const currentLabel = currentPage ? pageInfo[currentPage].label : '';
  const currentSubtext = currentPage ? pageInfo[currentPage].subtext : '';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Desktop layout: label/subtext at flex-start, search bar fills rest */}
      <div className="hidden md:flex items-center h-16 px-4 lg:px-6 w-full">
        {/* Sidebar toggle (mobile only, so hidden here) */}
        <div className="hidden" />
        {/* Page label and subtext at flex-start */}
        {showSearch && (
          <div className="flex flex-col justify-center mr-6 min-w-[140px]">
            <span className="text-base font-semibold text-gray-900 leading-tight">{currentLabel}</span>
            <span className="text-xs text-gray-500 leading-tight">{currentSubtext}</span>
          </div>
        )}
        {/* Search bar fills remaining space */}
        {showSearch && (
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#FFA500] focus:border text-sm"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        )}
        {/* User dropdown at far right */}
        <div className="flex items-center space-x-4 ml-6">
          <div
            className="relative flex items-center space-x-2 cursor-pointer select-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.username}
            </span>
            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                <ul className="py-1">
                  <li>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => router.push('/blog')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Blog
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => router.push('/sitemaps')}
                    >
                      <Map className="w-4 h-4 mr-2" /> SiteMaps
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => router.push('/faq')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" /> FAQ
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </li>
                </ul>
                <hr className="my-1 border-gray-200" />
                <div className="px-4 py-2 text-xs text-gray-400">Version: {packageJson.version}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile: page label above search bar */}
      {showSearch && (
        <div className="md:hidden px-4 pt-2 pb-1">
          <span className="block text-base font-semibold text-gray-900 leading-tight">{currentLabel}</span>
          <span className="block text-xs text-gray-500 leading-tight mb-2">{currentSubtext}</span>
        </div>
      )}
      {/* Mobile search bar below header */}
      {showSearch && (
        <div className="md:hidden px-4 pb-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-[#FFA500] focus:border text-sm"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </header>
  );
};

// Add this to your global CSS for fade-in animation if desired:
// .animate-fade-in { animation: fadeIn 0.15s ease-in; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }