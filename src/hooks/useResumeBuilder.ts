import { useState, useEffect } from 'react'
import { resumeService } from '../services/resumeService'
import type { ResumeData } from '../types'

export function useResumeBuilder(resumeId?: string) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResume = async () => {
    if (!resumeId) return
    try {
      setLoading(true)
      const data = await resumeService.getResume(resumeId)
      setResumeData(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load resume data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resumeId) {
      fetchResume()
    }
  }, [resumeId])

  const saveResume = async (data: ResumeData) => {
    try {
      setLoading(true)
      let savedData
      if (resumeId) {
        savedData = await resumeService.updateResume(resumeId, data)
      } else {
        savedData = await resumeService.saveResume(data)
      }
      setResumeData(savedData)
      setError(null)
      return savedData
    } catch (err) {
      console.error(err)
      setError('Failed to save resume.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    resumeData,
    loading,
    error,
    saveResume,
    setResumeData
  }
}
