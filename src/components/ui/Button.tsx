import * as React from 'react'
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
        {...(props as any)}
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

Button.displayName = 'Button'
