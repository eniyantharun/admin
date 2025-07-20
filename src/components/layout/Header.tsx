'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Search, BookOpen, Map, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="dashboard-header bg-white shadow-sm border-b border-secondary-200">
      <div className="dashboard-header-content flex items-center h-16 px-4 lg:px-6 w-full">
        {/* Search Bar - Full Width */}
        <div className="dashboard-header-search flex-1 max-w-none">
          <div className="relative w-full">
            <Search className="dashboard-header-search-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search..."
              className="dashboard-header-search-input w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        {/* User Dropdown */}
        <div className="dashboard-header-right flex items-center space-x-4 ml-6 flex-shrink-0">
          <div className="dashboard-header-user-menu relative">
            <Button
              variant="secondary"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="dashboard-header-user-button flex items-center space-x-2"
            >
              <div className="dashboard-header-user-avatar w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="dashboard-header-user-icon w-4 h-4 text-primary-600" />
              </div>
              <span className="dashboard-header-username hidden sm:block text-sm font-medium">
                {user?.username}
              </span>
            </Button>

            {dropdownOpen && (
              <div className="dashboard-header-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50 animate-slide-down">
                <Button
                  onClick={() => router.push('/blog')}
                  variant="secondary"
                  className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 border-none shadow-none"
                  icon={BookOpen}
                >
                  Blog
                </Button>
                <Button
                  onClick={() => router.push('/sitemaps')}
                  variant="secondary"
                  className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 border-none shadow-none"
                  icon={Map}
                >
                  SiteMaps
                </Button>
                <Button
                  onClick={() => router.push('/faq')}
                  variant="secondary"
                  className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 border-none shadow-none"
                  icon={HelpCircle}
                >
                  FAQ
                </Button>
                <hr className="my-1 border-secondary-200" />
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="dashboard-header-logout-button w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-none shadow-none"
                  icon={LogOut}
                >
                  Logout
                </Button>
                <div className="dashboard-header-version px-4 py-2 text-xs text-secondary-400 border-t border-secondary-200">
                  Version: 1.0.0
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};