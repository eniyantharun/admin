interface RouteCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expiry: number;
  };
}

class RouteOptimizationManager {
  private static instance: RouteOptimizationManager;
  private routeCache: RouteCache = {};
  private prefetchQueue: Set<string> = new Set();
  private defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RouteOptimizationManager {
    if (!RouteOptimizationManager.instance) {
      RouteOptimizationManager.instance = new RouteOptimizationManager();
    }
    return RouteOptimizationManager.instance;
  }

  // Cache route data
  cacheRouteData(route: string, data: any, cacheDuration?: number): void {
    const expiry = cacheDuration || this.defaultCacheDuration;
    this.routeCache[route] = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
    };
  }

  // Get cached route data
  getCachedRouteData(route: string): any | null {
    const cached = this.routeCache[route];
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      delete this.routeCache[route];
      return null;
    }
    
    return cached.data;
  }

  // Clear cache for specific route
  clearRouteCache(route: string): void {
    delete this.routeCache[route];
  }

  // Clear all cache
  clearAllCache(): void {
    this.routeCache = {};
  }

  // Prefetch route data
  async prefetchRoute(route: string, fetchFunction: () => Promise<any>): Promise<void> {
    if (this.prefetchQueue.has(route)) return;
    
    this.prefetchQueue.add(route);
    
    try {
      // Check if already cached
      const cached = this.getCachedRouteData(route);
      if (cached) {
        this.prefetchQueue.delete(route);
        return;
      }

      // Fetch data in background
      const data = await fetchFunction();
      this.cacheRouteData(route, data);
    } catch (error) {
      console.warn(`Failed to prefetch route ${route}:`, error);
    } finally {
      this.prefetchQueue.delete(route);
    }
  }

  // Check if route is being prefetched
  isPrefetching(route: string): boolean {
    return this.prefetchQueue.has(route);
  }

  // Get cache statistics
  getCacheStats(): { size: number; routes: string[] } {
    const routes = Object.keys(this.routeCache);
    return {
      size: routes.length,
      routes,
    };
  }
}

export const routeOptimizer = RouteOptimizationManager.getInstance();

// Hook for components to use route optimization
export const useRouteOptimization = () => {
  const cacheData = (route: string, data: any, duration?: number) => {
    routeOptimizer.cacheRouteData(route, data, duration);
  };

  const getCachedData = (route: string) => {
    return routeOptimizer.getCachedRouteData(route);
  };

  const prefetchRoute = (route: string, fetchFunction: () => Promise<any>) => {
    return routeOptimizer.prefetchRoute(route, fetchFunction);
  };

  const clearCache = (route?: string) => {
    if (route) {
      routeOptimizer.clearRouteCache(route);
    } else {
      routeOptimizer.clearAllCache();
    }
  };

  return {
    cacheData,
    getCachedData,
    prefetchRoute,
    clearCache,
    isPrefetching: routeOptimizer.isPrefetching.bind(routeOptimizer),
    getCacheStats: routeOptimizer.getCacheStats.bind(routeOptimizer),
  };
};

// Navigation performance optimizer
export class NavigationOptimizer {
  private static prefetchTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Prefetch route on hover with delay
  static prefetchOnHover(route: string, fetchFunction: () => Promise<any>, delay = 300) {
    return {
      onMouseEnter: () => {
        const timeout = setTimeout(() => {
          routeOptimizer.prefetchRoute(route, fetchFunction);
        }, delay);
        
        this.prefetchTimeouts.set(route, timeout);
      },
      onMouseLeave: () => {
        const timeout = this.prefetchTimeouts.get(route);
        if (timeout) {
          clearTimeout(timeout);
          this.prefetchTimeouts.delete(route);
        }
      },
    };
  }

  // Prefetch adjacent routes (for pagination)
  static prefetchAdjacent(
    currentPage: number,
    totalPages: number,
    fetchFunction: (page: number) => Promise<any>
  ) {
    const adjacentPages = [];
    
    if (currentPage > 1) adjacentPages.push(currentPage - 1);
    if (currentPage < totalPages) adjacentPages.push(currentPage + 1);

    adjacentPages.forEach(page => {
      const route = `page_${page}`;
      routeOptimizer.prefetchRoute(route, () => fetchFunction(page));
    });
  }

  // Intelligent prefetching based on user behavior
  static setupIntelligentPrefetch() {
    let lastScrollTime = 0;
    let isScrollingDown = false;

    const handleScroll = () => {
      const currentTime = Date.now();
      const scrollDelta = window.scrollY - lastScrollTime;
      
      isScrollingDown = scrollDelta > 0;
      lastScrollTime = currentTime;

      // If user is scrolling down near bottom, prefetch next page
      if (isScrollingDown) {
        const scrollPercentage = 
          (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
        
        if (scrollPercentage > 0.8) {
          // Trigger prefetch of next page/section
          window.dispatchEvent(new CustomEvent('prefetchNext'));
        }
      }
    };

    // Throttled scroll listener
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }
}

// Performance monitoring
export class NavigationPerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTiming(route: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(route)) {
        this.metrics.set(route, []);
      }
      
      const routeMetrics = this.metrics.get(route)!;
      routeMetrics.push(duration);
      
      // Keep only last 10 measurements
      if (routeMetrics.length > 10) {
        routeMetrics.shift();
      }
      
      console.log(`Route ${route} took ${duration.toFixed(2)}ms`);
    };
  }

  static getAverageTime(route: string): number {
    const metrics = this.metrics.get(route);
    if (!metrics || metrics.length === 0) return 0;
    
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }

  static getAllMetrics(): Record<string, { average: number; samples: number }> {
    const result: Record<string, { average: number; samples: number }> = {};
    
    this.metrics.forEach((times, route) => {
      result[route] = {
        average: this.getAverageTime(route),
        samples: times.length,
      };
    });
    
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}
