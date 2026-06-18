import { useState, useEffect } from 'react'
import { creatorService } from '../services/creatorService'
import { portfolioService } from '../services/portfolioService'
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
      if (data) {
        const target = data.portfolios.find(p => p.id === id)
        setData({
          ...data,
          portfolios: data.portfolios.filter((p) => p.id !== id),
          stats: {
            ...data.stats,
            totalPortfolios: Math.max(0, Number(data.stats.totalPortfolios) - 1),
            totalViews: Math.max(0, Number(data.stats.totalViews) - (Number(target?.views) || 0)),
            totalDownloads: Math.max(0, Number(data.stats.totalDownloads) - (Number(target?.downloads) || 0))
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to delete portfolio', err)
      throw err
    }
  }

  const createPortfolio = async (portfolio: any) => {
    try {
      const created = await portfolioService.create({
        title: portfolio.title || portfolio.name,
        author: portfolio.author || 'Creator',
        category: portfolio.category,
        techStack: portfolio.techStack,
        description: portfolio.description,
        tags: portfolio.tags || [],
        difficulty: portfolio.difficulty || 'Beginner'
      })
      if (data) {
        // Build returned mock response from service call.
        // If the service doesn't return full views/downloads, default to 0
        const newItem = {
          ...created,
          name: created.title || created.name || portfolio.name || portfolio.title,
          views: created.views !== undefined ? created.views : 0,
          downloads: created.downloads !== undefined ? created.downloads : 0,
          status: created.status || 'Active',
          techStack: created.techStack || portfolio.techStack || '',
          description: created.description || portfolio.description || ''
        }
        setData({
          ...data,
          portfolios: [newItem, ...data.portfolios],
          stats: {
            ...data.stats,
            totalPortfolios: Number(data.stats.totalPortfolios) + 1
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to create portfolio', err)
      throw err
    }
  }

  const updatePortfolio = async (id: string | number, updates: any) => {
    try {
      await creatorService.updatePortfolio(id, updates)
      if (data) {
        const target = data.portfolios.find(p => p.id === id)
        const oldViews = Number(target?.views) || 0
        const oldDownloads = Number(target?.downloads) || 0
        const newViews = Number(updates.views) !== undefined ? Number(updates.views) : oldViews
        const newDownloads = Number(updates.downloads) !== undefined ? Number(updates.downloads) : oldDownloads
        
        setData({
          ...data,
          portfolios: data.portfolios.map(p => p.id === id ? { ...p, ...updates, name: updates.name || updates.title || p.name } : p),
          stats: {
            ...data.stats,
            totalViews: Math.max(0, Number(data.stats.totalViews) - oldViews + newViews),
            totalDownloads: Math.max(0, Number(data.stats.totalDownloads) - oldDownloads + newDownloads)
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to update portfolio', err)
      throw err
    }
  }

  return { data, loading, error, refetch: fetchData, deletePortfolio, createPortfolio, updatePortfolio }
}
