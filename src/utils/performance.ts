// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  // Start measuring performance for an operation
  static startMeasurement(operationName: string): void {
    this.measurements.set(operationName, performance.now());
  }

  // End measurement and log the duration
  static endMeasurement(operationName: string): number {
    const startTime = this.measurements.get(operationName);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(operationName);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Measure async operations
  static async measureAsync<T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    this.startMeasurement(operationName);
    try {
      const result = await operation();
      const duration = this.endMeasurement(operationName);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      this.endMeasurement(operationName);
      throw error;
    }
  }

  // Get current performance metrics
  static getMetrics() {
    return {
      navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      memory: (performance as any).memory,
      timing: performance.timing
    };
  }
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export const memoryMonitor = {
  logMemoryUsage: (context: string) => {
    if (process.env.NODE_ENV === 'development' && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log(`🧠 Memory Usage (${context}):`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  },

  checkMemoryPressure: (): boolean => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio > 0.8; // 80% threshold
    }
    return false;
  }
};