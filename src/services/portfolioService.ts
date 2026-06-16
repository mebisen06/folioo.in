import { apiClient } from '../api/client'
import type { Portfolio, TemplateDiscoveryItem, DeploymentGuide } from '../types'

export const portfolioService = {
  getAll: (params?: { category?: string; search?: string }) => {
    return apiClient.get<Portfolio[]>('/portfolios', { params })
  },
  
  getById: (id: string | number) => {
    return apiClient.get<Portfolio>(`/portfolios/${id}`)
  },

  getTemplates: () => {
    return apiClient.get<TemplateDiscoveryItem[]>('/portfolios/templates')
  },

  getDeploymentGuides: () => {
    return apiClient.get<DeploymentGuide[]>('/guides')
  },

  create: (data: Partial<Portfolio>) => {
    return apiClient.post<Portfolio>('/portfolios', data)
  },

  update: (id: string | number, data: Partial<Portfolio>) => {
    return apiClient.put<Portfolio>(`/portfolios/${id}`, data)
  },

  delete: (id: string | number) => {
    return apiClient.delete<{ success: boolean }>(`/portfolios/${id}`)
  },

  uploadPortfolioWithAssets: (portfolioData: any, thumbnail?: File, screenshots?: File[], sourceFile?: File) => {
    const formData = new FormData()
    formData.append('portfolioData', JSON.stringify(portfolioData))
    
    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }
    
    if (screenshots && screenshots.length > 0) {
      screenshots.forEach((file) => {
        formData.append('screenshots', file)
      })
    }
    
    if (sourceFile) {
      formData.append('sourceFile', sourceFile)
    }

    return apiClient.postFormData<Portfolio>('/portfolios/upload', formData)
  }
}
