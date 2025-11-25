/**
 * Utility functions for product editing
 */

import React from 'react';

/**
 * Parse production time string into a display format
 * Examples: "5" -> "5 days", "5-7" -> "5-7 days", "10" -> "10 days"
 */
export function parseProductionTime(value: string | number | number[]): string {
  if (Array.isArray(value)) {
    if (value.length === 1) {
      return `${value[0]} days`;
    }
    if (value.length === 2) {
      return `${value[0]}-${value[1]} days`;
    }
  }

  if (typeof value === 'number') {
    return `${value} days`;
  }

  if (typeof value === 'string') {
    // Handle formats like "5", "5-7", "5 to 7", etc.
    const match = value.match(/(\d+)(?:\s*[-to]+\s*(\d+))?/);
    if (match) {
      const [, first, second] = match;
      if (second) {
        return `${first}-${second} days`;
      }
      return `${first} days`;
    }
  }

  return '';
}

/**
 * Convert production time string to array for API
 * Examples: "5" -> [5], "5-7" -> [5, 7]
 */
export function toProductionTimeArray(value: string): number[] {
  const match = value.match(/(\d+)(?:\s*[-to]+\s*(\d+))?/);
  if (match) {
    const [, first, second] = match;
    if (second) {
      return [parseInt(first), parseInt(second)];
    }
    return [parseInt(first)];
  }
  return [];
}

/**
 * Convert production time string for display
 * Examples: [5] -> "5", [5, 7] -> "5-7"
 */
export function toProductionTimeString(value: number | number[] | undefined): string {
  if (value === undefined) return '';
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value.length === 1) return value[0].toString();
    return `${value[0]}-${value[1]}`;
  }
  return value.toString();
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(2)}`;
}

/**
 * Currency Pipe component for displaying formatted currency
 */
export function CurrencyPipe({ value }: { value: number | null | undefined }) {
  return <span>{formatCurrency(value)}</span>;
}
