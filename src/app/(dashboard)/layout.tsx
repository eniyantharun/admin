'use client';

import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="dashboard-layout-container flex h-screen bg-secondary-50">
        <Sidebar />
        <div className="dashboard-layout-main flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="dashboard-layout-content flex-1 overflow-y-auto p-6">
            <div className="dashboard-layout-page-wrapper">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}