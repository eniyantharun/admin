'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { setupAuthInterceptors } from '../../infrastructure/interceptors/auth';
import { getAdminToken } from '../utils/helpers/cookieHelper';
import { setAuthFromStorage } from '../../features/auth/store/auth.slice';

interface ProvidersProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    setupAuthInterceptors();
    
    // Initialize auth state from cookies if token exists
    const token = getAdminToken();
    if (token) {
      store.dispatch(setAuthFromStorage({
        token,
        user: { username: 'Admin',
          id: "1",
          email:"email"
         }
      }));
    }
  }, []);

  return <>{children}</>;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
};
