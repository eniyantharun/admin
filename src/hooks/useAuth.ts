'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginAsync, logoutAsync } from '@/store/authSlice';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = Cookies.get('auth_token');
    if (storedToken && !isAuthenticated) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const login = async (username: string, password: string) => {
    try {
      await dispatch(loginAsync({ username, password })).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await dispatch(logoutAsync());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: isLoading || loading,
    error,
    login,
    logout,
  };
};