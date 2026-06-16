import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Database, 
  Shield, 
  Brain, 
  BarChart3, 
  Palette, 
  FolderGit2, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  FileSpreadsheet, 
  Globe, 
  Users, 
  Menu, 
  X,
  Zap
} from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export interface LandingPageProps {
  onNavigate: (viewId: string) => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Categories configurations
  const categories = [
    { name: 'Student', icon: <Users className="w-5 h-5 text-accent" />, desc: 'Simple, effective templates tailored for interns and new grads.' },
    { name: 'Frontend', icon: <Monitor className="w-5 h-5 text-accent" />, desc: 'Highlight pixel-perfect components, CSS animations, and UI skills.' },
    { name: 'Backend', icon: <Database className="w-5 h-5 text-accent" />, desc: 'Showcase API architecture, database schemas, and microservices.' },
    { name: 'Full Stack', icon: <Layers className="w-5 h-5 text-accent" />, desc: 'Connect modern frontends with secure backend cloud services.' },
    { name: 'Cybersecurity', icon: <Shield className="w-5 h-5 text-accent" />, desc: 'Document penetration audits, CTFs, and security certifications.' },
    { name: 'AI / ML', icon: <Brain className="w-5 h-5 text-accent" />, desc: 'Present model training graphs, notebooks, and dataset pipelines.' },
    { name: 'Data Science', icon: <BarChart3 className="w-5 h-5 text-accent" />, desc: 'Display analytical dashboards, charts, and mathematical data insights.' },
    { name: 'Creative', icon: <Palette className="w-5 h-5 text-accent" />, desc: 'Express bold typography, custom themes, and media designs.' },
    { name: 'Minimal', icon: <FolderGit2 className="w-5 h-5 text-accent" />, desc: 'Ultra-clean layouts designed for focused reading with zero fluff.' },
    { name: '3D Showcase', icon: <Globe className="w-5 h-5 text-accent" />, desc: 'Immersive WebGL galleries, ThreeJS orbits, and visual canvas elements.' }
  ]

  // Features configs
  const features = [
    {
      title: 'Portfolio Discovery',
      badge: 'Interactive',
      desc: 'Browse a directory of high-converting, developer-focused portfolio templates. Filter by category, inspect source code, and choose layouts that best highlight your specific tech stack.',
      icon: <FolderGit2 className="w-5 h-5 text-accent" />,
      visual: (
        <div className="w-full h-full bg-neutral-950/40 rounded-lg border border-border/80 p-4 font-mono text-[10px] text-zinc-400 space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="text-[9px] text-zinc-500 ml-1">portfolio-finder.sh</span>
          </div>
          <div>$ query-templates --filter="AI/ML"</div>
          <div className="text-accent">&gt; Loading 3 templates...</div>
          <div className="bg-surface/50 border border-border p-2 rounded flex items-center justify-between mt-2">
            <span>🚀 NeuralGrid-Portfolio</span>
            <Badge variant="success">99.9% ATS</Badge>
          </div>
          <div className="bg-surface/50 border border-border p-2 rounded flex items-center justify-between">
            <span>⚡ GeistTerminal-v2</span>
            <Badge variant="accent">Hot</Badge>
          </div>
        </div>
      )
    },
    {
      title: 'ATS-Friendly Resume Builder',
      badge: 'ATS Optimised',
      desc: 'Input your contact info, technology tags, and experiences into a structured editor. We render clean, high-legibility resumes that pass corporate ATS parsing filters with flying colors.',
      icon: <FileSpreadsheet className="w-5 h-5 text-accent" />,
      visual: (
        <div className="w-full h-full bg-surface border border-border rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <div className="w-16 h-3.5 bg-accent/10 border border-accent/20 rounded text-[9px] font-bold text-accent flex items-center justify-center">RESUME.PDF</div>
            <div className="h-4 w-32 bg-white rounded-sm" />
            <div className="h-2 w-full bg-zinc-800 rounded-sm" />
            <div className="h-2 w-5/6 bg-zinc-800 rounded-sm" />
            <div className="flex gap-1.5 pt-1">
              <span className="w-8 h-3.5 bg-zinc-800 rounded-full" />
              <span className="w-12 h-3.5 bg-zinc-800 rounded-full" />
              <span className="w-10 h-3.5 bg-zinc-800 rounded-full" />
            </div>
          </div>
          <div className="border-t border-border/50 pt-2 flex items-center justify-between text-[9px] text-zinc-500">
            <span>ATS Compliance: 100%</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      )
    },
    {
      title: 'Deployment & Setup Guides',
      badge: 'Cloud Sync',
      desc: 'Get direct configuration code blocks and guides detailing deployment pipelines. Deploy your static sites to Vercel, Netlify, and GitHub Pages with zero friction or DNS headaches.',
      icon: <Globe className="w-5 h-5 text-accent" />,
      visual: (
        <div className="w-full h-full bg-neutral-950/40 border border-border/80 rounded-lg p-4 font-mono text-[10px] text-zinc-400 space-y-2 overflow-hidden">
          <div className="text-zinc-500">// GitHub Actions Pipeline</div>
          <div>name: Deploy Portfolio</div>
          <div>on: [push]</div>
          <div>jobs:</div>
          <div className="pl-3">build-and-deploy:</div>
          <div className="pl-6 text-emerald-400">- name: Deploy to Vercel</div>
          <div className="pl-9 text-zinc-500">run: vercel --prod --token=${'{{'} secrets.VERCEL_TOKEN {'}}'}</div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pt-1">
            <CheckCircle className="w-3.5 h-3.5" /> Pipeline succeeded
          </div>
        </div>
      )
    },
    {
      title: 'Developer Creator Hub',
      badge: 'Analytics',
      desc: 'Track metrics regarding who inspects your credentials. Monitor click rates, resume download counts, and referral sources from recruiter links in a dashboard interface.',
      icon: <BarChart3 className="w-5 h-5 text-accent" />,
      visual: (
        <div className="w-full h-full bg-surface border border-border rounded-lg p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Recruiter Visits</span>
            <Badge variant="accent">+42%</Badge>
          </div>
          <div className="h-12 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 30 L 15 20 L 30 25 L 45 10 L 60 15 L 75 5 L 90 8 L 100 2 Z" fill="none" stroke="#3B82F6" strokeWidth="2" />
              <path d="M 0 30 L 15 20 L 30 25 L 45 10 L 60 15 L 75 5 L 90 8 L 100 2 L 100 30 L 0 30 Z" fill="rgba(59, 130, 246, 0.08)" />
            </svg>
          </div>
          <span className="text-[11px] text-zinc-400 font-semibold mt-1">12 Recruiter clicks today</span>
        </div>
      )
    }
  ]

  // Animations configuration
  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary-text relative overflow-x-hidden flex flex-col">
      
      {/* Visual background details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-border/60 to-transparent z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.2] pointer-events-none" />

      {/* 1. NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/60 glass z-50 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">F</div>
            <span className="font-extrabold tracking-tight text-lg">Folioo</span>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('gallery')} 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Browse Portfolios
            </button>
            <button 
              onClick={() => onNavigate('builder')} 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Resume Builder
            </button>
            <button 
              onClick={() => onNavigate('creator-dashboard')} 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Creator Hub
            </button>
          </nav>
        </div>

        {/* Buttons right */}
        <div className="hidden sm:flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
            Login
          </Button>
          <Button variant="glow" size="sm" onClick={() => onNavigate('signup')}>
            Sign Up
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 bg-surface border-b border-border/80 z-40 p-6 flex flex-col gap-4 text-left lg:hidden"
          >
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('gallery'); }}
              className="text-sm font-semibold text-zinc-400 hover:text-white text-left transition-colors py-1 cursor-pointer"
            >
              Browse Portfolios
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('builder'); }}
              className="text-sm font-semibold text-zinc-400 hover:text-white text-left transition-colors py-1 cursor-pointer"
            >
              Resume Builder
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false)
                onNavigate('creator-dashboard')
              }} 
              className="text-sm font-semibold text-zinc-400 hover:text-white text-left transition-colors py-1 cursor-pointer"
            >
              Creator Hub
            </button>
            <hr className="border-border/60 my-1" />
            <div className="flex flex-col gap-2.5">
              <Button variant="outline" size="md" className="w-full" onClick={() => { setMobileMenuOpen(false); onNavigate('login') }}>
                Login
              </Button>
              <Button variant="glow" size="md" className="w-full" onClick={() => { setMobileMenuOpen(false); onNavigate('signup') }}>
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative pt-36 pb-20 px-4 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl space-y-6"
        >
          {/* Tagline Badge */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <Badge variant="accent" dot className="px-3.5 py-1 text-xs">
              Folioo 1.0 Release
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={fadeIn}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto"
          >
            Discover Portfolios.<br />
            Generate ATS-Friendly Resumes.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-sky-300">
              Launch Your Career.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeIn}
            className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Browse developer portfolios, learn how to customize them, generate professional resumes, and deploy your personal brand.
          </motion.p>

          {/* Actions */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2" onClick={() => onNavigate('gallery')}>
              Browse Portfolios <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto border-border hover:border-zinc-700" onClick={() => onNavigate('builder')}>
              Generate Resume
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Mockup Preview container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          className="w-full max-w-5xl mt-16 rounded-xl border border-border/80 bg-surface shadow-2xl p-2 relative overflow-hidden"
        >
          {/* Gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-xl" />
          
          {/* Header toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-[#151515] rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-zinc-500 font-mono ml-2">app.folioo.in/discover</span>
            </div>
            <div className="w-36 h-4 bg-background border border-border/40 rounded flex items-center justify-center text-[9px] text-zinc-600 font-mono">
              Secure Sandbox Mode
            </div>
          </div>

          {/* Mockup Dashboard Interior */}
          <div className="bg-background/90 p-4 sm:p-6 grid grid-cols-12 gap-5 min-h-[300px] text-left">
            {/* Sidebar mock */}
            <div className="hidden md:block col-span-3 space-y-4 border-r border-border/40 pr-4">
              <div className="h-6 w-20 bg-zinc-800 rounded-sm" />
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-6 rounded-md flex items-center px-2 gap-2 ${i === 1 ? 'bg-surface border border-border' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="w-12 h-2 bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main content mock */}
            <div className="col-span-12 md:col-span-9 space-y-5">
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 bg-zinc-800 rounded-sm" />
                <div className="h-6 w-24 bg-accent/10 border border-accent/20 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Geist Minimal Portfolio', desc: 'A clean developer theme inspired by Vercel layouts.' },
                  { title: 'Linear Portfolio Showcase', desc: 'Sleek borders, dark colors, and clean typography tags.' }
                ].map((card, idx) => (
                  <Card key={idx} className="p-4 border-border/80 flex flex-col justify-between h-32">
                    <div>
                      <h4 className="text-xs font-bold text-white">{card.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40">
                      <span className="text-[9px] text-zinc-500 font-mono">★★★★★ 4.9</span>
                      <span className="text-[9px] text-accent font-bold">Inspect Code &gt;</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 border-y border-border/50 bg-[#111111]/40 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: '20+', label: 'Portfolios', desc: 'Curated developer layouts' },
              { val: '100+', label: 'Downloads', desc: 'Student community builds' },
              { val: '4', label: 'Resume Templates', desc: 'ATS-optimized formats' },
              { val: '10', label: 'Categories', desc: 'Covering key tech jobs' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center md:text-left space-y-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.val}
                </h3>
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider">
                  {stat.label}
                </h4>
                <p className="text-[10px] text-zinc-500 font-semibold">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PORTFOLIO CATEGORIES */}
      <section id="categories" className="py-24 px-4 sm:px-8 lg:px-12 relative z-10 max-w-6xl mx-auto text-left">
        <div className="space-y-3 mb-12 text-center md:text-left">
          <Badge variant="accent">Classifications</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tailored Portfolio Categories
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Choose a foundation template designed specifically for your career track. Instantly configure, document, and deploy your personal branding.
          </p>
        </div>

        {/* Categories Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <Card key={idx} interactive glow className="p-5 flex flex-col justify-between min-h-[160px] border-border/60 hover:bg-surface-hover">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-border flex items-center justify-center shadow-inner">
                  {cat.icon}
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cat.name}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                  {cat.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-24 px-4 sm:px-8 lg:px-12 border-t border-border/40 bg-[#111111]/10 relative z-10">
        <div className="max-w-5xl mx-auto text-left space-y-12">
          
          <div className="space-y-3 text-center md:text-left">
            <Badge variant="accent">SaaS Core</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Product Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              We provide students with the entire pipeline needed to build, compile, audit, and launch a professional tech presence.
            </p>
          </div>

          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, idx) => (
              <Card key={idx} className="border-border/60 flex flex-col h-full bg-[#111111]/80">
                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6 items-start">
                  
                  {/* Text details */}
                  <div className="space-y-3 md:w-3/5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        {feat.icon}
                      </span>
                      <Badge variant="accent" className="text-[9px] px-2 py-0.5">{feat.badge}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-white">{feat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                  </div>

                  {/* Visual mockup block */}
                  <div className="w-full md:w-2/5 aspect-video md:aspect-square bg-neutral-950/20 rounded-lg border border-border/40 p-2 flex items-center justify-center">
                    {feat.visual}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 px-4 sm:px-8 lg:px-12 relative z-10 max-w-4xl mx-auto">
        <Card variant="accent" glow className="relative border-accent/20 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-lg mx-auto space-y-6 relative z-10">
            <Zap className="w-10 h-10 text-accent mx-auto animate-pulse" />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to build your professional identity?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Create a free account, browse curated templates, checklist deployment pipelines, and generate recruiter-verified portfolios in under 10 minutes.
            </p>
            <div className="pt-2">
              <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2" onClick={() => onNavigate('signup')}>
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto border-t border-border/80 bg-[#111111]/30 py-12 px-4 sm:px-8 lg:px-12 relative z-10 text-left">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Logo & Info column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">F</div>
              <span className="font-extrabold tracking-tight text-base">Folioo</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-semibold">
              The premium developer-focused SaaS platform for portfolios and resumes. Helping students launch careers.
            </p>
            <div className="text-[10px] text-zinc-600 font-mono">
              © {new Date().getFullYear()} Folioo Inc. All rights reserved.
            </div>
          </div>

          {/* Site links columns */}
          {[
            {
              title: 'Product',
              links: [
                { label: 'Browse templates', onClick: () => onNavigate('gallery') },
                { label: 'Resume Builder', onClick: () => onNavigate('builder') },
                { label: 'Cloud Sync', onClick: () => onNavigate('guides') },
                { label: 'Creator Hub', onClick: () => onNavigate('creator-dashboard') }
              ]
            },
            {
              title: 'Resources',
              links: [
                { label: 'Documentation', onClick: () => onNavigate('guides') },
                { label: 'Vercel Deployment', onClick: () => onNavigate('guides') },
                { label: 'ATS checker', onClick: () => onNavigate('builder') },
                { label: 'Starter themes', onClick: () => onNavigate('gallery') }
              ]
            },
            {
              title: 'Company',
              links: [
                { label: 'About', onClick: () => onNavigate('landing') },
                { label: 'Changelog', onClick: () => onNavigate('landing') },
                { label: 'Privacy Policy', onClick: () => onNavigate('landing') },
                { label: 'Terms of Use', onClick: () => onNavigate('landing') }
              ]
            }
          ].map((column, idx) => (
            <div key={idx} className="space-y-3.5">
              <h4 className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <button
                      onClick={link.onClick}
                      className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer text-left font-semibold"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
