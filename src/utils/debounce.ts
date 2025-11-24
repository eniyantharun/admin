/**
 * Debounce Utilities
 * Delay function execution until after a specified wait time
 */

/**
 * Creates a debounced version of a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a debounced version of an async function
 * @param func - Async function to debounce
 * @param wait - Wait time in milliseconds (default: 300ms)
 * @returns Debounced async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let latestResolve: ((value: ReturnType<T>) => void) | null = null;
  let latestReject: ((reason?: any) => void) | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
        // Reject previous pending promise
        if (latestReject) {
          latestReject(new Error('Debounced call cancelled'));
        }
      }

      latestResolve = resolve;
      latestReject = reject;

      timeout = setTimeout(async () => {
        timeout = null;
        try {
          const result = await func(...args);
          if (latestResolve) {
            latestResolve(result);
          }
        } catch (error) {
          if (latestReject) {
            latestReject(error);
          }
        }
      }, wait);
    });
  };
}

/**
 * Creates a debouncer class for more control
 */
export class Debouncer {
  private timeout: NodeJS.Timeout | null = null;
  private wait: number;

  constructor(wait: number = 300) {
    this.wait = wait;
  }

  /**
   * Debounce a function call
   */
  debounce(func: () => void): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(func, this.wait);
  }

  /**
   * Cancel pending debounced call
   */
  cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
   * Execute immediately and cancel pending
   */
  flush(func: () => void): void {
    this.cancel();
    func();
  }
}
