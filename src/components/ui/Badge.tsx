import * as React from 'react'
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
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'
