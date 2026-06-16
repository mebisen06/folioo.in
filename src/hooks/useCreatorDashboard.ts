import { useState, useEffect } from 'react'
import { creatorService } from '../services/creatorService'
import type { CreatorDashboardData } from '../types'

export function useCreatorDashboard() {
  const [data, setData] = useState<CreatorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await creatorService.getDashboardData()
      setData(res)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load creator dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const deletePortfolio = async (id: string | number) => {
    try {
      await creatorService.deletePortfolio(id)
      // Optimistic update or refetch
      if (data) {
        setData({
          ...data,
          portfolios: data.portfolios.filter((p) => p.id !== id)
        })
      }
    } catch (err: any) {
      console.error('Failed to delete portfolio', err)
      throw err
    }
  }

  const createPortfolio = async (portfolio: any) => {
    // Optimistic update
    if (data) {
      setData({
        ...data,
        portfolios: [...data.portfolios, portfolio]
      })
    }
    // API call can go here if needed: await creatorService.createPortfolio(portfolio)
  }

  const updatePortfolio = async (id: string | number, updates: any) => {
    try {
      await creatorService.updatePortfolio(id, updates)
      if (data) {
        setData({
          ...data,
          portfolios: data.portfolios.map(p => p.id === id ? { ...p, ...updates } : p)
        })
      }
    } catch (err: any) {
      console.error('Failed to update portfolio', err)
      throw err
    }
  }

  return { data, loading, error, refetch: fetchData, deletePortfolio, createPortfolio, updatePortfolio }
}
