import { useState, useEffect } from 'react'
import { portfolioService } from '../services/portfolioService'
import type { Portfolio, TemplateDiscoveryItem, DeploymentGuide } from '../types'

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      const data = await portfolioService.getAll()
      setPortfolios(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolios()
  }, [])

  return { portfolios, loading, error, refetch: fetchPortfolios }
}

export function usePortfolio(id: string | number | null) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    const fetchPortfolio = async () => {
      try {
        setLoading(true)
        const data = await portfolioService.getById(id)
        setPortfolio(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch portfolio')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [id])

  return { portfolio, loading, error }
}

export function useTemplatesAndGuides() {
  const [templates, setTemplates] = useState<TemplateDiscoveryItem[]>([])
  const [guides, setGuides] = useState<DeploymentGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [templatesData, guidesData] = await Promise.all([
          portfolioService.getTemplates(),
          portfolioService.getDeploymentGuides()
        ])
        setTemplates(templatesData)
        setGuides(guidesData)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch templates or guides')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { templates, guides, loading, error }
}
