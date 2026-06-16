export const codeSnippets = {
  Button: `import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
    
    const variants = {
      primary: 'bg-primary-text text-background hover:bg-zinc-200 active:bg-zinc-300 border border-transparent',
      secondary: 'bg-surface hover:bg-surface-hover active:bg-surface-active text-primary-text border border-border',
      outline: 'bg-transparent border border-border text-primary-text hover:bg-surface hover:border-border-hover',
      ghost: 'bg-transparent text-secondary-text hover:text-primary-text hover:bg-surface',
      glow: 'bg-accent text-white hover:bg-accent-hover shadow-glow hover:shadow-glow-hover border border-accent/30'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    }

    return (
      <motion.button
        ref={ref as any}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {!isLoading && rightIcon ? (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        ) : null}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'`,

  Card: `import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  glow?: boolean
  variant?: 'default' | 'glass' | 'accent'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, glow = false, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl border text-primary-text overflow-hidden transition-all duration-300'
    const borderGlow = glow 
      ? 'border-accent/10 hover:border-accent/30' 
      : 'border-border hover:border-border-hover'

    const variants = {
      default: 'bg-surface',
      glass: 'glass border-border',
      accent: 'glass-accent border-accent/20'
    }

    if (interactive) {
      return (
        <motion.div
          ref={ref as any}
          whileHover={{ 
            scale: 1.01,
            y: -2,
            boxShadow: glow 
              ? '0 10px 30px -10px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2)'
              : '0 10px 30px -10px rgba(0, 0, 0, 0.7)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(baseStyles, variants[variant], borderGlow, 'glow-card cursor-pointer', className)}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={cn(baseStyles, variants[variant], borderGlow, className)} {...props}>
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-4 border-b border-border/50', className)} {...props} />
)
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-4', className)} {...props} />
)
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0 flex items-center border-t border-border/30 mt-4', className)} {...props} />
)`,

  Input: `import * as React from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, helperText, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase select-none">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-surface border border-border text-sm text-primary-text rounded-md px-4 py-2.5 transition-all duration-200 outline-none placeholder:text-zinc-500",
              "focus:border-accent focus:ring-1 focus:ring-accent",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/50",
              disabled && "opacity-50 cursor-not-allowed bg-neutral-900/50",
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3.5 text-zinc-500 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-xs text-red-400 font-medium mt-0.5">
            {error}
          </span>
        )}
        
        {!error && helperText && (
          <span className="text-xs text-zinc-500 mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'`,

  SearchBar: `import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string
  onClear?: () => void
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onChange, shortcut = '⌘K', onClear, placeholder = 'Search...', ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const activeRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          activeRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeRef])

    const hasValue = value !== undefined && value !== null && value !== ''

    return (
      <div className="relative flex items-center w-full group">
        <div className="absolute left-3.5 text-zinc-500 pointer-events-none transition-colors group-focus-within:text-accent flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          ref={activeRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full bg-surface border border-border text-sm text-primary-text rounded-lg pl-11 pr-16 py-2.5 transition-all duration-300 outline-none placeholder:text-zinc-500",
            "focus:border-accent/80 focus:ring-1 focus:ring-accent/40 focus:shadow-glow",
            className
          )}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-zinc-500 hover:text-primary-text p-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          
          {shortcut && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 select-none rounded border border-border bg-neutral-900 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
    )
  }
)
SearchBar.displayName = 'SearchBar'`,

  Badge: `import * as React from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent'
  dot?: boolean
}

export const Badge = ({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border border-transparent'
  
  const variants = {
    default: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    accent: 'bg-accent/10 text-accent border-accent/25 shadow-[0_0_10px_rgba(59,130,246,0.05)]'
  }

  const dotColors = {
    default: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    info: 'bg-sky-400',
    accent: 'bg-accent'
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  )
}
Badge.displayName = 'Badge'`,

  Tabs: `import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface TabOption {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface TabsProps {
  options: TabOption[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  variant?: 'pill' | 'underline'
}

export const Tabs = ({ options, activeTab, onChange, className, variant = 'pill' }: TabsProps) => {
  return (
    <div className={cn('relative flex items-center border-b border-border/40 pb-px', className)}>
      <div className={cn('flex items-center gap-1.5', variant === 'pill' && 'bg-surface/50 border border-border/80 p-1 rounded-lg')}>
        {options.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-semibold transition-colors rounded-md select-none cursor-pointer flex items-center gap-2',
                variant === 'underline' && 'rounded-none pb-3 px-1 border-b-2 border-transparent text-secondary-text hover:text-primary-text',
                variant === 'pill' && 'text-secondary-text hover:text-primary-text',
                isActive && variant === 'underline' && 'text-primary-text font-semibold',
                isActive && variant === 'pill' && 'text-primary-text'
              )}
            >
              {variant === 'pill' && isActive && (
                <motion.div
                  layoutId="active-tab-indicator-pill"
                  className="absolute inset-0 bg-neutral-800 border border-neutral-700/50 rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="active-tab-indicator-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {tab.icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{tab.icon}</span>}
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
Tabs.displayName = 'Tabs'`,

  Modal: `import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = ({ isOpen, onClose, title, description, children, className, size = 'md' }: ModalProps) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={cn('relative w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col text-left', sizes[size], className)}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between p-5 border-b border-border/50">
              <div>
                {title && <h3 className="text-base font-semibold text-primary-text">{title}</h3>}
                {description && <p className="text-xs text-secondary-text mt-1">{description}</p>}
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-primary-text p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
Modal.displayName = 'Modal'

export const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-3 p-5 border-t border-border/50 bg-neutral-950/20', className)} {...props} />
)`,

  Table: `import * as React from 'react'
import { cn } from '../../utils/cn'

export interface TableColumn<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  keyExtractor: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  isLoading?: boolean
  className?: string
  emptyState?: React.ReactNode
}

export function Table<T>({ data, columns, keyExtractor, onRowClick, isLoading, className, emptyState }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
      <table className={cn('w-full border-collapse text-left text-sm text-zinc-300', className)}>
        <thead>
          <tr className="border-b border-border bg-neutral-900/40 text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-6 py-3.5 font-semibold', col.className)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">Loading...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">{emptyState || 'No results found.'}</td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                onClick={() => onRowClick?.(row)}
                className={cn('transition-colors hover:bg-neutral-900/30', onRowClick && 'cursor-pointer')}
              >
                {columns.map((col, colIdx) => {
                  const content = typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)
                  return <td key={colIdx} className={cn('px-6 py-4 border-t border-border/40 font-medium text-zinc-300', col.className)}>{content}</td>
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}`,

  DashboardCard: `import * as React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Card, CardContent } from './Card'
import { cn } from '../../utils/cn'

export interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  isLoading?: boolean
  className?: string
  sparkline?: number[]
}

export const DashboardCard = ({ title, value, description, trend, icon, isLoading = false, className, sparkline }: DashboardCardProps) => {
  return (
    <Card interactive glow variant="default" className={cn('relative', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">{title}</span>
          {icon && <div className="text-zinc-500 w-4 h-4">{icon}</div>}
        </div>
        {isLoading ? (
          <div className="mt-4 flex flex-col gap-2 animate-shimmer">
            <div className="h-8 w-24 bg-zinc-800 rounded-md" />
            <div className="h-4 w-36 bg-zinc-800 rounded-md" />
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-primary-text">{value}</span>
              {trend && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  trend.direction === 'up' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10',
                  trend.direction === 'down' && 'bg-red-500/10 text-red-400 border border-red-500/10',
                  trend.direction === 'neutral' && 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                )}>
                  {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                  {trend.value}
                </span>
              )}
            </div>
            {description && <p className="text-xs text-secondary-text mt-1 font-medium">{description}</p>}
            {sparkline && sparkline.length > 0 && (
              <div className="mt-5 h-8 w-full">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={\`M 0 30 \${sparkline.map((val, idx) => \`L \${(idx / (sparkline.length - 1)) * 100} \${30 - (val / 100) * 25}\`).join(' ')} L 100 30 Z\`} fill="url(#sparkline-grad)" />
                  <path d={sparkline.map((val, idx) => \`\${idx === 0 ? 'M' : 'L'} \${(idx / (sparkline.length - 1)) * 100} \${30 - (val / 100) * 25}\`).join(' ')} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}`
}
