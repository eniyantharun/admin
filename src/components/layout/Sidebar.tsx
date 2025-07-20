'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Button } from '@/components/ui/Button';
import { setSidebarOpen, toggleSidebar } from '@/store/dashboardSlice';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  User,
  FileText,
  Award,
  Hash,
  Palette,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: User },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Brands', href: '/brands', icon: Award },
  { name: 'Keywords', href: '/keywords', icon: Hash },
  { name: 'Themes', href: '/themes', icon: Palette },
  { name: 'Searches', href: '/searches', icon: Search },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  const handleOverlayClick = () => {
    dispatch(setSidebarOpen(false));
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      {/* Mobile Overlay - only show on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-secondary-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'
      }`}>
        <div className="dashboard-sidebar-container flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="dashboard-sidebar-header flex items-center h-16 px-4 border-b border-secondary-200">
            {sidebarOpen ? (
              <>
                <img
                  src="https://www.promotionalproductinc.com/_next/static/media/logo.509527f9.svg"
                  alt="Logo"
                  className="dashboard-sidebar-logo w-8 h-8 mr-3"
                />
                <span className="dashboard-sidebar-title text-xl font-bold text-secondary-900 truncate flex-1">
                  {process.env.NEXT_PUBLIC_APP_NAME || 'PPI Admin'}
                </span>
                {/* Collapse button - only visible when sidebar is open */}
                <Button
                  onClick={handleToggleSidebar}
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  iconOnly
                  className="dashboard-sidebar-collapse-btn ml-2 hidden lg:flex"
                  title="Collapse sidebar"
                />
              </>
            ) : (
              <div className="dashboard-sidebar-collapsed-header w-full flex justify-center relative">
                <img
                  src="https://www.promotionalproductinc.com/_next/static/media/logo.509527f9.svg"
                  alt="Logo"
                  className="dashboard-sidebar-logo-collapsed w-8 h-8"
                />
                {/* Expand button - only visible when sidebar is collapsed */}
                <Button
                  onClick={handleToggleSidebar}
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  iconOnly
                  className="dashboard-sidebar-expand-btn absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex bg-white border border-secondary-200 shadow-md hover:shadow-lg"
                  title="Expand sidebar"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={`dashboard-sidebar-nav flex-1 py-6 overflow-y-auto scrollbar-hide ${
            sidebarOpen ? 'px-4' : 'px-2'
          }`}>
            <ul className="dashboard-sidebar-nav-list space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name} className="dashboard-sidebar-nav-item">
                    <Link
                      href={item.href}
                      className={`dashboard-sidebar-link group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'dashboard-sidebar-link-active bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                          : 'dashboard-sidebar-link-inactive text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                      } ${!sidebarOpen ? 'justify-center' : ''}`}
                      title={!sidebarOpen ? item.name : undefined}
                    >
                      <Icon className={`dashboard-sidebar-link-icon w-5 h-5 flex-shrink-0 ${
                        sidebarOpen ? 'mr-3' : ''
                      } ${isActive ? 'text-primary-700' : 'text-secondary-500 group-hover:text-secondary-700'}`} />
                      {sidebarOpen && (
                        <span className="dashboard-sidebar-link-text truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="dashboard-sidebar-footer border-t border-secondary-200 p-4">
              <div className="dashboard-sidebar-footer-content text-center">
                <p className="dashboard-sidebar-footer-text text-xs text-secondary-500">
                  © 2025 {process.env.NEXT_PUBLIC_COMPANY_NAME || 'PPI'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};