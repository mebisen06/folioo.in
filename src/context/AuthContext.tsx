import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebase'
import type { Role } from '../types'

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
    if (!isFirebaseConfigured) {
      // Mock mode initialization
      const storedUser = localStorage.getItem('mock_user')
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Failed to parse mock user', e)
        }
      }
      setLoading(false)
      return
    }

    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser)
      if (fUser) {
        try {
          const token = await fUser.getIdToken(true)
          localStorage.setItem('token', token)
          
          const userDocRef = doc(db!, 'users', fUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            setCurrentUser({
              uid: fUser.uid,
              name: data.name || fUser.displayName || 'Anonymous User',
              email: fUser.email || '',
              role: data.role || 'User',
              createdAt: data.createdAt || new Date().toISOString(),
              photoURL: fUser.photoURL
            })
          } else {
            // First time auth callback safety
            const requestedRole = (sessionStorage.getItem('requested_role') as Role) || 'User'
            sessionStorage.removeItem('requested_role')
            const fallbackUser: AuthUser = {
              uid: fUser.uid,
              name: fUser.displayName || 'Anonymous User',
              email: fUser.email || '',
              role: requestedRole,
              createdAt: new Date().toISOString(),
              photoURL: fUser.photoURL
            }
            setCurrentUser(fallbackUser)
            await setDoc(userDocRef, {
              uid: fallbackUser.uid,
              name: fallbackUser.name,
              email: fallbackUser.email,
              role: fallbackUser.role,
              createdAt: fallbackUser.createdAt
            })
          }
        } catch (error) {
          console.error('Error fetching/creating Firestore user details:', error)
        }
      } else {
        localStorage.removeItem('token')
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const storedUsersRaw = localStorage.getItem('mock_users')
      const users: AuthUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : []
      
      // Let's add a default admin user if none exists
      if (users.length === 0) {
        const defaultAdmin: AuthUser & { password?: string } = {
          uid: 'admin-uid',
          name: 'Admin User',
          email: 'admin@portifyhub.com',
          role: 'Admin',
          createdAt: new Date().toISOString(),
          password: 'password123'
        }
        users.push(defaultAdmin as AuthUser)
        localStorage.setItem('mock_users', JSON.stringify(users))
      }
      
      const userRaw = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
      if (userRaw) {
        const { password: _, ...userWithoutPassword } = userRaw as any
        setCurrentUser(userWithoutPassword)
        localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword))
        localStorage.setItem('token', 'mock-jwt-token')
        return
      }
      throw new Error('User not found in mockup registry. Please Sign Up first!')
    }

    if (!auth) throw new Error('Firebase Auth is not initialized')
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email: string, password: string, name: string, roleRequested: Role) => {
    if (!isFirebaseConfigured) {
      const storedUsersRaw = localStorage.getItem('mock_users')
      const users: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : []
      
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User with this email already exists.')
      }

      const newUser: AuthUser & { password?: string } = {
        uid: 'mock-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: roleRequested,
        createdAt: new Date().toISOString(),
        password
      }
      users.push(newUser)
      localStorage.setItem('mock_users', JSON.stringify(users))
      
      const { password: _, ...userWithoutPassword } = newUser
      setCurrentUser(userWithoutPassword)
      localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword))
      localStorage.setItem('token', 'mock-jwt-token')
      return
    }

    if (!auth) throw new Error('Firebase Auth is not initialized')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user
    
    await updateProfile(user, { displayName: name })
    
    const userDocRef = doc(db!, 'users', user.uid)
    await setDoc(userDocRef, {
      uid: user.uid,
      name,
      email,
      role: roleRequested,
      createdAt: new Date().toISOString()
    })
  }

  const googleSignIn = async (roleRequested: Role = 'User') => {
    if (!isFirebaseConfigured) {
      const mockGoogleUser: AuthUser = {
        uid: 'google-mock-uid',
        name: 'Google Test User',
        email: 'googletest@gmail.com',
        role: roleRequested,
        createdAt: new Date().toISOString()
      }
      setCurrentUser(mockGoogleUser)
      localStorage.setItem('mock_user', JSON.stringify(mockGoogleUser))
      localStorage.setItem('token', 'mock-google-jwt-token')
      return
    }

    if (!auth) throw new Error('Firebase Auth is not initialized')
    sessionStorage.setItem('requested_role', roleRequested)
    
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      const userDocRef = doc(db!, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        const requestedRole = (sessionStorage.getItem('requested_role') as Role) || roleRequested
        sessionStorage.removeItem('requested_role')
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || 'Anonymous User',
          email: user.email || '',
          role: requestedRole,
          createdAt: new Date().toISOString()
        })
      }
    } catch (error) {
      sessionStorage.removeItem('requested_role')
      throw error
    }
  }

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setCurrentUser(null)
      localStorage.removeItem('mock_user')
      localStorage.removeItem('token')
      return
    }

    if (!auth) throw new Error('Firebase Auth is not initialized')
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      alert(`[Mock mode] Password reset link simulated to: ${email}`)
      return
    }

    if (!auth) throw new Error('Firebase Auth is not initialized')
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
