/**
 * Common API Types
 * Shared types across all API modules
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BatchProgress {
  batchId: string;
  total: number;
  processed: number;
  remaining: number;
  percentage: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortParams {
  field: string;
  direction: SortDirection;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
  page?: number;
  pageSize?: number;
}
