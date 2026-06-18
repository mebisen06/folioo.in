import { db, auth } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { portfolioService } from './portfolioService'
import type { CreatorDashboardData, Portfolio } from '../types'

export const creatorService = {
  getDashboardData: async (): Promise<CreatorDashboardData> => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      throw new Error("User must be logged in to access dashboard data.")
    }

    const q = query(collection(db, "portfolios"), where("creator_id", "==", uid))
    const querySnapshot = await getDocs(q)
    
    const portfolios: Portfolio[] = []
    querySnapshot.forEach((doc) => {
      portfolios.push(doc.data() as Portfolio)
    })

    const totalViews = portfolios.reduce((sum, p) => sum + (Number(p.views) || 0), 0)
    const totalDownloads = portfolios.reduce((sum, p) => sum + (Number(p.downloads) || 0), 0)

    return {
      stats: {
        totalPortfolios: portfolios.length,
        totalViews: totalViews,
        totalDownloads: totalDownloads,
        engagementRate: portfolios.length > 0 ? "27%" : "0%"
      },
      chartData: [
        { name: "Jan", downloads: 40, views: 120 },
        { name: "Feb", downloads: 80, views: 240 },
        { name: "Mar", downloads: 120, views: 360 },
        { name: "Apr", downloads: 150, views: 480 },
        { name: "May", downloads: Math.floor(totalDownloads * 0.7), views: Math.floor(totalViews * 0.7) },
        { name: "Jun", downloads: totalDownloads, views: totalViews }
      ],
      portfolios: portfolios
    }
  },
  
  deletePortfolio: async (id: string | number) => {
    return portfolioService.delete(id)
  },

  updatePortfolio: async (id: string | number, data: Partial<Portfolio>) => {
    return portfolioService.update(id, data)
  }
}
