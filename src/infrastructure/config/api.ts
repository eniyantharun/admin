import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.promowe.com/';

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

export const apiClient = createApiInstance();

export const apiConfig = {
  get: (url: string, config?: AxiosRequestConfig) => {
    return apiClient.get(url, config);
  },
  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.post(url, data, config);
  },
  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete(url, config);
  },
};