'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Eye, EyeOff, User, Lock, Loader2, AlertCircle } from 'lucide-react'
import {STRINGS} from '../../../constants/strings'
import { apiPost } from '@/features/service/api'

interface IProps {
  className?: string
  username?: string
}

export const ResetPasswordForm: React.FC<IProps> = props => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  return (
    <LoginForm
      {...props}
      isUsernameDisabled
      submitText="UPDATE PASSWORD"
      loading={loading}
      error={error}
      onSubmit={async (_, password) => {
        setLoading(true)
        setError(null)

        try {
          await apiPost('/Admin/User/ResetPassword', {
            password,
          })

          Cookies.remove(STRINGS.AUTH.COOKIE_TOKEN_KEY)
          router.push('/login')
        } catch (err) {
          setError('Failed to update password. Please try again.')
          setLoading(false)
        }
      }}
    />
  )
}

export const LoginForm: React.FC<IProps & {
  loading: boolean
  onSubmit: (username: string, password: string) => void
  submitText: string
  isUsernameDisabled?: boolean
  error?: string | null
}> = props => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: props.username || '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form
      className={`space-y-4 lg:space-y-6 ${props.className || ''}`}
      onSubmit={e => {
        e.preventDefault()

        const username = formData.username || props.username
        const password = formData.password

        if (!username || !password) {
          return
        }

        props.onSubmit(username, password)
      }}
    >
      {props.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{props.error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          {props.isUsernameDisabled ? 'Username' : 'Username'}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="username"
            name="username"
            type="text"
            placeholder={props.isUsernameDisabled ? props.username : "Enter your username"}
            value={props.isUsernameDisabled ? props.username : formData.username}
            onChange={handleInputChange}
            disabled={props.isUsernameDisabled || props.loading}
            autoComplete="username"
            className="w-full pl-10 h-11 lg:h-12 px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm lg:text-base transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          {props.isUsernameDisabled ? 'New Password' : 'Password'}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={props.isUsernameDisabled ? "Enter new password" : "Enter your password"}
            value={formData.password}
            onChange={handleInputChange}
            disabled={props.loading}
            autoComplete={props.isUsernameDisabled ? "new-password" : "current-password"}
            className="w-full pl-10 pr-10 h-11 lg:h-12 px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm lg:text-base transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={props.loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-11 lg:h-12 bg-gradient-to-r  from-blue-500 via-blue-600 to-blue-800 hover:to-blue-900 text-white font-medium text-sm lg:text-base rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
        disabled={props.loading}
      >
        {props.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          <span>{props.submitText}</span>
        )}
      </button>
    </form>
  )
}