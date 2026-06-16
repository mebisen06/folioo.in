import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Info,
  Loader2
} from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { SearchBar } from './ui/SearchBar'
import { usePortfolios } from '../hooks/usePortfolios'

export interface PortfolioGalleryProps {
  onNavigate: (viewId: string, portfolioId?: number | string) => void
}



export default function PortfolioGallery({ onNavigate }: PortfolioGalleryProps) {
  const { portfolios, loading, error } = usePortfolios()

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All')
  const [selectedTech, setSelectedTech] = React.useState<string[]>([])
  


  // Categories list
  const categories = ['All', 'Student', 'Frontend', 'Backend', 'Full Stack', 'Cybersecurity', 'AI / ML', 'Data Science', 'Minimal', 'Creative', '3D']
  
  // Difficulty levels
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  // Tech stack list for tags selector
  const availableTech = ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Node.js', 'Python', 'Three.js', 'GraphQL', 'Docker', 'Framer Motion']

  // Handle tech selector toggle
  const toggleTechFilter = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech))
    } else {
      setSelectedTech([...selectedTech, tech])
    }
  }

  // Filtered portfolio items logic
  // Filtered portfolio items logic with useMemo optimization
  const filteredPortfolios = React.useMemo(() => {
    return portfolios.filter(item => {
      // Search Query Match (Title, Creator, Tech Stack)
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category Match
      const matchesCategory = 
        selectedCategory === 'All' || 
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'AI / ML' && item.category === 'AI / ML')

      // Difficulty Match
      const matchesDifficulty = 
        selectedDifficulty === 'All' || 
        item.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()

      // Tech Stack Array Match (item must contain all selected tech tags)
      const matchesTech = 
        selectedTech.length === 0 || 
        selectedTech.every(t => item.tags?.includes(t))

      return matchesSearch && matchesCategory && matchesDifficulty && matchesTech
    })
  }, [portfolios, searchQuery, selectedCategory, selectedDifficulty, selectedTech])

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col relative overflow-x-hidden">
      
      {/* Visual background details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1f1f1f_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

      {/* Header section (fixed) */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/60 glass z-40 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </button>
        </div>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-glow">F</div>
          <span className="font-extrabold tracking-tight text-base">Folioo</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full pt-28 pb-24 px-4 sm:px-6 lg:px-8 z-10 flex-1 space-y-10">
        
        {/* Title and Search section */}
        <div className="space-y-4 text-center md:text-left">
          <Badge variant="accent">Gallery</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Discover Student Portfolios
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Explore and clone professional, recruiter-verified templates. Filter by category, tools, or complexity to find your base layout.
          </p>
        </div>

        {/* Filters Panel Card */}
        <Card className="p-6 border-border/60 bg-surface/50 space-y-6">
          
          {/* Row 1: Search & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Search Portfolios</label>
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search templates, creators, or technologies..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Difficulty Level</label>
              <div className="flex bg-neutral-900 border border-border p-0.5 rounded-lg w-full">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`
                      flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer
                      ${selectedDifficulty === diff 
                        ? 'bg-surface border border-border text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'}
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Category Filters pills */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Category Filters</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer
                    ${selectedCategory === cat 
                      ? 'bg-accent/10 border-accent text-accent shadow-glow-sm' 
                      : 'bg-neutral-900 border-border text-zinc-400 hover:text-white hover:border-zinc-700'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Tech Stack Tags filter */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">Filter by Tech Stack (Multi-Select)</label>
            <div className="flex flex-wrap gap-2">
              {availableTech.map(tech => {
                const isSelected = selectedTech.includes(tech)
                return (
                  <button
                    key={tech}
                    onClick={() => toggleTechFilter(tech)}
                    className={`
                      px-3 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5
                      ${isSelected 
                        ? 'bg-accent border-accent text-white shadow-glow-sm' 
                        : 'bg-neutral-950/40 border-border/80 text-zinc-500 hover:text-zinc-300'}
                    `}
                  >
                    {tech}
                    {isSelected && <span className="text-[8px]">●</span>}
                  </button>
                )
              })}
              {selectedTech.length > 0 && (
                <button 
                  onClick={() => setSelectedTech([])} 
                  className="text-[10px] text-zinc-500 hover:text-white font-bold ml-2 underline cursor-pointer"
                >
                  Clear Tech Tags
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Found <strong className="text-white">{filteredPortfolios.length}</strong> portfolio templates</span>
          {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedTech.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedDifficulty('All')
                setSelectedTech([])
              }}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Portfolio Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 text-zinc-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm font-semibold">Loading portfolios...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-24 text-red-400 gap-4">
            <Info className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredPortfolios.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPortfolios.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card interactive glow className="h-full border-border/60 flex flex-col justify-between overflow-hidden relative">
                    <div>
                      {/* Gradient Thumbnail Mockup */}
                      <div className={`h-40 w-full bg-gradient-to-tr ${item.gradient} border-b border-border/50 relative p-4 flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 text-[8px] bg-background/80 border border-border/80 rounded-md font-bold text-zinc-400">
                            {item.category.toUpperCase()}
                          </span>
                          <Badge 
                            variant="info"
                            className="text-[9px]"
                          >
                            {/* We don't have difficulty in new interface, so omit or use another field */}
                            {item.category}
                          </Badge>
                        </div>
                        {/* Abstract floating browser UI elements to represent screenshot mockup */}
                        <div className="bg-surface/90 border border-border/80 rounded-lg p-2.5 shadow-xl w-4/5 mx-auto -mb-6 space-y-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                          </div>
                          <div className="h-2 w-16 bg-zinc-800 rounded-sm" />
                          <div className="h-1 w-full bg-zinc-900 rounded-sm" />
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-5 pt-8 space-y-3.5">
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                          <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">by {item.author}</span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>

                        {/* Tech tags list */}
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.map(tech => (
                            <span key={tech} className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-neutral-900 border border-border/40 rounded text-zinc-500">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats and button footer */}
                    <div className="p-5 border-t border-border/40 bg-[#111111]/30 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono font-bold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-zinc-600" /> {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-zinc-600" /> {item.downloads}
                        </span>
                      </div>
                      <Button 
                        variant="glow" 
                        size="sm" 
                        onClick={() => onNavigate('details', item.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Card className="p-12 text-center border-border/60 bg-surface/30 max-w-xl mx-auto space-y-4">
            <Info className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No matching portfolios found</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We couldn't find any portfolios matching your query. Try adjusting your search query, or clear your tag multi-selectors to expand the search scope.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedDifficulty('All')
                setSelectedTech([])
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}

      </main>

    </div>
  )
}
