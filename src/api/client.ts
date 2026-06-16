import { isFirebaseConfigured } from '../firebase'
import type { Portfolio } from '../types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

// Initial mock data arrays to populate localStorage if running in offline mock mode
const DEFAULT_PORTFOLIOS: Portfolio[] = [
  {
    id: '1',
    name: 'Geist Minimal Portfolio',
    title: 'Geist Minimal Portfolio',
    author: 'Jane Doe',
    category: 'Minimal',
    views: 1250,
    downloads: 340,
    status: 'Active',
    techStack: 'React, TypeScript, TailwindCSS',
    description: 'A beautiful minimal portfolio designed for software engineers who love simple aesthetics.',
    thumbnailUrl: '',
    tags: ['React', 'TypeScript', 'TailwindCSS'],
    screenshots: [],
    features: ['Dark mode', 'SEO Optimized', 'Tailwind support'],
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    submittedAt: '2026-06-10T12:00:00Z',
    difficulty: 'Beginner'
  },
  {
    id: '2',
    name: 'Terminal CLI Portfolio',
    title: 'Terminal CLI Portfolio',
    author: 'John Smith',
    category: 'Developer',
    views: 890,
    downloads: 210,
    status: 'Active',
    techStack: 'TypeScript, Node.js, TailwindCSS',
    description: 'An interactive command-line style portfolio with directory navigation and a mock shell.',
    thumbnailUrl: '',
    tags: ['TypeScript', 'TailwindCSS', 'Node.js'],
    screenshots: [],
    features: ['Custom commands', 'Persistent sessions', 'Fast loading'],
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    submittedAt: '2026-06-11T14:30:00Z',
    difficulty: 'Intermediate'
  },
  {
    id: '3',
    name: 'ThreeJS 3D Showcase',
    title: 'ThreeJS 3D Showcase',
    author: 'Alice Johnson',
    category: '3D',
    views: 2450,
    downloads: 680,
    status: 'Active',
    techStack: 'Three.js, React, Framer Motion',
    description: 'A gorgeous 3D portfolio featuring interactive fluid simulations, custom models, and camera paths.',
    thumbnailUrl: '',
    tags: ['Three.js', 'React', 'Framer Motion'],
    screenshots: [],
    features: ['Interactive fluid sim', '3D model viewer', 'GPU physics'],
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    submittedAt: '2026-06-12T09:15:00Z',
    difficulty: 'Advanced'
  }
]

const DEFAULT_GUIDES = [
  { id: '1', name: 'Vercel Deploy Guide', provider: 'Vercel', time: '5 mins', difficulty: 'Beginner', status: 'Ready' },
  { id: '2', name: 'Docker & AWS ECS', provider: 'AWS', time: '20 mins', difficulty: 'Advanced', status: 'Ready' },
  { id: '3', name: 'GitHub Actions CI/CD', provider: 'GitHub', time: '10 mins', difficulty: 'Intermediate', status: 'Ready' }
]

