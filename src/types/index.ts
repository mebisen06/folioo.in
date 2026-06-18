// User & Roles
export type Role = 'User' | 'Creator' | 'Admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  joinedAt: string
  status: 'Active' | 'Suspended'
  portfoliosCount: number
}

// Portfolios
export type PortfolioStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Review' | 'Draft'

export interface Portfolio {
  id: number | string
  title: string
  name?: string // Aliased for AdminDashboard / CreatorDashboard
  author: string
  category: string
  description: string
  views: string | number
  downloads: string | number
  likes?: number
  thumbnailUrl: string
  demoUrl?: string
  githubUrl?: string
  tags: string[]
  screenshots: string[]
  features: string[]
  status?: PortfolioStatus
  submittedAt?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  gradient?: string
  techStack?: string
  stars?: number
  creator_id?: string
}

// Analytics / Dashboard Metrics
export interface Trend {
  value: string
  direction: 'up' | 'down' | 'neutral'
}

export interface ChartDataPoint {
  name: string
  downloads: number
  views: number
}

export interface CreatorDashboardData {
  stats: {
    totalPortfolios: number | string
    totalViews: number | string
    totalDownloads: number | string
    engagementRate: string
  }
  chartData: ChartDataPoint[]
  portfolios: Portfolio[]
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number
    totalCreators: number
    totalPortfolios: number
    totalDownloads: number
  }
  users: User[]
  portfolios: Portfolio[]
}

export interface TemplateDiscoveryItem {
  id: number | string
  title: string
  category: string
  rating: string
  views: string
  author: string
  badge: string
}

export interface DeploymentGuide {
  id: string
  name: string
  provider: string
  time: string
  status: 'Ready' | 'In Review' | 'Outdated' | 'Error'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

// Resume Builder
export interface Project {
  title: string
  role: string
  description: string
  tech: string
}

export interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

export interface Achievement {
  title: string
  date: string
  description: string
}

export interface ResumeData {
  id?: string
  name: string
  title: string
  email: string
  phone: string
  website: string
  skills: string[]
  education: {
    school: string
    degree: string
    year: string
    description: string
  }
  projects: Project[]
  experiences: Experience[]
  achievements: Achievement[]
  template: 'ats' | 'modern' | 'student' | 'cyber'
}
