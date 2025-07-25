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
  private defaultCacheDuration = 5 * 60 * 1000; 

  static getInstance(): RouteOptimizationManager {
    if (!RouteOptimizationManager.instance) {
      RouteOptimizationManager.instance = new RouteOptimizationManager();
    }
    return RouteOptimizationManager.instance;
  }

  cacheRouteData(route: string, data: any, cacheDuration?: number): void {
    const expiry = cacheDuration || this.defaultCacheDuration;
    this.routeCache[route] = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
    };
  }

  getCachedRouteData(route: string): any | null {
    const cached = this.routeCache[route];
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      delete this.routeCache[route];
      return null;
    }
    
    return cached.data;
  }

  clearRouteCache(route: string): void {
    delete this.routeCache[route];
  }

  clearAllCache(): void {
    this.routeCache = {};
  }

  getCacheStats(): { size: number; routes: string[] } {
    const routes = Object.keys(this.routeCache);
    return {
      size: routes.length,
      routes,
    };
  }
}

export const routeOptimizer = RouteOptimizationManager.getInstance();

export const useRouteOptimization = () => {
  const cacheData = (route: string, data: any, duration?: number) => {
    routeOptimizer.cacheRouteData(route, data, duration);
  };

  const getCachedData = (route: string) => {
    return routeOptimizer.getCachedRouteData(route);
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
    clearCache,
    getCacheStats: routeOptimizer.getCacheStats.bind(routeOptimizer),
  };
};

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