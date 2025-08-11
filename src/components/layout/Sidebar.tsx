'use client';

import React, { useState } from 'react';
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
  Building2,
  Menu,
  ChevronDown,
  ChevronUp,
  Layers,
  Tag,
} from 'lucide-react';
import { RootState } from '@/store';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  submenu?: {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
  }[];
}
interface SubmenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Products', 
    icon: Package,
    submenu: [
      { name: 'Categories', href: '/products/categories', icon: Layers },
      { name: 'Themes', href: '/products/themes', icon: Palette },
      { name: 'Keyword', href: '/products/keywords', icon: Hash },
    ]
  },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: User },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Brands', href: '/brands', icon: Award },
  { name: 'Searches', href: '/searches', icon: Search },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
const { sidebarOpen } = useAppSelector((state: RootState) => state.dashboard);
  const dispatch = useAppDispatch();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleOverlayClick = () => {
    dispatch(setSidebarOpen(false));
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isSubmenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName);
  };

const isSubmenuItemActive = (submenuItems: SubmenuItem[]): boolean => {
  return submenuItems.some(item => pathname === item.href);
};
  return (
    <>
      {!sidebarOpen && (
        <Button
          onClick={handleToggleSidebar}
          variant="secondary"
          size="sm"
          icon={Menu}
          iconOnly
          className="fixed top-20 left-4 z-50 lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-xl"
          title="Open menu"
        />
      )}

      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay fixed inset-0 bg-black/50 z-40 lg:hidden transition-all duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-slate-800 via-slate-900 to-indigo-900 shadow-2xl border-r border-slate-700/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'
      }`}>
        <div className="dashboard-sidebar-container flex flex-col h-full relative">
          <div className="dashboard-sidebar-header flex items-center h-16 px-4 border-b border-slate-700/50 bg-white/5">
            {sidebarOpen ? (
              <>
                <div className="dashboard-sidebar-logo-wrapper bg-white/10 p-2 rounded-xl border border-white/20 shadow-lg mr-3">
                  <img
                    src="https://www.promotionalproductinc.com/_next/static/media/logo.509527f9.svg"
                    alt="Logo"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    loading="eager"
                    className="mr-2"
                  />
                </div>
                <div className="dashboard-sidebar-title-wrapper flex-1">
                  <h1 className="dashboard-sidebar-title text-lg font-bold text-white truncate">
                    {process.env.NEXT_PUBLIC_APP_NAME || 'PPI Admin'}
                  </h1>
                </div>
                <Button
                  onClick={handleToggleSidebar}
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  iconOnly
                  className="dashboard-sidebar-collapse-btn ml-2 bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-lg"
                  title="Collapse sidebar"
                />
              </>
            ) : (
              <div className="dashboard-sidebar-collapsed-header w-full flex justify-center relative">
                <div className="dashboard-sidebar-logo-collapsed-wrapper bg-white/10 p-2 rounded-xl border border-white/20 shadow-lg">
                  <img
                    src="https://www.promotionalproductinc.com/_next/static/media/logo.509527f9.svg"
                    alt="Logo"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    loading="eager"
                    className="mr-2"
                  />
                </div>
                <Button
                  onClick={handleToggleSidebar}
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  iconOnly
                  className="dashboard-sidebar-expand-btn absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-xl"
                  title="Expand sidebar"
                />
              </div>
            )}
          </div>

          <nav className={`dashboard-sidebar-nav flex-1 py-6 overflow-y-auto scrollbar-hide ${
            sidebarOpen ? 'px-4' : 'px-2'
          }`}>
            <ul className="dashboard-sidebar-nav-list space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isSubmenuActive = hasSubmenu && item.submenu ? isSubmenuItemActive(item.submenu) : false;
                const isExpanded = hasSubmenu && isSubmenuExpanded(item.name);
                const Icon = item.icon;

                return (
                  <li key={item.name} className="dashboard-sidebar-nav-item">
                    {hasSubmenu ? (
                      // Menu item with submenu
                      <>
                        <button
                          onClick={() => sidebarOpen && toggleSubmenu(item.name)}
                          className={`dashboard-sidebar-link group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                            isSubmenuActive || isActive
                              ? 'dashboard-sidebar-link-active bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30'
                              : 'dashboard-sidebar-link-inactive text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-lg'
                          } ${!sidebarOpen ? 'justify-center' : ''}`}
                          title={!sidebarOpen ? item.name : undefined}
                        >
                          {(isSubmenuActive || isActive) && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400 rounded-r-full"></div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                          
                          <Icon className={`dashboard-sidebar-link-icon w-5 h-5 flex-shrink-0 relative z-10 ${
                            sidebarOpen ? 'mr-3' : ''
                          } ${
                            isSubmenuActive || isActive
                              ? 'text-blue-300 drop-shadow-sm' 
                              : 'text-slate-400 group-hover:text-blue-300 group-hover:drop-shadow-sm'
                          } transition-all duration-300`} />
                          
                          {sidebarOpen && (
                            <>
                              <span className="dashboard-sidebar-link-text truncate relative z-10 transition-all duration-300 flex-1 text-left">
                                {item.name}
                              </span>
                              {hasSubmenu && (
                                <div className={`ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              )}
                            </>
                          )}
                          
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        </button>

                        {/* Submenu items */}
                        {sidebarOpen && hasSubmenu && (
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            <ul className="mt-2 space-y-1 ml-4 border-l border-slate-600/50">
                              {item.submenu?.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                const SubIcon = subItem.icon;

                                return (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.href}
                                      className={`dashboard-sidebar-sublink group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden ml-4 ${
                                        isSubActive
                                          ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 text-white shadow-md border border-blue-400/40'
                                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:shadow-md'
                                      }`}
                                    >
                                      {isSubActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full"></div>
                                      )}
                                      
                                      <SubIcon className={`w-4 h-4 flex-shrink-0 mr-3 ${
                                        isSubActive 
                                          ? 'text-blue-300' 
                                          : 'text-slate-500 group-hover:text-slate-300'
                                      } transition-all duration-300`} />
                                      
                                      <span className="truncate transition-all duration-300">
                                        {subItem.name}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      // Regular menu item without submenu
                      <Link
                        href={item.href!}
                        className={`dashboard-sidebar-link group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                          isActive
                            ? 'dashboard-sidebar-link-active bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30'
                            : 'dashboard-sidebar-link-inactive text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-lg'
                        } ${!sidebarOpen ? 'justify-center' : ''}`}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400 rounded-r-full"></div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        
                        <Icon className={`dashboard-sidebar-link-icon w-5 h-5 flex-shrink-0 relative z-10 ${
                          sidebarOpen ? 'mr-3' : ''
                        } ${
                          isActive 
                            ? 'text-blue-300 drop-shadow-sm' 
                            : 'text-slate-400 group-hover:text-blue-300 group-hover:drop-shadow-sm'
                        } transition-all duration-300`} />
                        
                        {sidebarOpen && (
                          <span className="dashboard-sidebar-link-text truncate relative z-10 transition-all duration-300">
                            {item.name}
                          </span>
                        )}
                        
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {sidebarOpen && (
            <div className="dashboard-sidebar-footer border-t border-slate-700/50 p-4 bg-white/5">
              <div className="dashboard-sidebar-footer-content text-center">
                <p className="dashboard-sidebar-footer-text text-xs text-slate-400">
                  © 2025 {process.env.NEXT_PUBLIC_COMPANY_NAME || 'PPI'}
                </p>
                <p className="dashboard-sidebar-footer-version text-xs text-slate-500 mt-1">
                  v1.0.0
                </p>
              </div>
            </div>
          )}

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
        </div>
      </aside>
    </>
  );
};