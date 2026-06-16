import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '../types'
import { authService } from '../services/authService'
import { apiClient } from '../api/client'

export interface AuthUser {
  uid: string
  name: string
  email: string
  role: Role
  createdAt: string
  photoURL?: string | null
}

interface AuthContextType {
  currentUser: AuthUser | null
  firebaseUser: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, roleRequested: Role) => Promise<void>
  googleSignIn: (roleRequested?: Role) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Decode Google credential helper
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = authService.getUser()
    if (user) {
      setCurrentUser(user as any)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setCurrentUser(response.user as any)
  }

  const signup = async (email: string, password: string, name: string, roleRequested: Role) => {
    const response = await authService.register({ email, password, name, role: roleRequested })
    setCurrentUser(response.user as any)
  }

  const googleSignIn = async (roleRequested: Role = 'User') => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    
    if (clientId && typeof window !== 'undefined' && (window as any).google) {
      return new Promise<void>((resolve, reject) => {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              const profile = parseJwt(response.credential)
              const payload = {
                uid: profile?.sub || 'google-user-' + Math.random().toString(36).substr(2, 9),
                email: profile?.email || 'googletest@gmail.com',
                name: profile?.name || 'Google Test User',
                role: roleRequested
              }
              const res = await apiClient.post<{ token: string, user: AuthUser }>('/auth/google', payload)
              localStorage.setItem('token', res.token)
              localStorage.setItem('user', JSON.stringify(res.user))
              setCurrentUser(res.user)
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        });
        (window as any).google.accounts.id.prompt()
      })
    } else {
      // Graceful local development fallback: authenticate with the backend using the mock Google credentials
      const randomId = Math.random().toString(36).substr(2, 9)
      const payload = {
        uid: `google-${randomId}`,
        email: `googletest-${randomId}@gmail.com`,
        name: `Google Test User ${randomId}`,
        role: roleRequested
      }
      const res = await apiClient.post<{ token: string, user: AuthUser }>('/auth/google', payload)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      setCurrentUser(res.user)
    }
  }

  const logout = async () => {
    authService.logout()
    setCurrentUser(null)
  }

  const resetPassword = async (email: string) => {
    alert(`[Simulated] Password reset link sent to: ${email}`)
  }

  const value = {
    currentUser,
    firebaseUser: null,
    loading,
    login,
    signup,
    googleSignIn,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
