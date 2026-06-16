import * as React from 'react'
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
          {...(props as any)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], borderGlow, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-4 border-b border-border/50', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-4', className)} {...props} />
)
CardContent.displayName = 'CardContent'

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0 flex items-center border-t border-border/30 mt-4', className)} {...props} />
)
CardFooter.displayName = 'CardFooter'
