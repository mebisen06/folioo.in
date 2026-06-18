import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import type { AdminDashboardData } from '../types'

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await adminService.getDashboardData()
      setData(res)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const executeAction = async (actionFn: () => Promise<any>, updateFn: (prev: AdminDashboardData) => AdminDashboardData) => {
    try {
      await actionFn()
      if (data) setData(updateFn(data))
    } catch (err) {
      console.error('Admin action failed', err)
      throw err
    }
  }

  const approvePortfolio = (id: string | number) => 
    executeAction(() => adminService.approvePortfolio(id), prev => ({
      ...prev, portfolios: prev.portfolios.map(p => p.id === id ? { ...p, status: 'Approved' } : p)
    }))

  const rejectPortfolio = (id: string | number) => 
    executeAction(() => adminService.rejectPortfolio(id), prev => ({
      ...prev, portfolios: prev.portfolios.map(p => p.id === id ? { ...p, status: 'Rejected' } : p)
    }))

  const deletePortfolio = (id: string | number) => 
    executeAction(() => adminService.deletePortfolio(id), prev => ({
      ...prev,
      portfolios: prev.portfolios.filter(p => p.id !== id),
      stats: {
        ...prev.stats,
        totalPortfolios: Math.max(0, prev.stats.totalPortfolios - 1)
      }
    }))

  const suspendUser = (id: string | number) => 
    executeAction(() => adminService.suspendUser(id), prev => ({
      ...prev, users: prev.users.map(u => u.id === id ? { ...u, status: 'Suspended' } : u)
    }))

  const activateUser = (id: string | number) => 
    executeAction(() => adminService.activateUser(id), prev => ({
      ...prev, users: prev.users.map(u => u.id === id ? { ...u, status: 'Active' } : u)
    }))

  const deleteUser = (id: string | number) => 
    executeAction(() => adminService.deleteUser(id), prev => {
      const userToDelete = prev.users.find(u => u.id === id)
      const isCreator = userToDelete?.role === 'Creator'
      return {
        ...prev,
        users: prev.users.filter(u => u.id !== id),
        stats: {
          ...prev.stats,
          totalUsers: Math.max(0, prev.stats.totalUsers - 1),
          totalCreators: isCreator ? Math.max(0, prev.stats.totalCreators - 1) : prev.stats.totalCreators
        }
      }
    })

  return { 
    data, loading, error, refetch: fetchData, 
    approvePortfolio, rejectPortfolio, deletePortfolio, 
    suspendUser, activateUser, deleteUser 
  }
}
