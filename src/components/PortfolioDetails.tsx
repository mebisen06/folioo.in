import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  ExternalLink, 
  Code2, 
  FileArchive,
  Info,
  Calendar,
  FileText,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  FileCode,
  Terminal,
  Cpu
} from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import type { Portfolio } from '../types'
import { usePortfolios } from '../hooks/usePortfolios'

export interface PortfolioDetailsProps {
  portfolio: Portfolio
  onNavigate: (viewId: string, portfolioId?: number | string) => void
}

export default function PortfolioDetails({ portfolio, onNavigate }: PortfolioDetailsProps) {
  const [activeTab, setActiveTab] = React.useState<'setup' | 'customize' | 'deploy'>('setup')
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const { portfolios } = usePortfolios()

  // Auto-scroll to top when component mounts or portfolio changes
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [portfolio])

  // Custom mock screenshots (beautiful CSS wireframe renders representing slides)
  const screenshots = [
    { id: 0, label: 'Hero Home View', gradient: portfolio.gradient },
    { id: 1, label: 'Projects Grid Page', gradient: 'from-zinc-900 via-neutral-900 to-zinc-950' },
    { id: 2, label: 'Experience Timeline', gradient: 'from-neutral-950 via-zinc-900 to-neutral-900' }
  ]

  const relatedPortfolios = portfolios
    .filter(item => item.id !== portfolio.id && item.category === portfolio.category)
    .slice(0, 3)

  const handleLightboxNav = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex === 0 ? screenshots.length - 1 : lightboxIndex - 1)
    } else {
      setLightboxIndex(lightboxIndex === screenshots.length - 1 ? 0 : lightboxIndex + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col relative overflow-x-hidden">
      
      {/* Visual background details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1f1f1f_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.12] pointer-events-none" />

      {/* Header section (fixed) */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/60 glass z-40 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('gallery')} 
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </button>
        </div>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">F</div>
          <span className="font-extrabold tracking-tight text-base">Folioo</span>
        </div>
      </header>

      {/* Container */}
      <main className="max-w-7xl mx-auto w-full pt-24 pb-24 px-4 sm:px-6 lg:px-8 z-10 flex-1 space-y-12">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
          <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors cursor-pointer">HOME</button>
          <span>/</span>
          <button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors cursor-pointer">GALLERY</button>
          <span>/</span>
          <span className="text-zinc-400">{portfolio.title}</span>
        </div>

        {/* Hero Area */}
        <section className="relative rounded-2xl border border-border/60 bg-surface/40 p-6 sm:p-8 overflow-hidden space-y-6">
          <div className={`absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l ${portfolio.gradient} blur-3xl opacity-40 pointer-events-none`} />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            {/* Title / Description block */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold bg-neutral-900 border border-border/80 rounded-md text-zinc-400 uppercase">
                  {portfolio.category}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{portfolio.title}</h1>
                <p className="text-xs sm:text-sm text-zinc-400">Created by <strong className="text-zinc-300 font-bold">{portfolio.author}</strong></p>
              </div>

                {portfolio.description}

              {/* Badges list */}
              <div className="flex flex-wrap gap-2 pt-2">
                {portfolio.tags?.map(tech => (
                  <span key={tech} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-border/80 rounded text-accent">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px] w-full md:w-auto">
              <Button 
                variant="glow" 
                size="md" 
                className="w-full justify-center gap-2"
                onClick={() => alert(`Launching live deployment preview for: ${portfolio.demoUrl}`)}
              >
                View Live Demo <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="md" 
                className="w-full justify-center gap-2 border-border/80 hover:border-zinc-700 text-white"
                onClick={() => alert(`Opening source repository: https://${portfolio.githubUrl}`)}
              >
                <Code2 className="w-4 h-4" /> Open GitHub
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                className="w-full justify-center gap-2 border-border/60 hover:bg-neutral-800"
                onClick={() => alert(`Beginning file download package: ${portfolio.title.toLowerCase().replace(/\s+/g, '-')}-main.zip`)}
              >
                <FileArchive className="w-4 h-4" /> Download ZIP
              </Button>
            </div>
          </div>
        </section>

        {/* Screenshot Gallery Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Interface Screenshots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {screenshots.map((screen, idx) => (
              <motion.div
                key={screen.id}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-video rounded-xl border border-border/60 bg-surface/50 overflow-hidden cursor-pointer group"
              >
                {/* Visual abstract wireframe representing portfolio view */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${screen.gradient} opacity-20`} />
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">{screen.label}</span>
                </div>
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Content & Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main guides Column (Left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Guide Tabs Selector */}
            <div className="flex border-b border-border/60">
              <button
                onClick={() => setActiveTab('setup')}
                className={`
                  pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2
                  ${activeTab === 'setup' 
                    ? 'border-accent text-white font-extrabold' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <Terminal className="w-4 h-4" /> Setup Guide
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`
                  pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2
                  ${activeTab === 'customize' 
                    ? 'border-accent text-white font-extrabold' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <FileCode className="w-4 h-4" /> Customization
              </button>
              <button
                onClick={() => setActiveTab('deploy')}
                className={`
                  pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2
                  ${activeTab === 'deploy' 
                    ? 'border-accent text-white font-extrabold' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <Cpu className="w-4 h-4" /> Deployment Guide
              </button>
            </div>

            {/* Guide rendering blocks */}
            <Card className="p-6 border-border/60 bg-surface/30">
              <AnimatePresence mode="wait">
                {activeTab === 'setup' && (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed"
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Getting Started</h3>
                      <p className="text-xs text-zinc-400">Follow these CLI commands to boot the development server locally.</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">1. Clone & Install</span>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`git clone https://${portfolio.githubUrl}.git
cd ${portfolio.title.toLowerCase().replace(/\s+/g, '-')}
npm install`}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">2. Configure Environment Variables</span>
                      <p className="text-xs text-zinc-400">Copy the example configuration file and adjust variables:</p>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-zinc-400 overflow-x-auto">
{`# .env.local
NEXT_PUBLIC_ANALYTICS_ID=your-google-analytics-id
NEXT_PUBLIC_API_URL=https://api.folioo.in`}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">3. Launch local runtime</span>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`npm run dev`}
                      </pre>
                      <p className="text-xs text-zinc-400">Open http://localhost:3000 to interact with your local preview sandbox.</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'customize' && (
                  <motion.div
                    key="customize"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed"
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Theme & Assets Customization</h3>
                      <p className="text-xs text-zinc-400">Personalize this template with your project titles, links, and styling parameters.</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Adjusting User Info (`config.json`)</span>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-zinc-400 overflow-x-auto">
{`{
  "name": "Your Full Name",
  "role": "Full Stack Engineer",
  "bio": "Write a short hook about your developer capabilities.",
  "links": {
    "github": "https://github.com/your-username",
    "linkedin": "https://linkedin.com/in/your-profile"
  }
}`}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Changing Palette (Tailwind CSS)</span>
                      <p className="text-xs text-zinc-400">Adjust details directly inside `tailwind.config.js` or standard global stylesheet:</p>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-zinc-400 overflow-x-auto">
{`// tailwind.config.js
theme: {
  extend: {
    colors: {
      accent: '#3B82F6', // Swapping color sets
      surface: '#111111'
    }
  }
}`}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'deploy' && (
                  <motion.div
                    key="deploy"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed"
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white">Production Deployment Instructions</h3>
                      <p className="text-xs text-zinc-400">How to launch this template online for free on modern hosting services.</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">1. Deploy to Vercel (Recommended)</span>
                      <p className="text-xs text-zinc-400">Vercel seamlessly configures this repository stack on git pushes:</p>
                      <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-1.5">
                        <li>Import your portfolio repository on Vercel Dashboard.</li>
                        <li>Environment details are imported under configurations panel.</li>
                        <li>Click <strong>Deploy</strong>. Vercel sets up a secure webhook.</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">2. GitHub Actions CI Pipeline</span>
                      <p className="text-xs text-zinc-400">Enable tests validation on every push request:</p>
                      <pre className="bg-neutral-950 p-4 rounded-lg border border-border/60 text-[11px] font-mono text-zinc-500 overflow-x-auto">
{`# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Assets
        run: npm install && npm run build`}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            
            {/* Stats Panel */}
            <Card className="p-5 border-border/60 bg-surface/50 space-y-5">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Portfolio Analytics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/40 p-3 rounded-lg border border-border/40 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> VIEWS
                  </span>
                  <strong className="text-base text-white font-mono mt-1">{portfolio.views}</strong>
                </div>
                
                <div className="bg-neutral-900/40 p-3 rounded-lg border border-border/40 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> DOWNLOADS
                  </span>
                  <strong className="text-base text-white font-mono mt-1">{portfolio.downloads}</strong>
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Package Details list */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-zinc-600" /> License</span>
                  <span className="text-zinc-300 font-mono">MIT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-600" /> Released</span>
                  <span className="text-zinc-300">June 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-zinc-600" /> Stars</span>
                  <span className="text-zinc-300 font-mono">★ {portfolio.stars}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-zinc-600" /> Mobile Ready</span>
                  <Badge variant="success" className="text-[8px] px-1 py-0">Yes</Badge>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-4 border-border/60 bg-accent/5 space-y-2">
              <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Recruiter Checklist</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Recruiters love customized deployment links. We recommend deploying to Vercel and linking your domain inside your resume.
              </p>
            </Card>

          </div>

        </div>

        {/* Related Portfolios grid */}
        {relatedPortfolios.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-border/60">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white tracking-tight">Related Templates</h2>
              <span className="text-xs text-zinc-500">Same track or difficulty level</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPortfolios.map(item => (
                <Card 
                  key={item.id}
                  interactive 
                  glow 
                  onClick={() => onNavigate('details', item.id)}
                  className="p-5 border-border/60 flex flex-col justify-between cursor-pointer space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 text-[8px] bg-neutral-900 border border-border/80 rounded-md font-bold text-zinc-500">
                        {item.category.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{item.title}</h4>
                      <span className="text-[10px] text-zinc-500">by {item.author}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500 pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-zinc-600" /> {item.views}</span>
                    <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-zinc-600" /> {item.downloads}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />

            {/* Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-neutral-900 border border-border rounded-xl shadow-2xl z-10 flex flex-col justify-between p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <span className="text-xs font-bold text-zinc-400 font-mono">{screenshots[lightboxIndex].label}</span>
                <button 
                  onClick={() => setLightboxIndex(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-md bg-neutral-800/80 border border-border/80 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Screenshot body representation */}
              <div className="flex-1 flex items-center justify-center relative py-6">
                {/* Visual interface mockup inside the lightbox */}
                <div className={`w-full max-w-2xl h-4/5 rounded-xl bg-gradient-to-tr ${screenshots[lightboxIndex].gradient} opacity-20 blur-xl absolute inset-0 m-auto`} />
                <div className="relative border border-border/80 bg-surface/90 rounded-xl p-8 sm:p-12 shadow-2xl w-full max-w-2xl flex flex-col justify-between space-y-8 min-h-[280px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-extrabold text-white">{portfolio.title}</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">{portfolio.description}</p>
                    <span className="text-[10px] font-mono text-zinc-500">{screenshots[lightboxIndex].label} Layout View</span>
                  </div>
                  <div className="h-4 w-full bg-zinc-950/40 rounded border border-border/40" />
                </div>
              </div>

              {/* Footer navigation */}
              <div className="flex justify-between items-center border-t border-border/60 pt-3">
                <span className="text-[10px] text-zinc-500 font-mono">Image {lightboxIndex + 1} of {screenshots.length}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleLightboxNav('prev')}
                    className="p-1.5 rounded-md bg-neutral-800 border border-border text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleLightboxNav('next')}
                    className="p-1.5 rounded-md bg-neutral-800 border border-border text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
