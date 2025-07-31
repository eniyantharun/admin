'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { authUtils } from '@/lib/auth';
import { useAppDispatch } from '@/hooks/redux';
import { setAuthFromStorage } from '@/store/authSlice';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import { iLoginPageFormProps } from '@/types/login';
import { showToast } from '@/components/ui/toast';

export const LoginPageForm: React.FC<iLoginPageFormProps> = ({ redirectTo = '/dashboard' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { post, loading, error, clearError } = useApi();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const response = await post('/Admin/Login/Login', {
        username: formData.username,
        password: formData.password,
      });

      authUtils.setToken(response.token, new Date(response.expires));
      
      dispatch(setAuthFromStorage({
        token: response.token,
        user: response.user || { 
          id: '1', 
          username: formData.username, 
          email: formData.username + '@example.com' 
        }
      }));
      
      router.push(redirectTo);
      showToast.success('Welcome back!');

    } catch (err: any) {
      showToast.error('Login error:');

    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form-container space-y-4 lg:space-y-6">
      {error && (
        <div className="login-form-error bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
          <AlertCircle className="login-form-error-icon h-4 w-4 flex-shrink-0" />
          <span className="login-form-error-text text-sm">{error}</span>
        </div>
      )}

      <div className="login-form-username-group space-y-2">
        <label htmlFor="username" className="login-form-username-label text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="login-form-username-wrapper relative">
          <User className="login-form-username-icon absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            className="login-form-username-input w-full pl-10 h-11 lg:h-12 px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm lg:text-base transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter your username"
            required
          />
        </div>
      </div>

      <div className="login-form-password-group space-y-2">
        <label htmlFor="password" className="login-form-password-label text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="login-form-password-wrapper relative">
          <Lock className="login-form-password-icon absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="login-form-password-input w-full pl-10 pr-10 h-11 lg:h-12 px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm lg:text-base transition-all duration-200"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="login-form-password-toggle absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="login-form-password-hide-icon h-4 w-4" />
            ) : (
              <Eye className="login-form-password-show-icon h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="login-form-submit-button w-full h-11 lg:h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 hover:to-blue-900"
        loading={loading}
        disabled={!formData.username || !formData.password}
      >
        Sign In
      </Button>
    </form>
  );
};