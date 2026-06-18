import { db } from '../firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { AdminDashboardData, User, Portfolio } from '../types'

export const adminService = {
  getDashboardData: async (): Promise<AdminDashboardData> => {
    // Fetch all users
    const usersSnap = await getDocs(collection(db, "users"))
    const users: User[] = []
    usersSnap.forEach((doc) => {
      users.push(doc.data() as User)
    })

    // Fetch all portfolios
    const portfoliosSnap = await getDocs(collection(db, "portfolios"))
    const portfolios: Portfolio[] = []
    portfoliosSnap.forEach((doc) => {
      portfolios.push(doc.data() as Portfolio)
    })

    const totalDownloads = portfolios.reduce((sum, p) => sum + (Number(p.downloads) || 0), 0)

    return {
      stats: {
        totalUsers: users.length,
        totalCreators: users.filter(u => u.role === 'Creator').length,
        totalPortfolios: portfolios.length,
        totalDownloads: totalDownloads
      },
      users: users,
      portfolios: portfolios
    }
  },
  
  approvePortfolio: async (id: string | number) => {
    const docRef = doc(db, "portfolios", id.toString())
    await updateDoc(docRef, { status: 'Approved' })
    return { success: true }
  },

  rejectPortfolio: async (id: string | number) => {
    const docRef = doc(db, "portfolios", id.toString())
    await updateDoc(docRef, { status: 'Rejected' })
    return { success: true }
  },

  deletePortfolio: async (id: string | number) => {
    const docRef = doc(db, "portfolios", id.toString())
    await deleteDoc(docRef)
    return { success: true }
  },

  suspendUser: async (id: string | number) => {
    const docRef = doc(db, "users", id.toString())
    await updateDoc(docRef, { status: 'Suspended' })
    return { success: true }
  },

  activateUser: async (id: string | number) => {
    const docRef = doc(db, "users", id.toString())
    await updateDoc(docRef, { status: 'Active' })
    return { success: true }
  },

  deleteUser: async (id: string | number) => {
    const docRef = doc(db, "users", id.toString())
    await deleteDoc(docRef)
    return { success: true }
  }
}
