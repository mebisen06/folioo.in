import * as React from 'react'
import { 
  Compass, 
  FileText, 
  BookOpen, 
  Palette, 
  Terminal, 
  ChevronRight, 
  Copy, 
  Check, 
  Layers, 
  Sparkles,
  Laptop,
  Code,
  LayoutDashboard,
  Menu,
  X,
  Info,
  UploadCloud,
  Shield,
  LogOut
} from 'lucide-react'
import { cn } from './utils/cn'
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
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/Card'
import { Input } from './components/ui/Input'
import { SearchBar } from './components/ui/SearchBar'
import { Badge } from './components/ui/Badge'
import { Tabs } from './components/ui/Tabs'
import { Modal, ModalFooter } from './components/ui/Modal'
import { Table } from './components/ui/Table'
import { DashboardCard } from './components/ui/DashboardCard'

// Import code snippets
import { codeSnippets } from './components/showcase/codeSnippets'

// Hooks
import { useTemplatesAndGuides, usePortfolios } from './hooks/usePortfolios'
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

  // Route protection rules (RBAC & Auth)
  React.useEffect(() => {
    if (loading) return

    const publicPaths = ['/', '/login', '/signup', '/portfolio']
    const isPublicPath = publicPaths.includes(path) || path.startsWith('/portfolio/')

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
    if (pathname === '/dashboard') return 'introduction'
    if (pathname === '/tokens') return 'tokens'
    if (pathname === '/components') return 'components'
    if (pathname === '/admin') return 'admin-dashboard'
    if (pathname === '/creator') return 'creator-dashboard'
    if (pathname === '/upload') return 'upload-portfolio'
    if (pathname === '/discover') return 'discover'
    if (pathname === '/resume-history') return 'builder'
    if (pathname === '/guides') return 'guides'
    if (pathname === '/profile') return 'profile'
    return 'introduction'
  }

  const activeMenu = getActiveMenuFromPath(path)

  // Component Playground State
  const [activePlaygroundComponent, setActivePlaygroundComponent] = React.useState<keyof typeof codeSnippets>('Button')
  const [copiedSnippet, setCopiedSnippet] = React.useState<boolean>(false)
  
  // Custom states for interactive playground widgets
  const [btnVariant, setBtnVariant] = React.useState<'primary' | 'secondary' | 'outline' | 'ghost' | 'glow'>('glow')
  const [btnSize, setBtnSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [btnLoading, setBtnLoading] = React.useState<boolean>(false)
  const [cardVariant, setCardVariant] = React.useState<'default' | 'glass' | 'accent'>('default')
  const [cardInteractive, setCardInteractive] = React.useState<boolean>(true)
  const [cardGlow, setCardGlow] = React.useState<boolean>(true)
  const [inpError, setInpError] = React.useState<string>('')
  const [inpValue, setInpValue] = React.useState<string>('Jane Doe')
  const [searchVal, setSearchVal] = React.useState<string>('')
  const [badgeVariant, setBadgeVariant] = React.useState<'default' | 'success' | 'warning' | 'error' | 'info' | 'accent'>('accent')
  const [badgeDot, setBadgeDot] = React.useState<boolean>(true)
  const [demoTab, setDemoTab] = React.useState<string>('all')
  const [isPlaygroundModalOpen, setIsPlaygroundModalOpen] = React.useState<boolean>(false)

  // Template Discovery States
  const [templateFilter, setTemplateFilter] = React.useState<string>('all')
  const [templateSearch, setTemplateSearch] = React.useState<string>('')

  const { templates, guides: deploymentGuides } = useTemplatesAndGuides()
  const { portfolios } = usePortfolios()

  // Toast / Copy helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  // Sidebar Menu Config
  const menuGroups = [
    {
      title: 'Documentation',
      items: [
        { id: 'introduction', label: 'Getting Started', icon: <Compass className="w-4 h-4" /> },
        { id: 'tokens', label: 'Design Tokens', icon: <Palette className="w-4 h-4" /> },
      ]
    },
    {
      title: 'UI Components',
      items: [
        { id: 'components', label: 'Component Library', icon: <Layers className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Interactive Mockups',
      items: [
        { id: 'admin-dashboard', label: 'Admin Console', icon: <Shield className="w-4 h-4" /> },
        { id: 'creator-dashboard', label: 'Creator Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'upload-portfolio', label: 'Upload Portfolio', icon: <UploadCloud className="w-4 h-4" /> },
        { id: 'discover', label: 'Template Discovery', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'builder', label: 'Resume Builder', icon: <FileText className="w-4 h-4" /> },
        { id: 'guides', label: 'Guides & Deployment', icon: <Terminal className="w-4 h-4" /> },
      ]
    }
  ]

  const filteredMenuGroups = menuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.id === 'admin-dashboard') {
        return currentUser?.role === 'Admin'
      }
      if (item.id === 'creator-dashboard' || item.id === 'upload-portfolio') {
        return currentUser?.role === 'Creator' || currentUser?.role === 'Admin'
      }
      return true
    })
  })).filter((group) => group.items.length > 0)



  // Columns for table
  const guideColumns = [
    { header: 'Guide / Task', accessor: (row: any) => (
      <div className="flex flex-col">
        <span className="font-semibold text-primary-text">{row.name}</span>
        <span className="text-xs text-zinc-500 mt-0.5">{row.provider}</span>
      </div>
    )},
    { header: 'Setup Time', accessor: 'time' as any },
    { header: 'Difficulty', accessor: (row: any) => (
      <Badge variant={row.difficulty === 'Beginner' ? 'success' : row.difficulty === 'Intermediate' ? 'info' : 'warning'}>
        {row.difficulty}
      </Badge>
    )},
    { header: 'Status', accessor: (row: any) => (
      <Badge variant={row.status === 'Ready' ? 'success' : row.status === 'In Review' ? 'warning' : 'error'} dot>
        {row.status}
      </Badge>
    )},
    { header: 'Actions', accessor: (row: any) => (
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); alert(`Starting setup for: ${row.name}`) }}>
        Launch
      </Button>
    )}
  ]

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
            navigate('/resume-history')
          } else if (viewId === 'components') {
            navigate('/components')
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
    return <Login onNavigate={(viewId) => navigate(viewId === 'signup' ? '/signup' : '/')} onSuccess={() => navigate('/')} />
  }

  if (path === '/signup') {
    return <Signup onNavigate={(viewId) => navigate(viewId === 'login' ? '/login' : '/')} onSuccess={() => navigate('/')} />
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
  const dashboardPaths = ['/dashboard', '/tokens', '/components', '/admin', '/creator', '/upload', '/discover', '/resume-history', '/guides', '/profile']
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
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">P</div>
          <span className="font-bold tracking-tight text-base">PortifyHub <span className="text-zinc-500 font-normal">DS</span></span>
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
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow text-lg">P</div>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-tight leading-tight">PortifyHub</span>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Design System v1.0</span>
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
                            introduction: '/dashboard',
                            tokens: '/tokens',
                            components: '/components',
                            'admin-dashboard': '/admin',
                            'creator-dashboard': '/creator',
                            'upload-portfolio': '/upload',
                            discover: '/discover',
                            builder: '/resume-history',
                            guides: '/guides'
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
        
        {/* Getting Started Page */}
        {activeMenu === 'introduction' && (
          <div className="max-w-4xl space-y-10 text-left">
            <div className="space-y-3">
              <Badge variant="accent" dot>SaaS Platform Design System</Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                PortifyHub Design System
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl">
                A premium, Vercel-inspired, developer-focused design system crafted to help students build beautiful portfolios, design resumes, and master cloud deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Card interactive glow variant="glass" className="p-6">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-accent" /> Developer-Focused Aesthetics
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Clean coding interfaces, strict border outlines, flat panels, clear spacing scales, and subtle animations build trust with developer audiences.
                </p>
              </Card>

              <Card interactive glow variant="glass" className="p-6">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" /> Framer Motion Integration
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every interaction is fine-tuned with spring animations, physical scales on hover, layout position interpolation, and smooth modal fade ins.
                </p>
              </Card>
            </div>

            <hr className="border-border/60" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" /> Recommended Folder Structure
              </h2>
              <p className="text-xs text-zinc-400">
                Organize components inside a React & Tailwind framework to support reuse, modular testing, and clear separation of concerns.
              </p>
              
              <div className="bg-surface/50 border border-border rounded-lg p-5 font-mono text-xs text-zinc-300 space-y-1 overflow-x-auto">
                <div className="text-zinc-500">// Directory Tree structure</div>
                <div>src/</div>
                <div>├── <span className="text-accent">components/</span></div>
                <div>│   ├── <span className="text-emerald-400">ui/</span>           <span className="text-zinc-500">// Atomic UI Component Library</span></div>
                <div>│   │   ├── Button.tsx</div>
                <div>│   │   ├── Card.tsx</div>
                <div>│   │   ├── Input.tsx</div>
                <div>│   │   └── ...</div>
                <div>│   ├── <span className="text-yellow-400">showcase/</span>     <span className="text-zinc-500">// Documentation templates & playground</span></div>
                <div>│   └── <span className="text-sky-400">layout/</span>       <span className="text-zinc-500">// Header, Sidebar, Wrapper layouts</span></div>
                <div>├── <span className="text-accent">hooks/</span>            <span className="text-zinc-500">// Custom hooks (useMediaQuery, useKeyboard)</span></div>
                <div>├── <span className="text-accent">utils/</span>            <span className="text-zinc-500">// Utility helper files</span></div>
                <div>│   └── cn.ts          <span className="text-zinc-500">// Intelligent class merger</span></div>
                <div>├── <span className="text-accent">index.css</span>          <span className="text-zinc-500">// Tailwind imports, font setup, root CSS variables</span></div>
                <div>└── <span className="text-accent">main.tsx</span>           <span className="text-zinc-500">// Application entrypoint</span></div>
              </div>
            </div>

            <hr className="border-border/60" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-accent" /> Tailwind Styling Conventions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent">1. Strict Colors</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Always use the semantic color design tokens: <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">bg-background</code> (#0A0A0A), <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">bg-surface</code> (#111111), and <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">border-border</code> (#1F1F1F).
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent">2. Elegant Borders</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Borders must feel fine and subtle. Avoid thick borders; use <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">border-border/50</code> or transparency ratios with hover outlines.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent">3. Interactive Scale</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Interactive components should scale up slightly (e.g. <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">hover:scale-[1.01]</code>) and transition with cubic-beziers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Tokens Page */}
        {activeMenu === 'tokens' && (
          <div className="max-w-4xl space-y-10 text-left">
            <div className="space-y-3">
              <Badge variant="accent">Design Specification</Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Design Tokens
              </h1>
              <p className="text-sm text-zinc-400">
                These design tokens form the visual language of PortifyHub. Consistent application ensures a premium, high-integrity dashboard experience.
              </p>
            </div>

            <hr className="border-border/60" />

            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Color Palette</h3>
              <p className="text-xs text-zinc-400">
                Our palette is highly restricted to reflect developer focus, with strong contrast, dark layouts, and a single accent core color.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Background', hex: '#0A0A0A', desc: 'Main app workspace backing color', cls: 'bg-background border border-zinc-800' },
                  { name: 'Surface', hex: '#111111', desc: 'Cards, Modals, Sidebar panel backgrounds', cls: 'bg-surface border border-zinc-800' },
                  { name: 'Border', hex: '#1F1F1F', desc: 'Divider lines and bounding border structures', cls: 'bg-[#1F1F1F] border border-zinc-700/50' },
                  { name: 'Primary Text', hex: '#FFFFFF', desc: 'Active headers and direct body texts', cls: 'bg-white text-black flex items-center justify-center font-bold' },
                  { name: 'Secondary Text', hex: '#A1A1AA', desc: 'Muted text (Zinc-400) for guidelines/details', cls: 'bg-zinc-400 text-black flex items-center justify-center font-bold' },
                  { name: 'Accent Blue', hex: '#3B82F6', desc: 'Highlights, focus states, badge indicators', cls: 'bg-[#3B82F6] text-white shadow-glow' },
                ].map((color, idx) => (
                  <Card key={idx} className="p-4 border-border/80 flex flex-col gap-3">
                    <div className={cn("w-full h-12 rounded-lg", color.cls)}>
                      {color.name === 'Primary Text' || color.name === 'Secondary Text' ? 'Aa' : ''}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary-text">{color.name}</span>
                        <code className="text-[10px] text-accent font-semibold">{color.hex}</code>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{color.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Typography Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Typography Scale</h3>
              <p className="text-xs text-zinc-400">
                Font Families: <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">Plus Jakarta Sans</code> (Display & Body), <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded">JetBrains Mono</code> (Code & Details).
              </p>
              
              <Card className="divide-y divide-border/40">
                {[
                  { style: 'Heading 1', size: 'text-4xl (36px)', weight: 'Font-extrabold', sample: 'PortifyHub Showcase', cls: 'text-4xl font-extrabold' },
                  { style: 'Heading 2', size: 'text-2xl (24px)', weight: 'Font-bold', sample: 'Discover Templates', cls: 'text-2xl font-bold' },
                  { style: 'Heading 3', size: 'text-lg (18px)', weight: 'Font-semibold', sample: 'Resume Customizer', cls: 'text-lg font-semibold' },
                  { style: 'Body Text', size: 'text-sm (14px)', weight: 'Font-medium', sample: 'Designed to help students build portfolios.', cls: 'text-sm text-zinc-400 font-medium' },
                  { style: 'Code / Mono', size: 'text-xs (12px)', weight: 'Font-mono', sample: 'npx create-vite-app@latest', cls: 'text-xs font-mono text-accent' },
                ].map((font, idx) => (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-48">
                      <span className="text-xs font-bold text-primary-text block">{font.style}</span>
                      <span className="text-[10px] text-zinc-500 block font-semibold mt-0.5">{font.size} • {font.weight}</span>
                    </div>
                    <div className={cn("flex-1 text-left", font.cls)}>
                      {font.sample}
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            <hr className="border-border/60" />

            {/* Animation specs */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Animation Guidelines</h3>
              <p className="text-xs text-zinc-400">
                We prefer physical simulation (spring stiffness/damping) over linear/duration-based transitions. This makes UI interactions feel crisp and immediate.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Hover Transitions</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Always use spring presets for hover scales (e.g. scale up by 1.01-1.02, stiffness 400, damping 25). Avoid large enlargements, which look amateurish.
                  </p>
                </Card>
                <Card className="p-5">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Subtle Glow Effects</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Use high opacity glow drops on interactive card elements (using CSS properties and shadows). Glow drop spreads should not exceed 25px.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Component Library Playground */}
        {activeMenu === 'components' && (
          <div className="max-w-5xl space-y-8 text-left">
            <div className="space-y-3">
              <Badge variant="accent">Playground</Badge>
              <h1 className="text-3xl font-extrabold text-white">Component Library</h1>
              <p className="text-sm text-zinc-400">
                Select a component from the tabs below, interact with its configuration parameters, test its live animations, and grab the source code.
              </p>
            </div>

            {/* Tabs for components */}
            <div className="border-b border-border/40 pb-px">
              <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-lg border border-border">
                {Object.keys(codeSnippets).map((comp) => {
                  const isActive = activePlaygroundComponent === comp
                  return (
                    <button
                      key={comp}
                      onClick={() => {
                        setActivePlaygroundComponent(comp as any)
                        setCopiedSnippet(false)
                      }}
                      className={cn(
                        'px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer select-none',
                        isActive 
                          ? 'bg-neutral-800 text-primary-text border border-neutral-700/50' 
                          : 'text-zinc-400 hover:text-primary-text hover:bg-neutral-800/40'
                      )}
                    >
                      {comp}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Play Area layout: Configurator + Live Preview on left/top, Code Viewer on right/bottom */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Left Panel: Preview + Configs */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Live Preview Card */}
                <Card glow className="p-8 flex flex-col items-center justify-center min-h-[200px] relative bg-neutral-950/20">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Live Preview</span>
                  </div>

                  {/* Dynamic Render based on Active tab */}
                  {activePlaygroundComponent === 'Button' && (
                    <Button variant={btnVariant} size={btnSize} isLoading={btnLoading}>
                      Interactive Button
                    </Button>
                  )}

                  {activePlaygroundComponent === 'Card' && (
                    <Card 
                      interactive={cardInteractive} 
                      glow={cardGlow} 
                      variant={cardVariant}
                      className="p-6 max-w-sm text-left"
                    >
                      <CardHeader className="p-0 pb-3">
                        <Badge variant="accent">Minimal Card</Badge>
                        <h4 className="text-sm font-bold text-white mt-1">Geist Portfolio Core</h4>
                      </CardHeader>
                      <CardContent className="p-0 py-3 text-xs text-zinc-400">
                        A beautiful card template option designed for minimal student portfolio discovery page.
                      </CardContent>
                      <CardFooter className="p-0 pt-3 mt-1 justify-between">
                        <span className="text-[10px] text-zinc-500 font-mono">ID: 08465778</span>
                        <Button variant="ghost" size="sm" className="px-1">Explore</Button>
                      </CardFooter>
                    </Card>
                  )}

                  {activePlaygroundComponent === 'Input' && (
                    <div className="w-full max-w-xs">
                      <Input
                        label="User Portfolio Name"
                        value={inpValue}
                        onChange={(e) => setInpValue(e.target.value)}
                        error={inpError}
                        helperText="Provide your full display name."
                        placeholder="Enter full name..."
                      />
                    </div>
                  )}

                  {activePlaygroundComponent === 'SearchBar' && (
                    <div className="w-full max-w-xs">
                      <SearchBar
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        onClear={() => setSearchVal('')}
                        placeholder="Search portfolios..."
                      />
                    </div>
                  )}

                  {activePlaygroundComponent === 'Badge' && (
                    <div className="flex gap-2">
                      <Badge variant={badgeVariant} dot={badgeDot}>
                        Status Badge
                      </Badge>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Tabs' && (
                    <Tabs
                      options={[
                        { id: 'all', label: 'All Projects' },
                        { id: 'minimal', label: 'Minimalist' },
                        { id: 'dev', label: 'Code' }
                      ]}
                      activeTab={demoTab}
                      onChange={(id) => setDemoTab(id)}
                    />
                  )}

                  {activePlaygroundComponent === 'Modal' && (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-zinc-500 mb-2 text-center">Interactive overlay container trigger.</p>
                      <Button variant="primary" onClick={() => setIsPlaygroundModalOpen(true)}>
                        Trigger Modal
                      </Button>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Table' && (
                    <div className="w-full max-w-sm">
                      <Table
                        data={[
                          { id: '1', name: 'Alice', role: 'Designer' },
                          { id: '2', name: 'Bob', role: 'Engineer' }
                        ]}
                        columns={[
                          { header: 'Name', accessor: 'name' },
                          { header: 'Role', accessor: 'role' }
                        ]}
                        keyExtractor={(r) => r.id}
                      />
                    </div>
                  )}

                  {activePlaygroundComponent === 'DashboardCard' && (
                    <div className="w-full max-w-xs">
                      <DashboardCard
                        title="Resume Downloads"
                        value="3,840"
                        description="vs 2,140 last month"
                        trend={{ value: '+79%', direction: 'up' }}
                        sparkline={[20, 30, 45, 35, 60, 80, 75, 95]}
                      />
                    </div>
                  )}
                </Card>

                {/* Configuration Controls Card */}
                <Card className="p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    Component Configuration
                  </h4>

                  {/* Render Configuration Controls depending on active component */}
                  {activePlaygroundComponent === 'Button' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Variant</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(['primary', 'secondary', 'outline', 'ghost', 'glow'] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setBtnVariant(v)}
                              className={cn(
                                "px-2 py-1 text-xs font-semibold rounded border cursor-pointer",
                                btnVariant === v ? "border-accent text-accent bg-accent/5" : "border-border text-zinc-400 hover:text-white"
                              )}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Size</span>
                        <div className="flex gap-1.5 mt-2">
                          {(['sm', 'md', 'lg'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => setBtnSize(s)}
                              className={cn(
                                "px-2 py-1 text-xs font-semibold rounded border cursor-pointer",
                                btnSize === s ? "border-accent text-accent bg-accent/5" : "border-border text-zinc-400 hover:text-white"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          id="btn-load"
                          checked={btnLoading}
                          onChange={(e) => setBtnLoading(e.target.checked)}
                          className="rounded border-border bg-surface text-accent focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="btn-load" className="text-xs font-semibold text-zinc-400 select-none cursor-pointer">
                          Loading Spinner
                        </label>
                      </div>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Card' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Variant Style</span>
                        <div className="flex gap-1.5 mt-2">
                          {(['default', 'glass', 'accent'] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setCardVariant(v)}
                              className={cn(
                                "px-2 py-1 text-xs font-semibold rounded border cursor-pointer",
                                cardVariant === v ? "border-accent text-accent bg-accent/5" : "border-border text-zinc-400 hover:text-white"
                              )}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 mt-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="card-int"
                            checked={cardInteractive}
                            onChange={(e) => setCardInteractive(e.target.checked)}
                            className="rounded border-border bg-surface text-accent focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="card-int" className="text-xs font-semibold text-zinc-400 select-none cursor-pointer">
                            Scale & shadow transition on hover
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="card-glow"
                            checked={cardGlow}
                            onChange={(e) => setCardGlow(e.target.checked)}
                            className="rounded border-border bg-surface text-accent focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="card-glow" className="text-xs font-semibold text-zinc-400 select-none cursor-pointer">
                            Subtle blue border on hover
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Input' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Error State</span>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => setInpError('')}
                            className={cn(
                              "px-2.5 py-1 text-xs font-semibold rounded border cursor-pointer",
                              !inpError ? "border-accent text-accent bg-accent/5" : "border-border text-zinc-400"
                            )}
                          >
                            No Error
                          </button>
                          <button
                            onClick={() => setInpError('Name is required.')}
                            className={cn(
                              "px-2.5 py-1 text-xs font-semibold rounded border cursor-pointer",
                              inpError ? "border-red-500 text-red-400 bg-red-500/5" : "border-border text-zinc-400"
                            )}
                          >
                            Set Error
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                        Input component implements custom border-rings and labels for screen readers.
                      </p>
                    </div>
                  )}

                  {activePlaygroundComponent === 'SearchBar' && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Focus this search bar and press <kbd className="border border-border bg-neutral-900 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-400">Esc</kbd> to exit. Press <kbd className="border border-border bg-neutral-900 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-400">Ctrl + K</kbd> anywhere on screen to focus it.
                      </p>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Badge' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Color Variant</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(['default', 'success', 'warning', 'error', 'info', 'accent'] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setBadgeVariant(v)}
                              className={cn(
                                "px-2 py-1 text-xs font-semibold rounded border cursor-pointer",
                                badgeVariant === v ? "border-accent text-accent bg-accent/5" : "border-border text-zinc-400 hover:text-white"
                              )}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          id="badge-dot"
                          checked={badgeDot}
                          onChange={(e) => setBadgeDot(e.target.checked)}
                          className="rounded border-border bg-surface text-accent focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="badge-dot" className="text-xs font-semibold text-zinc-400 select-none cursor-pointer">
                          Include pulsing indicator dot
                        </label>
                      </div>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Tabs' && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Uses Framer Motion layoutId interpolation. Switch tabs in the preview panel to check the smooth horizontal transition animation.
                      </p>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Modal' && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Features scroll-lock implementation, overlay blur, and physical spring scale transitions.
                      </p>
                    </div>
                  )}

                  {activePlaygroundComponent === 'Table' && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        A generalized, strongly-typed grid layout using Vercel styling guidelines.
                      </p>
                    </div>
                  )}

                  {activePlaygroundComponent === 'DashboardCard' && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Shows statistical changes with percentage differences and inline SVG vector graphs (sparklines).
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Panel: Code Viewer */}
              <div className="xl:col-span-7 flex flex-col h-full">
                <div className="bg-[#111111] border border-border rounded-xl overflow-hidden flex flex-col h-[480px]">
                  
                  {/* Code Viewer Header */}
                  <div className="bg-neutral-900/60 px-5 py-3.5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-primary-text font-mono">
                        {activePlaygroundComponent}.tsx
                      </span>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCopyCode(codeSnippets[activePlaygroundComponent])}
                      className="h-8 gap-2 border-border"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-semibold text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-[11px] font-semibold">Copy Code</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Code Viewer Box */}
                  <div className="flex-1 overflow-auto p-5 font-mono text-[11px] text-zinc-300 bg-black/40 text-left leading-relaxed select-all">
                    <pre className="whitespace-pre">{codeSnippets[activePlaygroundComponent]}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Discovery Demo */}
        {activeMenu === 'discover' && (
          <div className="max-w-5xl space-y-8 text-left">
            <div className="space-y-3">
              <Badge variant="accent" dot>Demo Page Mockup</Badge>
              <h1 className="text-3xl font-extrabold text-white">Student Portfolio Templates</h1>
              <p className="text-sm text-zinc-400">
                Discover modern portfolio templates, filter by category, and easily initialize a new website deployment guide.
              </p>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/40 p-4 border border-border rounded-xl">
              <div className="w-full sm:max-w-xs">
                <SearchBar
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  onClear={() => setTemplateSearch('')}
                  placeholder="Search portfolios..."
                />
              </div>

              <Tabs
                options={[
                  { id: 'all', label: 'All Templates' },
                  { id: 'minimal', label: 'Minimal' },
                  { id: 'developer', label: 'Developer' },
                  { id: 'creative', label: 'Creative' }
                ]}
                activeTab={templateFilter}
                onChange={(id) => setTemplateFilter(id)}
              />
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(item => {
                  const matchesFilter = templateFilter === 'all' || item.category === templateFilter
                  const matchesSearch = item.title.toLowerCase().includes(templateSearch.toLowerCase()) || 
                                        item.author.toLowerCase().includes(templateSearch.toLowerCase())
                  return matchesFilter && matchesSearch
                })
                .map((item) => (
                  <Card key={item.id} interactive glow className="flex flex-col h-full">
                    <div className="bg-neutral-900/60 p-4 border-b border-border/40 relative aspect-video flex items-center justify-center overflow-hidden">
                      {/* Graphics mockup placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
                      <div className="z-10 flex flex-col items-center gap-1.5">
                        <Terminal className="w-8 h-8 text-accent/80" />
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase">{item.category} template</span>
                      </div>
                      
                      {item.badge && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="accent" dot>{item.badge}</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base leading-tight hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-semibold">
                          Created by {item.author}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-yellow-400">★</span> {item.rating}
                        </div>
                        <div className="font-medium text-zinc-500">
                          {item.views} downloads
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 mt-0 justify-end border-none">
                      <Button variant="outline" size="sm" className="w-full gap-2 border-border/80">
                        View Guides <ChevronRight className="w-3 h-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}

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

        {/* Guides & Deployment Table */}
        {activeMenu === 'guides' && (
          <div className="max-w-4xl space-y-8 text-left">
            <div className="space-y-3">
              <Badge variant="accent">Cloud Integration</Badge>
              <h1 className="text-3xl font-extrabold text-white">Guides & Cloud Deployment</h1>
              <p className="text-sm text-zinc-400">
                Setup guide progress database template. Check build statuses, deploy times, and guide levels in an accessible, interactive table component.
              </p>
            </div>

            <Table
              data={deploymentGuides}
              columns={guideColumns}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => alert(`Deploying guide details for: ${row.name}`)}
              emptyState={
                <div className="flex flex-col items-center py-6 gap-2">
                  <Info className="w-8 h-8 text-zinc-600" />
                  <span className="text-zinc-500">No guides matching standard filter.</span>
                </div>
              }
            />

            {/* Example statistics dashboard cards below */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Cloud Statistics Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <DashboardCard
                  title="Total Deploys"
                  value="1,492"
                  description="84 active this week"
                  trend={{ value: '+14%', direction: 'up' }}
                  sparkline={[20, 25, 45, 30, 50, 70, 65, 80]}
                />
                <DashboardCard
                  title="Platform Uptime"
                  value="99.98%"
                  description="All Vercel integrations online"
                  trend={{ value: 'Stable', direction: 'neutral' }}
                />
                <DashboardCard
                  title="Build Crashes"
                  value="0"
                  description="No errors reported"
                  trend={{ value: '-100%', direction: 'down' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Profile */}
        {activeMenu === 'profile' && (
          <UserProfile />
        )}

      </main>

      <Modal
        isOpen={isPlaygroundModalOpen}
        onClose={() => setIsPlaygroundModalOpen(false)}
        title="Playground Modal"
        description="This is an interactive test of the modular Modal system."
        size="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-zinc-400">
            You can verify accessibility focus controls, escape key close triggers, and smooth Framer Motion backdrop transitions here in the playground.
          </p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsPlaygroundModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  )
}
