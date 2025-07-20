'use client';

import React, { memo, useEffect } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NavigationPerformanceMonitor } from '@/lib/routeOptimization';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Memoized background component to prevent unnecessary re-renders
const DashboardBackground = memo(() => (
  <div className="dashboard-layout-background absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}></div>
    
    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-blue-400/5 via-transparent to-transparent rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-indigo-400/5 via-transparent to-transparent rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-400/3 via-transparent to-transparent rounded-full blur-3xl"></div>
  </div>
));

DashboardBackground.displayName = 'DashboardBackground';

// Memoized floating elements to prevent unnecessary re-renders
const FloatingElements = memo(() => (
  <div className="dashboard-layout-floating-elements pointer-events-none">
    <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-32 left-32 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
  </div>
));

FloatingElements.displayName = 'FloatingElements';

// Memoized content wrapper to prevent unnecessary re-renders
const ContentWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-content-container h-full relative min-h-0">
    <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] rounded-2xl border border-white/40 shadow-sm pointer-events-none"></div>
    
    <div className="relative z-10 h-full min-h-0 overflow-auto">
      {children}
    </div>
  </div>
));

ContentWrapper.displayName = 'ContentWrapper';

// Main dashboard layout component
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Performance monitoring
  useEffect(() => {
    const endTiming = NavigationPerformanceMonitor.startTiming(pathname);
    
    // Mark the route as loaded after a short delay
    const timeoutId = setTimeout(() => {
      endTiming();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      endTiming();
    };
  }, [pathname]);

  return (
    <AuthGuard>
      <div className="dashboard-layout-container flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50 relative overflow-hidden">
        <DashboardBackground />

        <Sidebar />
        
        <div className="dashboard-layout-main flex-1 flex flex-col overflow-hidden relative min-w-0">
          <Header />
          
          <main className="dashboard-layout-content flex-1 overflow-y-auto relative bg-transparent">
            <div className="dashboard-layout-page-wrapper h-full min-h-0">
              <div className="dashboard-layout-inner h-full p-4 sm:p-6 lg:p-8">
                <ContentWrapper>
                  {children}
                </ContentWrapper>
              </div>
            </div>

            <div className="dashboard-layout-scroll-indicator absolute top-0 right-0 w-1 bg-gradient-to-b from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full transition-opacity duration-300"></div>
          </main>
        </div>

        <FloatingElements />
      </div>
    </AuthGuard>
  );
};

// Export memoized version to prevent unnecessary re-renders
export default memo(DashboardLayout);