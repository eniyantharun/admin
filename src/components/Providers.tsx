'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { SearchProvider } from '@/contexts/SearchContext';
import { store } from '@/store';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <div className="app-providers-wrapper">
      <Provider store={store}>
        <SearchProvider>
          <div className="app-redux-provider">
            {children}
          </div>
        </SearchProvider>
      </Provider>
    </div>
  );
};