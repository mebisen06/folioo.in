import * as React from 'react'
import { 
  FileText, 
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  Shield,
  LogOut,
  User
} from 'lucide-react'
import LandingPage from './components/LandingPage'
import PortfolioGallery from './components/PortfolioGallery'
import PortfolioDetails from './components/PortfolioDetails'
import ResumeBuilder from './components/ResumeBuilder'
import CreatorDashboard from './components/CreatorDashboard'
import PortfolioUpload from './components/PortfolioUpload'
import AdminDashboard from './components/AdminDashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import UserProfile from './components/UserProfile'

// Import our custom UI components
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'

// Hooks
import { usePortfolios } from './hooks/usePortfolios'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { currentUser, logout, loading } = useAuth()
  
  // Custom Pathname Routing State
  const [path, setPath] = React.useState(window.location.pathname)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false)

  // Sync state with back/forward history events
  React.useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
  }

  // Redirect /dashboard to appropriate workspace on login
  React.useEffect(() => {
    if (loading || !currentUser) return
    if (path === '/dashboard') {
      if (currentUser.role === 'Admin') {
        navigate('/admin')
      } else if (currentUser.role === 'Creator') {
        navigate('/creator')
      } else {
        navigate('/resume-builder')
      }
    }
  }, [currentUser, path, loading])

  // Route protection rules (RBAC & Auth)
  React.useEffect(() => {
    if (loading) return

    const publicPaths = ['/', '/login', '/signup']
    const isPublicPath = publicPaths.includes(path)

    if (!currentUser && !isPublicPath) {
      navigate('/login')
    } else if (currentUser) {
      if (path === '/login' || path === '/signup') {
        navigate('/')
      }
      if (path === '/admin' && currentUser.role !== 'Admin') {
        navigate('/')
      }
    }
  }, [currentUser, path, loading])

  // Derive active menu highlight from pathname
  const getActiveMenuFromPath = (pathname: string): string => {
    if (pathname === '/admin') return 'admin-dashboard'
    if (pathname === '/creator') return 'creator-dashboard'
    if (pathname === '/upload') return 'upload-portfolio'
    if (pathname === '/resume-builder') return 'builder'
    if (pathname === '/profile') return 'profile'
    return ''
  }

  const activeMenu = getActiveMenuFromPath(path)

  const { portfolios } = usePortfolios()

  // Sidebar Menu Config
  const menuGroups = [
    {
      title: 'Core Platform',
      items: [
        { id: 'creator-dashboard', label: 'Creator Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'builder', label: 'Resume Builder', icon: <FileText className="w-4 h-4" /> },
        { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'admin-dashboard', label: 'Admin Console', icon: <Shield className="w-4 h-4" /> },
      ]
    }
  ]

  const filteredMenuGroups = menuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.id === 'admin-dashboard') {
        return currentUser?.role === 'Admin'
      }
      if (item.id === 'creator-dashboard') {
        return currentUser?.role === 'Creator' || currentUser?.role === 'Admin'
      }
      return true
    })
  })).filter((group) => group.items.length > 0)

  // Render Public pages or redirect spinners
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (path === '/') {
    return (
      <LandingPage
        onNavigate={(viewId) => {
          if (viewId === 'gallery') {
            navigate('/portfolio')
          } else if (viewId === 'creator-dashboard') {
            navigate('/creator')
          } else if (viewId === 'builder') {
            navigate('/resume-builder')
          } else if (viewId === 'login') {
            navigate('/login')
          } else if (viewId === 'signup') {
            navigate('/signup')
          } else {
            navigate('/dashboard')
          }
        }}
      />
    )
  }

  if (path === '/login') {
    return <Login onNavigate={(viewId) => navigate(viewId === 'signup' ? '/signup' : '/')} onSuccess={() => navigate('/dashboard')} />
  }

  if (path === '/signup') {
    return <Signup onNavigate={(viewId) => navigate(viewId === 'login' ? '/login' : '/')} onSuccess={() => navigate('/dashboard')} />
  }

  if (path === '/portfolio') {
    return (
      <PortfolioGallery
        onNavigate={(viewId, portfolioId) => {
          if (viewId === 'landing') {
            navigate('/')
          } else if (viewId === 'details' && portfolioId) {
            navigate(`/portfolio/${portfolioId}`)
          } else {
            navigate('/dashboard')
          }
        }}
      />
    )
  }

  if (path.startsWith('/portfolio/')) {
    const portfolioId = path.split('/')[2]
    const portfolio = portfolios.find(item => String(item.id) === String(portfolioId))
    if (portfolio) {
      return (
        <PortfolioDetails
          portfolio={portfolio}
          onNavigate={(viewId, portfolioId) => {
            if (viewId === 'landing') {
              navigate('/')
            } else if (viewId === 'gallery') {
              navigate('/portfolio')
            } else if (viewId === 'details' && portfolioId) {
              navigate(`/portfolio/${portfolioId}`)
            } else {
              navigate('/dashboard')
            }
          }}
        />
      )
    } else {
      return (
        <div className="min-h-screen bg-background text-primary-text flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Portfolio Not Found</h2>
          <p className="text-zinc-500 text-sm max-w-sm text-center">The portfolio you are looking for does not exist or has been removed.</p>
          <Button variant="glow" onClick={() => navigate('/portfolio')} className="mt-4">
            Back to Gallery
          </Button>
        </div>
      )
    }
  }

  // Handle fallback redirects for unknown paths
  const dashboardPaths = ['/dashboard', '/admin', '/creator', '/upload', '/resume-builder', '/profile']
  if (!dashboardPaths.includes(path)) {
    // Redirect to home if path not found
    setTimeout(() => navigate('/'), 0)
    return null
  }

  return (
    <div className="min-h-screen flex bg-background text-primary-text relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-surface/80 backdrop-blur-md z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">F</div>
          <span className="font-bold tracking-tight text-base">Folioo</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 z-50 lg:z-10
        w-64 h-screen border-r border-border bg-background lg:bg-background/80 lg:backdrop-blur-md
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-16 lg:pt-0 flex flex-col justify-between
      `}>
        <div className="p-6">
          {/* Back button link to main landing site */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer border border-border/60 bg-surface mb-5 text-left shadow-[0_1px_0_rgba(255,255,255,0.03)]"
          >
            <span>←</span> Back to Homepage
          </button>

          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow text-lg">F</div>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-tight leading-tight">Folioo</span>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Creator Platform</span>
            </div>
          </div>

          <nav className="space-y-6 text-left">
            {filteredMenuGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-600 tracking-wider uppercase px-3">
                  {group.title}
                </span>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeMenu === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          const pathMap: Record<string, string> = {
                            'admin-dashboard': '/admin',
                            'creator-dashboard': '/creator',
                            'upload-portfolio': '/upload',
                            builder: '/resume-builder',
                            profile: '/profile'
                          }
                          navigate(pathMap[item.id] || '/dashboard')
                          setMobileMenuOpen(false)
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
                          ${isActive 
                            ? 'bg-surface text-primary-text border-l-2 border-accent shadow-[0_1px_0_rgba(255,255,255,0.05)]' 
                            : 'text-zinc-400 hover:text-primary-text hover:bg-surface/50 border-l-2 border-transparent'}
                        `}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-border/40 space-y-4">
          {currentUser && (
            <div className="flex items-center justify-between gap-2.5 bg-surface/50 p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" onClick={() => navigate('/profile')}>
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-bold text-white truncate leading-none mb-1">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate leading-none capitalize">{currentUser.role}</div>
                </div>
              </div>
              <button onClick={logout} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <Card variant="glass" className="p-4 border-accent/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span className="text-xs font-bold text-primary-text">Vercel & Linear Style</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed text-left">
              Designed with flat minimalist layout, fine borders, soft glows, and crisp typography.
            </p>
          </Card>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-20 lg:pt-8 px-4 sm:px-8 lg:px-12 pb-16 overflow-y-auto">
        
        {/* Admin Dashboard */}
        {activeMenu === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {/* Creator Dashboard */}
        {activeMenu === 'creator-dashboard' && (
          <CreatorDashboard />
        )}

        {/* Portfolio Upload */}
        {activeMenu === 'upload-portfolio' && (
          <PortfolioUpload />
        )}

        {/* Resume Builder */}
        {activeMenu === 'builder' && (
          <ResumeBuilder />
        )}

        {/* User Profile */}
        {activeMenu === 'profile' && (
          <UserProfile />
        )}

      </main>

    </div>
  )
}
