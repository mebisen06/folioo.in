import { apiClient } from '../api/client'
import type { AdminDashboardData } from '../types'

export const adminService = {
  getDashboardData: () => {
    return apiClient.get<AdminDashboardData>('/admin/dashboard')
  },
  
  approvePortfolio: (id: string | number) => {
    return apiClient.put<{ success: boolean }>(`/admin/portfolios/${id}/status`, { status: 'Approved' })
  },

  rejectPortfolio: (id: string | number) => {
    return apiClient.put<{ success: boolean }>(`/admin/portfolios/${id}/status`, { status: 'Rejected' })
  },

  deletePortfolio: (id: string | number) => {
    return apiClient.delete<{ success: boolean }>(`/admin/portfolios/${id}`)
  },

  suspendUser: (id: string | number) => {
    return apiClient.put<{ success: boolean }>(`/admin/users/${id}/suspend`, {})
  },

  activateUser: (id: string | number) => {
    return apiClient.put<{ success: boolean }>(`/admin/users/${id}/activate`, {})
  },

  deleteUser: (id: string | number) => {
    return apiClient.delete<{ success: boolean }>(`/admin/users/${id}`)
  }
}
