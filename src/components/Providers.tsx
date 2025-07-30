'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { iProvidersProps } from '@/types';

export const Providers: React.FC<iProvidersProps> = ({ children }) => {
  return (
    <div className="app-providers-wrapper">
      <Provider store={store}>
        <div className="app-redux-provider">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2500,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                style: {
                  border: '1px solid #10b981',
                  backgroundColor: '#f0fdf4',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                  backgroundColor: '#fef2f2',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                style: {
                  border: '1px solid #3b82f6',
                  backgroundColor: '#f0f9ff',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Provider>
    </div>
  );
};