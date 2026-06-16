import { apiClient } from '../api/client'
import type { ResumeData } from '../types'

export const resumeService = {
  getResume: async (id: string): Promise<ResumeData> => {
    return apiClient.get<ResumeData>(`/resumes/${id === 'current' ? 'current' : id}`)
  },
  
  saveResume: async (resumeData: ResumeData): Promise<ResumeData> => {
    return apiClient.post<ResumeData>('/resumes', resumeData)
  },
  
  updateResume: async (_id: string, resumeData: Partial<ResumeData>): Promise<ResumeData> => {
    // According to contract, saving/updating is handled by POST /resumes
    return apiClient.post<ResumeData>('/resumes', resumeData)
  }
}
