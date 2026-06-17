import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '../types'
import { authService } from '../services/authService'
import { apiClient } from '../api/client'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'

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
  firebaseUser: FirebaseUser | null
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Restore the local FastAPI user session
    const localUser = authService.getUser()
    if (localUser) {
      setCurrentUser(localUser as any)
    }

    // 2. Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser)
      
      if (fUser) {
        const localUserId = localUser ? (localUser.id || (localUser as any).uid || '') : ''
        // If we are logged in on Firebase, but don't have a matching backend session, sync it!
        if (localUserId !== fUser.uid) {
          const roleRequested = (localStorage.getItem('google_sign_in_role') as Role) || 'User'
          try {
            const payload = {
              uid: fUser.uid,
              email: fUser.email || '',
              name: fUser.displayName || 'Google User',
              role: roleRequested,
              photoURL: fUser.photoURL || null
            }
            const res = await apiClient.post<{ token: string, user: any }>('/auth/google', payload)
            authService.setToken(res.token)
            authService.setUser(res.user)
            setCurrentUser(res.user)
            localStorage.removeItem('google_sign_in_role')
            
            // Trigger navigation update by reloading or updating window location/state if needed
            // Since navigation is controlled by page state, we can let App.tsx re-render.
          } catch (err) {
            console.error('Error syncing Google user with backend:', err)
          }
        }
      } else {
        const localUserId = localUser ? (localUser.id || (localUser as any).uid || '') : ''
        // If Firebase user logs out but we still have a local Google-login session active, clear it.
        if (localUser && localUserId.startsWith('google-')) {
          authService.logout()
          setCurrentUser(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
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
    // Save the requested role in localStorage so it persists across redirects
    localStorage.setItem('google_sign_in_role', roleRequested)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      const payload = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Google User',
        role: roleRequested,
        photoURL: firebaseUser.photoURL || null
      }

      // Authenticate the Firebase identity against the FastAPI backend
      const res = await apiClient.post<{ token: string, user: any }>('/auth/google', payload)
      
      // Save backend JWT and user profile
      authService.setToken(res.token)
      authService.setUser(res.user)
      setCurrentUser(res.user)
      localStorage.removeItem('google_sign_in_role')
    } catch (err: any) {
      // Fallback to redirect if popup is blocked or closed by browser
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        console.warn('Google Sign-In popup blocked or closed. Falling back to redirect flow...')
        await signInWithRedirect(auth, googleProvider)
      } else {
        throw err
      }
    }
  }

  const logout = async () => {
    await signOut(auth)
    authService.logout()
    setCurrentUser(null)
    setFirebaseUser(null)
    localStorage.removeItem('google_sign_in_role')
  }

  const resetPassword = async (email: string) => {
    alert(`[Simulated] Password reset link sent to: ${email}`)
  }

  const value = {
    currentUser,
    firebaseUser,
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
