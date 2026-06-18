import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '../types'
import { authService } from '../services/authService'
import { apiClient } from '../api/client'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
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
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser)
      
      const provider = localStorage.getItem('authProvider')
      // If Firebase user logs out but we still have a local Google-login session active, clear it.
      if (provider === 'google' && !fUser && localUser) {
        authService.logout()
        setCurrentUser(null)
      }
      setLoading(false)
    }, (error) => {
      console.error("Firebase auth state change error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    localStorage.setItem('authProvider', 'password')
    setCurrentUser(response.user as any)
  }

  const signup = async (email: string, password: string, name: string, roleRequested: Role) => {
    const response = await authService.register({ email, password, name, role: roleRequested })
    localStorage.setItem('authProvider', 'password')
    setCurrentUser(response.user as any)
  }

  const googleSignIn = async (roleRequested: Role = 'User') => {
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
    localStorage.setItem('authProvider', 'google')
    setCurrentUser(res.user)
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error("Error signing out from Firebase:", err)
    }
    authService.logout()
    setCurrentUser(null)
    setFirebaseUser(null)
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
