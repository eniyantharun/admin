'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  LogOut, 
  Search, 
  BookOpen, 
  Map, 
  HelpCircle, 
  Bell,
  Settings,
  ChevronDown 
} from 'lucide-react';

export const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dashboard-header-user-menu')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <header className="dashboard-header bg-gradient-to-r from-white via-gray-50 to-blue-50 shadow-lg border-b border-gray-200/50 backdrop-blur-sm w-full relative z-30">
      <div className="dashboard-header-content flex items-center h-16 px-4 sm:px-6 lg:px-8 w-full max-w-none mx-0">
        <div className="dashboard-header-search flex-1 max-w-none sm:max-w-2xl">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="dashboard-header-search-icon w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products, customers, orders..."
              className="dashboard-header-search-input w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 px-2 py-1 text-xs font-sans text-gray-400 bg-gray-50">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="dashboard-header-right flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div className="dashboard-header-notifications">
            <Button
              variant="secondary"
              size="sm"
              icon={Bell}
              iconOnly
              className="dashboard-header-notification-btn relative bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10"
              title="Notifications"
            >
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
          </div>

          <div className="dashboard-header-settings">
            <Button
              variant="secondary"
              size="sm"
              icon={Settings}
              iconOnly
              className="dashboard-header-settings-btn bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10"
              title="Settings"
            />
          </div>

          <div className="dashboard-header-user-menu relative">
            <Button
              variant="secondary"
              onClick={handleDropdownToggle}
              className="dashboard-header-user-button flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 px-2 sm:px-4 py-2 h-9 sm:h-10"
            >
              <div className="dashboard-header-user-avatar w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="dashboard-header-user-icon w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="dashboard-header-user-info hidden sm:block text-left flex-shrink-0">
                <span className="dashboard-header-username block text-sm font-semibold text-gray-900 truncate max-w-24 lg:max-w-none">
                  {user?.username || 'Admin User'}
                </span>
                <span className="dashboard-header-user-role block text-xs text-gray-500">
                  Administrator
                </span>
              </div>
              <ChevronDown className={`dashboard-header-user-dropdown-icon w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                dropdownOpen ? 'transform rotate-180' : ''
              }`} />
            </Button>

            {dropdownOpen && (
              <div className="dashboard-header-dropdown absolute right-0 mt-2 w-48 sm:w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-slide-down">
                <div className="dashboard-header-dropdown-header px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@ppi.com'}</p>
                </div>

                <div className="dashboard-header-dropdown-menu py-1">
                  <Button
                    onClick={() => {
                      router.push('/blog');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={BookOpen}
                  >
                    Blog Management
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/sitemaps');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={Map}
                  >
                    Site Maps
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/faq');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={HelpCircle}
                  >
                    FAQ Center
                  </Button>
                  
                  <hr className="my-2 border-gray-100" />
                  
                  <Button
                    onClick={() => {
                      router.push('/profile');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={User}
                  >
                    Profile Settings
                  </Button>
                  
                  <Button
                    onClick={() => {
                      router.push('/settings');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-dropdown-item w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={Settings}
                  >
                    System Settings
                  </Button>
                  
                  <hr className="my-2 border-gray-100" />
                  
                  <Button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="dashboard-header-logout-button w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={LogOut}
                  >
                    Sign Out
                  </Button>
                </div>

                <div className="dashboard-header-version px-4 py-2 border-t border-gray-100 mt-1">
                  <p className="text-xs text-gray-400">Version 1.0.0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header bottom border gradient */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
    </header>
  );
};