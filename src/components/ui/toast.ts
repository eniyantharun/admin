import { iToastOptions } from '@/types';
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string, options?: iToastOptions) => {
    return toast.success(message, options);
  },

  error: (message: string, options?: iToastOptions) => {
    return toast.error(message, options);
  },

  loading: (message: string, options?: iToastOptions) => {
    return toast.loading(message, options);
  },

  info: (message: string, options?: iToastOptions) => {
    return toast(message, {
      icon: 'ℹ️',
      ...options,
    });
  },

  warning: (message: string, options?: iToastOptions) => {
    return toast(message, {
      icon: '⚠️',
      style: {
        border: '1px solid #f59e0b',
        backgroundColor: '#fffbeb',
      },
      ...options,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: iToastOptions
  ) => {
    return toast.promise(promise, messages, options);
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  remove: (toastId: string) => {
    return toast.remove(toastId);
  },

  apiError: (error: any, fallbackMessage = 'An error occurred') => {
    const message = error?.response?.data?.message || error?.message || fallbackMessage;
    return toast.error(message);
  },

  apiSuccess: (message: string, data?: any) => {
    return toast.success(message);
  },
};

export const notify = showToast;