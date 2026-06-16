import * as React from 'react'
import { motion } from 'framer-motion'
import {
  UploadCloud,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FileCode,
  GitBranch,
  Globe,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'
import { cn } from '../utils/cn'

// --- Types ---
export interface PortfolioDraft {
  name: string
  description: string
  githubUrl: string
  liveDemoUrl: string
  category: string
  techStack: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  setupGuide: string
  customizationGuide: string
  deploymentGuide: string
}

const DEFAULT_DRAFT: PortfolioDraft = {
  name: '',
  description: '',
  githubUrl: '',
  liveDemoUrl: '',
  category: 'Developer',
  techStack: '',
  difficulty: 'Intermediate',
  setupGuide: '',
  customizationGuide: '',
  deploymentGuide: ''
}

// Validation errors map
type FormErrors = Partial<Record<keyof PortfolioDraft, string>>

export default function PortfolioUpload() {
  // Main form state
  const [formData, setFormData] = React.useState<PortfolioDraft>(DEFAULT_DRAFT)
  const [errors, setErrors] = React.useState<FormErrors>({})

  // Auto-save state
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Media states
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null)
  const [screenshotUrls, setScreenshotUrls] = React.useState<string[]>([])

  // Load from local storage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_upload_draft')
      if (saved) {
        setFormData(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Failed to load draft from localStorage:', err)
    }
  }, [])

  // Auto-save debounce effect
  React.useEffect(() => {
    setSaveStatus('saving')
    const handler = setTimeout(() => {
      localStorage.setItem('portfolio_upload_draft', JSON.stringify(formData))
      setSaveStatus('saved')
      
      // Reset saved indicator after a few seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    }, 1000)

    return () => clearTimeout(handler)
  }, [formData])

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // clear error for the field
    if (errors[name as keyof PortfolioDraft]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setThumbnailUrl(URL.createObjectURL(file))
      }
    }
  }

  const handleScreenshotsDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newUrls: string[] = []
      Array.from(e.dataTransfer.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          newUrls.push(URL.createObjectURL(file))
        }
      })
      setScreenshotUrls(prev => [...prev, ...newUrls])
    }
  }

  const removeScreenshot = (indexToRemove: number) => {
    setScreenshotUrls(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Portfolio Name is required.'
    if (!formData.description.trim()) newErrors.description = 'Description is required.'
    if (!formData.techStack.trim()) newErrors.techStack = 'Tech Stack is required.'
    if (!formData.githubUrl.trim()) newErrors.githubUrl = 'GitHub URL is required.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePublish = () => {
    if (validateForm()) {
      alert('Validation passed! Ready for upload to server.')
      // Proceed with actual API upload logic here
    } else {
      // Scroll to top or show global error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6 sticky top-0 bg-background/90 backdrop-blur-md z-40 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" dot>Creator Tools</Badge>
            {saveStatus === 'saving' && (
              <span className="text-[10px] font-mono text-zinc-500 font-bold flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> SAVING DRAFT...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> DRAFT SAVED
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Portfolio</h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Publish your latest portfolio template to the community gallery. Provide comprehensive details, guides, and high-quality preview images.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button variant="outline" onClick={() => localStorage.removeItem('portfolio_upload_draft')}>
            Discard Draft
          </Button>
          <Button variant="glow" onClick={handlePublish} className="gap-2">
            <UploadCloud className="w-4 h-4" /> Publish to Gallery
          </Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Please correct the following errors</h4>
            <ul className="text-xs mt-1 list-disc list-inside opacity-80">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Basic Information Section */}
      <Card className="border-border/60 bg-surface/30">
        <CardHeader className="border-b border-border/40 bg-neutral-900/40 pb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-white tracking-tight">Basic Details</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Core metadata and classification parameters.</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Portfolio Name"
              name="name"
              placeholder="e.g. Next.js Minimalist Dev"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Category Classification</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium focus:outline-none transition-all appearance-none"
              >
                <option value="Developer">Developer</option>
                <option value="Minimal">Minimalist</option>
                <option value="Creative">Creative / WebGL</option>
                <option value="Agency">Agency / Studio</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Short Description</label>
            <textarea
              name="description"
              placeholder="Briefly describe the template aesthetic, purpose, and key features..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={cn(
                "w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium placeholder-zinc-600 focus:outline-none transition-all resize-none",
                errors.description && "border-red-900/50 bg-red-950/10 focus:border-red-500"
              )}
            />
            {errors.description && <span className="text-[10px] text-red-500 font-semibold">{errors.description}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="GitHub Repository URL"
              name="githubUrl"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={handleChange}
              error={errors.githubUrl}
            />
            <Input
              label="Live Demo URL"
              name="liveDemoUrl"
              placeholder="https://my-demo.vercel.app"
              value={formData.liveDemoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Technology Stack"
              name="techStack"
              placeholder="e.g. React, Next.js, TailwindCSS"
              value={formData.techStack}
              onChange={handleChange}
              error={errors.techStack}
            />
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Setup Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full text-xs bg-neutral-900 border border-border hover:border-zinc-800 focus:border-accent p-3.5 rounded-lg text-white font-medium focus:outline-none transition-all appearance-none"
              >
                <option value="Beginner">Beginner (1-5 mins)</option>
                <option value="Intermediate">Intermediate (Custom config required)</option>
                <option value="Advanced">Advanced (Complex integrations)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload Section */}
      <Card className="border-border/60 bg-surface/30">
        <CardHeader className="border-b border-border/40 bg-neutral-900/40 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Media Assets</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Upload high-quality visual previews of your template.</p>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          {/* Thumbnail Dropzone */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-bold text-white">Cover Thumbnail</label>
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Required • 16:9</span>
            </div>
            
            <div 
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
              onDrop={handleThumbnailDrop}
              className={cn(
                "border-2 border-dashed border-border/80 hover:border-violet-500/50 bg-neutral-950/40 rounded-xl transition-all cursor-pointer overflow-hidden relative group",
                thumbnailUrl ? "p-0" : "p-12"
              )}
              onClick={() => {
                // Mock click to upload
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e: any) => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailUrl(URL.createObjectURL(e.target.files[0]))
                  }
                }
                input.click()
              }}
            >
              {thumbnailUrl ? (
                <div className="aspect-video w-full relative">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <UploadCloud className="w-4 h-4" /> Change Cover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Drag & drop your cover image here</p>
                    <p className="text-xs text-zinc-500 mt-1">or click to browse files. Max 5MB.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Dropzone */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-bold text-white">Gallery Screenshots</label>
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Optional • Multi-select</span>
            </div>

            <div 
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
              onDrop={handleScreenshotsDrop}
              className="border border-dashed border-border/80 hover:border-accent/50 bg-neutral-950/20 rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.multiple = true
                input.onchange = (e: any) => {
                  if (e.target.files) {
                    const newUrls: string[] = []
                    Array.from(e.target.files).forEach((file: any) => newUrls.push(URL.createObjectURL(file)))
                    setScreenshotUrls(prev => [...prev, ...newUrls])
                  }
                }
                input.click()
              }}
            >
              <UploadCloud className="w-6 h-6 text-zinc-500" />
              <p className="text-xs text-zinc-400">Drag & drop multiple screenshots or click to browse</p>
            </div>

            {screenshotUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {screenshotUrls.map((url, idx) => (
                  <div key={idx} className="aspect-video rounded-lg border border-border/60 overflow-hidden relative group">
                    <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeScreenshot(idx) }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guides & Documentation Section */}
      <Card className="border-border/60 bg-surface/30">
        <CardHeader className="border-b border-border/40 bg-neutral-900/40 pb-4">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Documentation & Guides</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Provide clear instructions on how users can install and use your portfolio template.</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Setup Guide
            </label>
            <textarea
              name="setupGuide"
              placeholder="e.g. Provide npm install and dependency requirements..."
              value={formData.setupGuide}
              onChange={handleChange}
              rows={4}
              className="w-full text-xs font-mono bg-neutral-950 border border-border hover:border-zinc-800 focus:border-accent p-4 rounded-xl text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Customization Guide
            </label>
            <textarea
              name="customizationGuide"
              placeholder="e.g. How to change the accent color, update personal data in config.ts..."
              value={formData.customizationGuide}
              onChange={handleChange}
              rows={4}
              className="w-full text-xs font-mono bg-neutral-950 border border-border hover:border-zinc-800 focus:border-accent p-4 rounded-xl text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Deployment Guide
            </label>
            <textarea
              name="deploymentGuide"
              placeholder="e.g. Recommended hosting platforms (Vercel/Netlify), build commands..."
              value={formData.deploymentGuide}
              onChange={handleChange}
              rows={4}
              className="w-full text-xs font-mono bg-neutral-950 border border-border hover:border-zinc-800 focus:border-accent p-4 rounded-xl text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all resize-y"
            />
          </div>

        </CardContent>
      </Card>
      
    </div>
  )
}
