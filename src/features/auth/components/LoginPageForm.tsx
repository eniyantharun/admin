'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { LoginForm } from './LoginForm'
import {STRINGS} from '../../../constants/strings'
import { apiPost } from '@/features/service/api'
import { setAdminToken } from '@/shared/utils/helpers/cookieHelper'
import { useAppDispatch } from '@/shared/hooks/redux'
import { setAuthFromStorage } from '../store/auth.slice'

export const LoginPageForm: React.FC<{
  redirect?: string
}> = props => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const dispatch = useAppDispatch()

  return (
    <LoginForm
      {...props}
      loading={loading}
      submitText="Sign In"
      onSubmit={async (username, password) => {
        setLoading(true)
        setError(null)

        const login = await apiPost('/Admin/Login/Login', {
          username,
          password,
        })
          .catch(err => {
            if (err.response?.status === 401) {
              setError('Invalid username or password')
              setLoading(false)
              return undefined
            }

            setError('An error occurred. Please try again.')
            setLoading(false)
            throw err
          })

        if (!login) {
          return
        }

        setAdminToken(login)
        
        // Update Redux state with authentication data
        dispatch(setAuthFromStorage({
          token: login.token,
          user: login.user || { username: login.username || 'Admin' }
        }))
        
        router.push('/dashboard')
      }}
    />
  )
}