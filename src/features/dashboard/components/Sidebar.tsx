'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/redux';
import { STRINGS } from '../../../constants/strings';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Palette,
  Hash,
  Award,
  ShoppingCart,
  FileText,
  Users,
  User,
  BookOpen,
  Search,
  Map,
  HelpCircle,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { toggleSidebar, setCollapsed } from '../store/dashboard.slice';
import Image from 'next/image';

const navItems = [
  { id: 'dashboard', label: STRINGS.NAVIGATION.DASHBOARD, href: '/dashboard', icon: LayoutDashboard },
  { id: 'products', label: STRINGS.NAVIGATION.PRODUCTS, href: '/products', icon: Package },
  { id: 'categories', label: STRINGS.NAVIGATION.CATEGORIES, href: '/categories', icon: FolderOpen },
  { id: 'themes', label: STRINGS.NAVIGATION.THEMES, href: '/themes', icon: Palette },
  { id: 'keywords', label: STRINGS.NAVIGATION.KEYWORDS, href: '/keywords', icon: Hash },
  { id: 'brands', label: STRINGS.NAVIGATION.BRANDS, href: '/brands', icon: Award },
  { id: 'orders', label: STRINGS.NAVIGATION.ORDERS, href: '/orders', icon: ShoppingCart },
  { id: 'quotes', label: STRINGS.NAVIGATION.QUOTES, href: '/quotes', icon: FileText },
  { id: 'suppliers', label: STRINGS.NAVIGATION.SUPPLIERS, href: '/suppliers', icon: Users },
  { id: 'customers', label: STRINGS.NAVIGATION.CUSTOMERS, href: '/customers', icon: User },
  // { id: 'blog', label: STRINGS.NAVIGATION.BLOG, href: '/blog', icon: BookOpen },
  { id: 'searches', label: STRINGS.NAVIGATION.SEARCHES, href: '/searches', icon: Search },
  // { id: 'sitemaps', label: STRINGS.NAVIGATION.SITEMAPS, href: '/sitemaps', icon: Map },
  // { id: 'faq', label: STRINGS.NAVIGATION.FAQ, href: '/faq', icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, collapsed } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  // Sidebar width and content based on state
  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      ${sidebarWidth}
      lg:translate-x-0 lg:static lg:inset-0
    `}>
      <div className="flex flex-col h-full">
        {/* Logo/Header or Hamburger */}
        <div className="flex items-center h-16 px-4" style={{ minHeight: '4rem' }}>
          {collapsed ? (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          ) : (
            <>
              <button
                onClick={() => dispatch(setCollapsed(true))}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none mr-2"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <img
                src="https://www.promotionalproductinc.com/_next/static/media/logo.509527f9.svg"
                alt="Logo"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
                loading="eager"
                className="mr-2"
              />
              <span className="text-xl font-bold text-gray-900">PPI Admin</span>
            </>
          )}
        </div>
        <nav className={`flex-1 ${collapsed ? 'px-2 py-4' : 'px-4 py-6'} overflow-y-auto scrollbar-hide`}>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center ${collapsed ? 'justify-center' : ''} px-0 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <IconComponent className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};