function getStored<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue))
    return defaultValue
  }
  try {
    return JSON.parse(stored) as T
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// Client-side mock REST handler when no Firebase is configured
async function handleMockRequest(endpoint: string, method: string, body?: any, params?: any): Promise<any> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300))

  const path = endpoint.split('?')[0]

  // Portfolios: GET /portfolios
  if (path === '/portfolios' && method === 'GET') {
    let list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    if (params) {
      if (params.category && params.category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === String(params.category).toLowerCase())
      }
      if (params.search) {
        const query = String(params.search).toLowerCase()
        list = list.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.author.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        )
      }
    }
    return list
  }

  // Portfolios Templates: GET /portfolios/templates
  if (path === '/portfolios/templates' && method === 'GET') {
    return getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
  }

  // Guides: GET /guides
  if (path === '/guides' && method === 'GET') {
    return DEFAULT_GUIDES
  }

  // Creator Dashboard: GET /creator/dashboard
  if (path === '/creator/dashboard' && method === 'GET') {
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    // Return all portfolios for testing in mock mode so that the creator dashboard looks populated
    const totalViews = list.reduce((sum, p) => sum + (Number(p.views) || 0), 0)
    const totalDownloads = list.reduce((sum, p) => sum + (Number(p.downloads) || 0), 0)
    
    return {
      stats: {
        totalPortfolios: list.length,
        totalViews,
        totalDownloads,
        engagementRate: list.length > 0 ? '27%' : '0%'
      },
      portfolios: list,
      chartData: [
        { month: 'Jan', views: 400, downloads: 100 },
        { month: 'Feb', views: 800, downloads: 240 },
        { month: 'Mar', views: 1200, downloads: 350 },
        { month: 'Apr', views: 1500, downloads: 480 },
        { month: 'May', views: Math.floor(totalViews * 0.7), downloads: Math.floor(totalDownloads * 0.7) },
        { month: 'Jun', views: totalViews, downloads: totalDownloads }
      ]
    }
  }

  // Admin Dashboard: GET /admin/dashboard
  if (path === '/admin/dashboard' && method === 'GET') {
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    const users = getStored<any[]>('mock_users_list', [
      { id: '1', name: 'Admin User', email: 'admin@portifyhub.com', role: 'Admin', status: 'Active', createdAt: '2026-06-01T10:00:00Z', portfoliosCount: 1 },
      { id: '2', name: 'Jane Doe', email: 'jane@gmail.com', role: 'Creator', status: 'Active', createdAt: '2026-06-05T12:00:00Z', portfoliosCount: 2 },
      { id: '3', name: 'John Smith', email: 'john@gmail.com', role: 'User', status: 'Active', createdAt: '2026-06-10T15:30:00Z', portfoliosCount: 0 }
    ])
    
    return {
      stats: {
        totalUsers: users.length,
        totalCreators: users.filter(u => u.role === 'Creator').length,
        totalPortfolios: list.length,
        totalDownloads: list.reduce((sum, p) => sum + (Number(p.downloads) || 0), 0)
      },
      users,
      portfolios: list
    }
  }

  // Resume: GET /resumes/current
  if (path === '/resumes/current' && method === 'GET') {
    const defaultResume = {
      name: 'Google Test User',
      title: 'Full Stack Engineer',
      email: 'googletest@gmail.com',
      phone: '+1 (555) 019-2834',
      website: 'https://googletest.dev',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'PostgreSQL'],
      education: {
        school: 'Stanford University',
        degree: 'B.S. in Computer Science',
        year: '2022 - 2026',
        description: 'Relevant coursework: Distributed Systems, Database Systems, Web Applications.'
      },
      projects: [
        { title: 'PortifyHub Sandbox', role: 'Creator', description: 'A template platform built with React 19 and Bun.', tech: 'React, TS' }
      ],
      experiences: [
        { company: 'Vercel', position: 'Software Engineer Intern', duration: 'Summer 2025', description: 'Worked on next-generation rendering engines and frontend components.' }
      ],
      achievements: [
        { title: 'Stanford Hackathon Winner', date: 'Oct 2025', description: 'First place out of 200 participants.' }
      ],
      template: 'modern'
    }
    return getStored<any>('mock_resume', defaultResume)
  }

  // Save Resume: POST /resumes
  if (path === '/resumes' && method === 'POST') {
    setStored('mock_resume', body)
    return body
  }

  // Upload portfolio: POST /portfolios or POST /portfolios/upload
  if ((path === '/portfolios/upload' || path === '/portfolios') && method === 'POST') {
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    const gradients = [
      'from-blue-600 via-indigo-600 to-purple-600',
      'from-emerald-600 via-teal-600 to-cyan-600',
      'from-amber-600 via-orange-600 to-red-600',
      'from-pink-600 via-rose-600 to-red-600'
    ]
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]
    const tags = body.techStack ? body.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) : []

    const newPortfolio: Portfolio = {
      ...body,
      id: body.id || String(Date.now()),
      title: body.name || body.title || 'Untitled Portfolio',
      author: body.author || 'Creator',
      views: Number(body.views) || 0,
      downloads: Number(body.downloads) || 0,
      tags: tags.length > 0 ? tags : ['React'],
      gradient: randomGradient,
      status: body.status || 'Active',
      submittedAt: new Date().toISOString().split('T')[0]
    }
    list.push(newPortfolio)
    setStored('mock_portfolios', list)
    return newPortfolio
  }

  // Update portfolio: PUT /portfolios/:id
  if (path.startsWith('/portfolios/') && method === 'PUT') {
    const id = path.split('/')[2]
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    const index = list.findIndex(p => String(p.id) === String(id))
    if (index !== -1) {
      const tags = body.techStack ? body.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) : list[index].tags
      list[index] = { ...list[index], ...body, tags }
      setStored('mock_portfolios', list)
      return list[index]
    }
    throw new Error('Portfolio not found')
  }

  // Delete portfolio: DELETE /portfolios/:id
  if (path.startsWith('/portfolios/') && method === 'DELETE') {
    const id = path.split('/')[2]
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    const filtered = list.filter(p => String(p.id) !== String(id))
    setStored('mock_portfolios', filtered)
    return { success: true }
  }

  // Approve/Reject portfolio: PUT /admin/portfolios/:id/status
  if (path.startsWith('/admin/portfolios/') && path.endsWith('/status') && method === 'PUT') {
    const parts = path.split('/')
    const id = parts[3]
    const list = getStored<Portfolio[]>('mock_portfolios', DEFAULT_PORTFOLIOS)
    const index = list.findIndex(p => String(p.id) === String(id))
    if (index !== -1) {
      list[index].status = body.status
      setStored('mock_portfolios', list)
      return list[index]
    }
    throw new Error('Portfolio not found')
  }

  // Suspend/Activate/Delete user: PUT /admin/users/:id/suspend etc.
  if (path.startsWith('/admin/users/') && method === 'PUT') {
    const parts = path.split('/')
    const id = parts[3]
    const action = parts[4]
    const users = getStored<any[]>('mock_users_list', [])
    const index = users.findIndex(u => String(u.id) === String(id))
    if (index !== -1) {
      users[index].status = action === 'suspend' ? 'Suspended' : 'Active'
      setStored('mock_users_list', users)
      return users[index]
    }
    throw new Error('User not found')
  }

  // Delete user: DELETE /admin/users/:id
  if (path.startsWith('/admin/users/') && method === 'DELETE') {
    const id = path.split('/')[3]
    const users = getStored<any[]>('mock_users_list', [])
    const filtered = users.filter(u => String(u.id) !== String(id))
    setStored('mock_users_list', filtered)
    return { success: true }
  }

  return {}
}

class ApiClient {
  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options

    // Check if Firebase is configured; if not, route to client-side mock database
    if (!isFirebaseConfigured) {
      let bodyObj: any = undefined
      if (customConfig.body) {
        if (typeof customConfig.body === 'string') {
          try {
            bodyObj = JSON.parse(customConfig.body)
          } catch {
            bodyObj = customConfig.body
          }
        } else {
          bodyObj = customConfig.body
        }
      }
      return handleMockRequest(endpoint, customConfig.method || 'GET', bodyObj, params) as Promise<T>
    }
    
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      ...customConfig.headers as Record<string, string>,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (!(customConfig.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    let url = `${API_BASE_URL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    const config: RequestInit = {
      ...customConfig,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      if (response.status === 204) {
        return {} as T
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Fetch request failed [${url}]:`, error)
      throw error
    }
  }

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
  }

  postFormData<T>(endpoint: string, formData: FormData, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: formData })
  }

  put<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
