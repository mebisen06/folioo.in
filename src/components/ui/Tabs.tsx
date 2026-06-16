import * as React from 'react'
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
      <div className={cn(
        'flex items-center gap-1.5',
        variant === 'pill' && 'bg-surface/50 border border-border/80 p-1 rounded-lg'
      )}>
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

Tabs.displayName = 'Tabs'
