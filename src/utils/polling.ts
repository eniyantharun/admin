/**
 * Polling Utilities
 * Poll API endpoints until a condition is met
 */

import { BatchProgress } from '@/types/api';

export interface PollingOptions {
  interval?: number; // Polling interval in ms (default: 1000)
  maxAttempts?: number; // Max polling attempts (default: 300 = 5 minutes)
  onProgress?: (progress: BatchProgress) => void;
  onError?: (error: Error) => void;
}

/**
 * Poll a function until it returns a truthy value or max attempts reached
 * @param pollFn - Function that returns a promise
 * @param condition - Condition to check the result
 * @param options - Polling options
 * @returns Final result
 */
export async function pollUntil<T>(
  pollFn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: PollingOptions = {}
): Promise<T> {
  const {
    interval = 1000,
    maxAttempts = 300,
    onProgress,
    onError,
  } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await pollFn();

      if (condition(result)) {
        return result;
      }

      // Wait before next poll
      await sleep(interval);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }

  throw new Error(`Polling timeout: Max attempts (${maxAttempts}) reached`);
}

/**
 * Poll a batch operation until completion
 * @param updateFn - Function that returns batch status
 * @param batchId - Batch ID to poll
 * @param options - Polling options
 * @returns Final batch progress
 */
export async function pollBatchOperation(
  updateFn: (batchId: string) => Promise<BatchProgress>,
  batchId: string,
  options: PollingOptions = {}
): Promise<BatchProgress> {
  const { onProgress } = options;

  return pollUntil(
    () => updateFn(batchId),
    (progress) => {
      // Notify progress callback
      if (onProgress) {
        onProgress(progress);
      }

      // Check if completed
      return progress.remaining === 0 || progress.status === 'completed' || progress.status === 'failed';
    },
    options
  );
}

/**
 * Create a poller instance for reusable polling
 */
export class Poller<T> {
  private isPolling: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private attempts: number = 0;

  constructor(
    private pollFn: () => Promise<T>,
    private condition: (result: T) => boolean,
    private options: PollingOptions = {}
  ) {}

  /**
   * Start polling
   */
  async start(): Promise<T> {
    if (this.isPolling) {
      throw new Error('Polling already in progress');
    }

    this.isPolling = true;
    this.attempts = 0;

    const { interval = 1000, maxAttempts = 300 } = this.options;

    return new Promise<T>((resolve, reject) => {
      const poll = async () => {
        this.attempts++;

        if (this.attempts > maxAttempts) {
          this.stop();
          reject(new Error(`Polling timeout: Max attempts (${maxAttempts}) reached`));
          return;
        }

        try {
          const result = await this.pollFn();

          if (this.condition(result)) {
            this.stop();
            resolve(result);
            return;
          }

          // Continue polling
          this.pollInterval = setTimeout(poll, interval);
        } catch (error) {
          this.stop();
          if (this.options.onError) {
            this.options.onError(error as Error);
          }
          reject(error);
        }
      };

      // Start first poll
      poll();
    });
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  /**
   * Check if currently polling
   */
  get polling(): boolean {
    return this.isPolling;
  }

  /**
   * Get current attempt count
   */
  get attemptCount(): number {
    return this.attempts;
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll with exponential backoff
 */
export async function pollWithBackoff<T>(
  pollFn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: PollingOptions & { backoffMultiplier?: number } = {}
): Promise<T> {
  const {
    interval = 1000,
    maxAttempts = 300,
    backoffMultiplier = 1.5,
    onProgress,
    onError,
  } = options;

  let attempts = 0;
  let currentInterval = interval;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await pollFn();

      if (condition(result)) {
        return result;
      }

      // Wait with backoff
      await sleep(currentInterval);
      currentInterval = Math.min(currentInterval * backoffMultiplier, 10000); // Max 10s
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }

  throw new Error(`Polling timeout: Max attempts (${maxAttempts}) reached`);
}
