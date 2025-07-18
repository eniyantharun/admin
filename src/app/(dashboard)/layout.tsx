'use client';

import React from 'react';
import { AuthGuard } from '../../shared/components/AuthGuard';
import { Sidebar } from '../../features/dashboard/components/Sidebar';
import { Header } from '../../features/dashboard/components/Header';
import { useAppSelector, useAppDispatch } from '../../shared/hooks/redux';
import { setSidebarOpen } from '../../features/dashboard/store/dashboard.slice';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  const handleOverlayClick = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        {sidebarOpen && (
          <div 
            className="sidebar-overlay lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}