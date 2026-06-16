import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Upload,
  Eye,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  Folder,
  AlertCircle,
  X,
  FileCode
} from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'


import { useCreatorDashboard } from '../hooks/useCreatorDashboard'
import type { Portfolio } from '../types'

export default function CreatorDashboard() {
  const { data, deletePortfolio, createPortfolio, updatePortfolio } = useCreatorDashboard()
  
  // Use data from hook or fallback to empty arrays
  const portfolios = data?.portfolios || []
  const chartData = data?.chartData || []
  const stats = data?.stats || { totalPortfolios: 0, totalViews: 0, totalDownloads: 0 }
  
  // Modals management
  const [activeModal, setActiveModal] = React.useState<'view' | 'edit' | 'delete' | 'upload' | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<Portfolio | null>(null)
  
  // Form states for Upload & Edit
  const [formName, setFormName] = React.useState('')
  const [formCategory, setFormCategory] = React.useState('Developer')
  const [formViews, setFormViews] = React.useState(0)
  const [formDownloads, setFormDownloads] = React.useState(0)
  const [formTechStack, setFormTechStack] = React.useState('')
  const [formDescription, setFormDescription] = React.useState('')
  const [formStatus, setFormStatus] = React.useState('Draft')
  
  // Form error verification
  const [formError, setFormError] = React.useState('')

  // Use dynamic stats from hook
  const totalPortfolios = stats.totalPortfolios
  const totalViews = stats.totalViews
  const totalDownloads = stats.totalDownloads

  // Actions
  const handleOpenUpload = () => {
    setFormError('')
    setFormName('')
    setFormCategory('Developer')
    setFormViews(0)
    setFormDownloads(0)
    setFormStatus('Active')
    setFormTechStack('')
    setFormDescription('')
    setActiveModal('upload')
  }

  const handleOpenEdit = (item: Portfolio) => {
    setFormError('')
    setSelectedItem(item)
    setFormName(item.name || item.title || '')
    setFormCategory(item.category || '')
    setFormViews(Number(item.views) || 0)
    setFormDownloads(Number(item.downloads) || 0)
    setFormStatus(item.status || 'Draft')
    setFormTechStack(item.techStack || '')
    setFormDescription(item.description || '')
    setActiveModal('edit')
  }

  const handleOpenView = (item: Portfolio) => {
    setSelectedItem(item)
    setActiveModal('view')
  }

  const handleOpenDelete = (item: Portfolio) => {
    setSelectedItem(item)
    setActiveModal('delete')
  }

  const handleSaveUpload = () => {
    if (!formName.trim() || !formTechStack.trim() || !formDescription.trim()) {
      setFormError('All fields (Name, Tech Stack, Description) are required.')
      return
    }
    const newItem: Portfolio = {
      id: String(Date.now()),
      name: formName,
      title: formName,
      author: 'Creator',
      category: formCategory,
      views: formViews >= 0 ? formViews : 0,
      downloads: formDownloads >= 0 ? formDownloads : 0,
      status: formStatus as any,
      techStack: formTechStack,
      description: formDescription,
      thumbnailUrl: '',
      tags: [],
      screenshots: [],
      features: []
    }
    createPortfolio(newItem)
    setActiveModal(null)
  }

  const handleSaveEdit = () => {
    if (!selectedItem) return
    if (!formName.trim() || !formTechStack.trim() || !formDescription.trim()) {
      setFormError('All fields (Name, Tech Stack, Description) are required.')
      return
    }
    updatePortfolio(selectedItem.id, {
      name: formName,
      title: formName,
      category: formCategory,
      views: formViews >= 0 ? formViews : 0,
      downloads: formDownloads >= 0 ? formDownloads : 0,
      status: formStatus as any,
      techStack: formTechStack,
      description: formDescription
    })
    setActiveModal(null)
    setSelectedItem(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return
    try {
      await deletePortfolio(selectedItem.id)
      setActiveModal(null)
      setSelectedItem(null)
    } catch (e) {
      console.error(e)
    }
  }

  // Helper custom charts tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111]/90 border border-border p-3 rounded-lg shadow-xl text-left backdrop-blur-md">
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{label}</p>
          <p className="text-xs font-bold text-white mt-1">
            {payload[0].name === 'views' ? 'Total Views: ' : 'Downloads: '}
            <span className="text-accent">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" dot>SaaS Creator Studio</Badge>
            <span className="text-[10px] font-mono text-zinc-500 font-bold">ANALYTICS ENGINE v1.4</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Creator Dashboard</h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Monitor portfolio engagement metrics, review monthly downloads, edit configuration properties, or deploy new templates to the gallery.
          </p>
        </div>

        <Button variant="glow" onClick={handleOpenUpload} className="gap-2 self-start sm:self-center">
          <Upload className="w-4 h-4" /> Upload Portfolio
        </Button>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Portfolios */}
        <Card interactive className="p-6 relative bg-surface/30 border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Templates</span>
              <span className="text-4xl font-extrabold text-white block tracking-tight font-mono">{totalPortfolios}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" /> +25% vs last month
          </div>
        </Card>

        {/* Card 2: Total Views */}
        <Card interactive className="p-6 relative bg-surface/30 border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Aggregate Views</span>
              <span className="text-4xl font-extrabold text-white block tracking-tight font-mono">{totalViews.toLocaleString()}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last month
          </div>
        </Card>

        {/* Card 3: Total Downloads */}
        <Card interactive className="p-6 relative bg-surface/30 border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">ZIP Downloads</span>
              <span className="text-4xl font-extrabold text-white block tracking-tight font-mono">{totalDownloads.toLocaleString()}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" /> +21.2% vs last month
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Views Trend (Area Chart) */}
        <Card className="lg:col-span-7 p-6 border-border/60 bg-surface/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Views Engagement</h3>
              <p className="text-[11px] text-zinc-500">Weekly traffic accumulation metrics.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: '#1F1F1F', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#viewsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Downloads Trend (Bar Chart) */}
        <Card className="lg:col-span-5 p-6 border-border/60 bg-surface/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Template Downloads</h3>
              <p className="text-[11px] text-zinc-500">ZIP downloads count comparison.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="downloads" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Portfolio Items Management Database Table */}
      <Card className="p-6 border-border/60 bg-surface/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Repository Database</h3>
            <p className="text-xs text-zinc-500">Perform CRUD actions, inspect views, and toggle deploy status properties.</p>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto border border-border/60 rounded-xl bg-neutral-950/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 font-semibold">Portfolio Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Views</th>
                <th className="p-4 font-semibold">Downloads</th>
                <th className="p-4 font-semibold">Deploy Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 italic">No portfolios loaded. Click Upload Portfolio to start adding items.</td>
                </tr>
              ) : (
                portfolios.map(item => (
                  <tr key={item.id} className="border-b border-border/60 hover:bg-surface/20 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-neutral-900 border border-border flex items-center justify-center shrink-0">
                          <FileCode className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[12px]">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{(item.techStack || '').split(',').slice(0, 2).join(',')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-medium">{item.category}</td>
                    <td className="p-4 font-mono font-bold text-zinc-300">{item.views.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-zinc-300">{item.downloads.toLocaleString()}</td>
                    <td className="p-4">
                      {item.status === 'Active' && (
                        <Badge variant="success" dot>Active</Badge>
                      )}
                      {item.status === 'Review' && (
                        <Badge variant="warning" dot>Review</Badge>
                      )}
                      {item.status === 'Draft' && (
                        <Badge variant="default" dot>Draft</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="View properties"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Edit row details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-red-900 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog Modals */}
      <AnimatePresence>
        
        {/* 1. VIEW Modal details */}
        {activeModal === 'view' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">PORTFOLIO META PROFILE</span>
                  <h3 className="text-base font-bold text-white">{selectedItem.name}</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-neutral-950/40 p-4 border border-border/40 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 block">CATEGORY</span>
                  <span className="text-zinc-300 font-bold block mt-0.5">{selectedItem.category}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">STATUS</span>
                  <span className="block mt-0.5">
                    <Badge variant={selectedItem.status === 'Active' ? 'success' : selectedItem.status === 'Review' ? 'warning' : 'default'} dot>{selectedItem.status}</Badge>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">AGGREGATE VIEWS</span>
                  <span className="text-zinc-300 font-bold block mt-0.5">{selectedItem.views.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block">ZIP DOWNLOADS</span>
                  <span className="text-zinc-300 font-bold block mt-0.5">{selectedItem.downloads.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold block">Tech Stack</span>
                  <span className="text-zinc-300 font-semibold block mt-0.5 font-mono">{selectedItem.techStack}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold block">Description</span>
                  <p className="text-zinc-400 mt-0.5 leading-relaxed">{selectedItem.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. UPLOAD & EDIT Modal Form */}
        {(activeModal === 'upload' || activeModal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">{activeModal === 'upload' ? 'ADD NEW RESOURCE' : 'UPDATE CONFIGURATION'}</span>
                  <h3 className="text-base font-bold text-white">{activeModal === 'upload' ? 'Upload Portfolio Package' : 'Edit Portfolio Parameters'}</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form errors alerts */}
              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-[11px] rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  label="Portfolio Template Name"
                  placeholder="e.g. Geist Minimal Portfolio"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium focus:outline-none transition-all"
                    >
                      <option value="Minimal">Minimalist</option>
                      <option value="Developer">Developer Core</option>
                      <option value="Creative">Creative WebGL</option>
                      <option value="3D">3D Graphics</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Deployment Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium focus:outline-none transition-all"
                    >
                      <option value="Active">Active / Public</option>
                      <option value="Review">In Review</option>
                      <option value="Draft">Draft Mode</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Views Score"
                    type="number"
                    value={String(formViews)}
                    onChange={(e) => setFormViews(Number(e.target.value))}
                  />
                  <Input
                    label="Downloads Count"
                    type="number"
                    value={String(formDownloads)}
                    onChange={(e) => setFormDownloads(Number(e.target.value))}
                  />
                </div>

                <Input
                  label="Technology Stack (comma separated)"
                  placeholder="e.g. React, Next.js, WebGL"
                  value={formTechStack}
                  onChange={(e) => setFormTechStack(e.target.value)}
                />

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-400 block">Portfolio Package Description</label>
                  <textarea
                    placeholder="Short description highlighting UI design, styles, guides, and layouts..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all min-h-[70px]"
                  />
                </div>

                {activeModal === 'upload' && (
                  <div className="border border-dashed border-border/80 bg-neutral-950/20 p-4 rounded-xl text-center space-y-1.5 cursor-pointer hover:border-zinc-700 transition-colors">
                    <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                    <p className="text-[11px] text-zinc-400 font-semibold">Drop portfolio zip archive here or browse files</p>
                    <p className="text-[9px] text-zinc-600 font-mono">Max size: 45MB • Supported format: .zip</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
                {activeModal === 'upload' ? (
                  <Button variant="glow" size="sm" onClick={handleSaveUpload}>Save Resource</Button>
                ) : (
                  <Button variant="glow" size="sm" onClick={handleSaveEdit}>Apply Changes</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. DELETE Modal confirmation */}
        {activeModal === 'delete' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-9 h-9 rounded-full bg-red-950/40 border border-red-900/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-red-400 uppercase">Warning: Delete Action</h3>
                  <h4 className="text-sm font-bold text-white mt-0.5">Confirm Deletion</h4>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to permanently delete the portfolio item <strong className="text-white">"{selectedItem.name}"</strong>? This action will immediately remove its analytics from total count cards.
              </p>

              <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="glow" size="sm" onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-700 text-white shadow-red-950/20 border-red-900">Confirm Delete</Button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  )
}
