import { apiClient } from '../api/client'
import type { CreatorDashboardData, Portfolio } from '../types'

export const creatorService = {
  getDashboardData: () => {
    return apiClient.get<CreatorDashboardData>('/creator/dashboard')
  },
  
  deletePortfolio: (id: string | number) => {
    return apiClient.delete<{ success: boolean }>(`/portfolios/${id}`)
  },

  updatePortfolio: (id: string | number, data: Partial<Portfolio>) => {
    return apiClient.put<Portfolio>(`/portfolios/${id}`, data)
  }
}
