import { apiClient } from '../config/api';
import { AxiosError, AxiosResponse } from 'axios';
import { getAdminToken, clearAdminToken } from '../../shared/utils/helpers/cookieHelper';

export const setupAuthInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = getAdminToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        clearAdminToken();
        window.location.href = '/login';
      }
      
      return Promise.reject({
        message: error.response?.data || error.message || 'An error occurred',
        status: error.response?.status,
      });
    }
  );
};