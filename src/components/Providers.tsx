'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <div className="app-providers-wrapper">
      <Provider store={store}>
        <div className="app-redux-provider">
          {children}
        </div>
      </Provider>
    </div>
  );
};