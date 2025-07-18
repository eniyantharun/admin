import axios, { AxiosRequestConfig } from 'axios';
import { getAdminToken } from '../../../shared/utils/helpers/cookieHelper';

const axiosInstance = axios.create({
  baseURL: 'https://api.promowe.com/',
  headers: {
    'ngrok-skip-browser-warning': process.env.NEXT_PUBLIC_NGROK || '',
  },
});

// Add token from cookies to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Common GET method
export const apiGet = async (url: string, params?: any, config?: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance.get(url, {
      params,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ✅ Common POST method
export const apiPost = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export default axiosInstance;
