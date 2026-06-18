import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '../types'
import { authService } from '../services/authService'
import { auth, googleProvider, db } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface AuthUser {
  uid: string
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  joinedAt: string
  status: 'Active' | 'Suspended'
  portfoliosCount: number
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
    // 1. Restore cached local user session on mount
    const localUser = authService.getUser()
    if (localUser) {
      setCurrentUser(localUser as any)
    }

    // 2. Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser)
      
      const provider = localStorage.getItem('authProvider')
      if (fUser) {
        // Fetch or refresh profile details from Firestore
        try {
          const userSnap = await getDoc(doc(db, "users", fUser.uid))
          if (userSnap.exists()) {
            const profile = userSnap.data() as AuthUser
            setCurrentUser(profile)
            authService.setUser(profile as any)
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error)
        }
      } else {
        // If Firebase user logs out and provider was google, clear local session
        if (provider === 'google' && localUser) {
          authService.logout()
          setCurrentUser(null)
        }
      }
      setLoading(false)
    }, (error) => {
      console.error("Firebase auth state change error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user

    const userSnap = await getDoc(doc(db, "users", user.uid))
    if (!userSnap.exists()) {
      throw new Error("User profile not found in database.")
    }

    const profile = userSnap.data() as AuthUser
    if (profile.status === 'Suspended') {
      await signOut(auth)
      throw new Error("Your account has been suspended by an administrator.")
    }

    const idToken = await user.getIdToken()
    authService.setToken(idToken)
    authService.setUser(profile as any)
    localStorage.setItem('authProvider', 'password')
    setCurrentUser(profile)
  }

  const signup = async (email: string, password: string, name: string, roleRequested: Role) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    const profile: AuthUser = {
      uid: user.uid,
      id: user.uid,
      name,
      email: user.email || email,
      role: roleRequested,
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      status: 'Active',
      portfoliosCount: 0,
      photoURL: user.photoURL || null
    }

    await setDoc(doc(db, "users", user.uid), profile)

    const idToken = await user.getIdToken()
    authService.setToken(idToken)
    authService.setUser(profile as any)
    localStorage.setItem('authProvider', 'password')
    setCurrentUser(profile)
  }

  const googleSignIn = async (roleRequested: Role = 'User') => {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    let profile: AuthUser

    if (!userSnap.exists()) {
      profile = {
        uid: user.uid,
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email || '',
        role: roleRequested,
        createdAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        status: 'Active',
        portfoliosCount: 0,
        photoURL: user.photoURL || null
      }
      await setDoc(userRef, profile)
    } else {
      profile = userSnap.data() as AuthUser
      if (profile.status === 'Suspended') {
        await signOut(auth)
        throw new Error("Your account has been suspended by an administrator.")
      }
    }

    const idToken = await user.getIdToken()
    authService.setToken(idToken)
    authService.setUser(profile as any)
    localStorage.setItem('authProvider', 'google')
    setCurrentUser(profile)
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
    await sendPasswordResetEmail(auth, email)
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
