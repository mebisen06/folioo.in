import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ShieldCheck,
  Folder,
  DownloadCloud,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  UserX,
  UserCheck
} from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { SearchBar } from './ui/SearchBar'
import { Tabs } from './ui/Tabs'
import { DashboardCard } from './ui/DashboardCard'
import { cn } from '../utils/cn'

import { Loader2 } from 'lucide-react'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

export default function AdminDashboard() {
  const { data, loading, error, approvePortfolio, rejectPortfolio, deletePortfolio, suspendUser, activateUser, deleteUser } = useAdminDashboard()
  
  const portfolios = data?.portfolios || []
  const users = data?.users || []
  const stats = data?.stats || { totalUsers: 0, totalCreators: 0, totalPortfolios: 0, totalDownloads: 0 }
  
  const [activeTab, setActiveTab] = React.useState<string>('portfolios')
  
  // Filters & Search
  const [portfolioSearch, setPortfolioSearch] = React.useState('')
  const [portfolioFilter, setPortfolioFilter] = React.useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')
  
  const [userSearch, setUserSearch] = React.useState('')
  
  // Modal State
  const [modalData, setModalData] = React.useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | 'delete-portfolio' | 'suspend-user' | 'activate-user' | 'delete-user'
    targetId: string
    targetName: string
  }>({ isOpen: false, type: 'approve', targetId: '', targetName: '' })

  // --- Derived Metrics ---
  const { totalUsers, totalCreators, totalPortfolios, totalDownloads } = stats
  
  // --- Actions ---
  const handleAction = (type: typeof modalData.type, targetId: string, targetName: string) => {
    setModalData({ isOpen: true, type, targetId, targetName })
  }

  const confirmAction = async () => {
    const { type, targetId } = modalData
    
    try {
      if (type === 'approve') await approvePortfolio(targetId)
      else if (type === 'reject') await rejectPortfolio(targetId)
      else if (type === 'delete-portfolio') await deletePortfolio(targetId)
      else if (type === 'suspend-user') await suspendUser(targetId)
      else if (type === 'activate-user') await activateUser(targetId)
      else if (type === 'delete-user') await deleteUser(targetId)
    } catch (e) {
      console.error(e)
    }
    
    setModalData({ ...modalData, isOpen: false })
  }

  // --- Render Helpers ---
  const renderPortfolioTable = () => {
    const filtered = portfolios.filter(p => {
      const matchSearch = (p.name?.toLowerCase() || p.title.toLowerCase()).includes(portfolioSearch.toLowerCase()) || p.author.toLowerCase().includes(portfolioSearch.toLowerCase())
      const matchFilter = portfolioFilter === 'All' || p.status === portfolioFilter
      return matchSearch && matchFilter
    })

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/30 p-4 border border-border/60 rounded-xl">
          <div className="w-full sm:max-w-xs">
            <SearchBar value={portfolioSearch} onChange={e => setPortfolioSearch(e.target.value)} onClear={() => setPortfolioSearch('')} placeholder="Search portfolios or authors..." />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setPortfolioFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border whitespace-nowrap",
                  portfolioFilter === f ? "bg-accent/10 border-accent text-accent" : "bg-neutral-900 border-border text-zinc-400 hover:text-white"
                )}
              >
                {f} {f !== 'All' && `(${portfolios.filter(p => p.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border/60 rounded-xl bg-neutral-950/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 font-semibold">Portfolio Name</th>
                <th className="p-4 font-semibold">Creator</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500 italic">No portfolios match current filters.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-border/60 hover:bg-surface/20 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-neutral-900 border border-border flex items-center justify-center shrink-0">
                          <Folder className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[12px]">{item.name || item.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-medium">{item.author}</td>
                    <td className="p-4 font-mono text-zinc-500">{item.submittedAt}</td>
                    <td className="p-4">
                      {item.status === 'Approved' && <Badge variant="success" dot>Approved</Badge>}
                      {item.status === 'Pending' && <Badge variant="warning" dot>Pending</Badge>}
                      {item.status === 'Rejected' && <Badge variant="error" dot>Rejected</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Pending' && (
                          <>
                            <button onClick={() => handleAction('approve', String(item.id), item.name || item.title)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-emerald-500 hover:text-emerald-400 text-zinc-400 transition-all cursor-pointer" title="Approve">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleAction('reject', String(item.id), item.name || item.title)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-red-500 hover:text-red-400 text-zinc-400 transition-all cursor-pointer" title="Reject">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleAction('delete-portfolio', String(item.id), item.name || item.title)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-red-900 hover:text-red-400 text-zinc-400 transition-all cursor-pointer" title="Delete">
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
      </div>
    )
  }

  const renderUserTable = () => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/30 p-4 border border-border/60 rounded-xl">
          <div className="w-full sm:max-w-xs">
            <SearchBar value={userSearch} onChange={e => setUserSearch(e.target.value)} onClear={() => setUserSearch('')} placeholder="Search users by name or email..." />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border/60 rounded-xl bg-neutral-950/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Portfolios</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500 italic">No users found.</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="border-b border-border/60 hover:bg-surface/20 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-border flex items-center justify-center shrink-0 font-bold text-accent">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-[12px]">{user.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'Creator' ? <Badge variant="accent">{user.role}</Badge> : <Badge variant="default">{user.role}</Badge>}
                    </td>
                    <td className="p-4 font-mono font-bold text-zinc-300">{user.portfoliosCount}</td>
                    <td className="p-4">
                      {user.status === 'Active' ? <span className="text-emerald-400 font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active</span> : <span className="text-red-400 font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Suspended</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'Active' ? (
                          <button onClick={() => handleAction('suspend-user', user.id, user.name)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-yellow-600 hover:text-yellow-500 text-zinc-400 transition-all cursor-pointer" title="Suspend User">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => handleAction('activate-user', user.id, user.name)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-emerald-500 hover:text-emerald-400 text-zinc-400 transition-all cursor-pointer" title="Activate User">
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleAction('delete-user', user.id, user.name)} className="p-1.5 rounded-lg border border-border bg-neutral-900 hover:border-red-900 hover:text-red-400 text-zinc-400 transition-all cursor-pointer" title="Delete User">
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
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" dot>Admin Layer</Badge>
            <span className="text-[10px] font-mono text-zinc-500 font-bold">CORE SYSTEM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Dashboard</h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Manage global platform operations, review incoming portfolio submissions, and administrate user accounts securely.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-zinc-500 gap-4 border border-border/60 rounded-xl bg-surface/30">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-semibold">Loading admin data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 text-red-400 gap-4 border border-border/60 rounded-xl bg-surface/30">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : (
        <>
          {/* High-level Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Users" 
          value={totalUsers.toLocaleString()} 
          icon={<Users className="w-full h-full" />}
          trend={{ value: '+12%', direction: 'up' }}
          className="bg-surface/20"
        />
        <DashboardCard 
          title="Total Creators" 
          value={totalCreators.toLocaleString()} 
          icon={<ShieldCheck className="w-full h-full" />}
          trend={{ value: '+8%', direction: 'up' }}
          className="bg-surface/20"
        />
        <DashboardCard 
          title="Total Portfolios" 
          value={totalPortfolios.toLocaleString()} 
          icon={<Folder className="w-full h-full" />}
          trend={{ value: '+24%', direction: 'up' }}
          className="bg-surface/20"
        />
        <DashboardCard 
          title="Global Downloads" 
          value={totalDownloads.toLocaleString()} 
          icon={<DownloadCloud className="w-full h-full" />}
          trend={{ value: '+42%', direction: 'up' }}
          sparkline={[10, 20, 15, 30, 45, 60, 80]}
          className="bg-surface/20"
        />
      </div>

      {/* Tabs System */}
      <div className="bg-surface/20 p-2 rounded-xl border border-border/60 inline-flex">
        <Tabs 
          options={[
            { id: 'portfolios', label: 'Portfolio Management' },
            { id: 'users', label: 'User Administration' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'portfolios' ? renderPortfolioTable() : renderUserTable()}
        </motion.div>
      </AnimatePresence>
      </>)}

      {/* Action Modals */}
      <AnimatePresence>
        {modalData.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalData({ ...modalData, isOpen: false })} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  (modalData.type === 'approve' || modalData.type === 'activate-user') && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  modalData.type === 'reject' && "bg-orange-500/10 border-orange-500/20 text-orange-400",
                  (modalData.type === 'delete-portfolio' || modalData.type === 'delete-user' || modalData.type === 'suspend-user') && "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Confirm Action</h3>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {modalData.type === 'approve' && 'Approve Portfolio'}
                    {modalData.type === 'reject' && 'Reject Portfolio'}
                    {modalData.type === 'delete-portfolio' && 'Delete Portfolio'}
                    {modalData.type === 'suspend-user' && 'Suspend User'}
                    {modalData.type === 'activate-user' && 'Activate User'}
                    {modalData.type === 'delete-user' && 'Delete User'}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to perform this action on <strong className="text-white">"{modalData.targetName}"</strong>?
                {modalData.type.includes('delete') && ' This action is irreversible.'}
              </p>

              <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setModalData({ ...modalData, isOpen: false })}>Cancel</Button>
                <Button 
                  variant="glow" 
                  size="sm" 
                  onClick={confirmAction} 
                  className={cn(
                    (modalData.type === 'delete-portfolio' || modalData.type === 'delete-user' || modalData.type === 'suspend-user') && "bg-red-650 hover:bg-red-700 text-white shadow-red-950/20 border-red-900"
                  )}
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
