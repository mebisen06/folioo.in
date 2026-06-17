import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBLATZsMN9gsYkFAfj0KDmEs40TiRgtbe4",
  authDomain: "folioo-17685.firebaseapp.com",
  projectId: "folioo-17685",
  storageBucket: "folioo-17685.firebasestorage.app",
  messagingSenderId: "416507528657",
  appId: "1:416507528657:web:48f3e4113b1c18b6b0ccf0",
  measurementId: "G-JQ3S5RVDXW"
}

export const isFirebaseConfigured = true

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Export Services
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
