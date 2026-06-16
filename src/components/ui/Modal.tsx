import * as React from 'react'
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

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md'
}: ModalProps) => {
  // Listen for escape key to close
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={cn(
              'relative w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col text-left',
              sizes[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-desc' : undefined}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border/50">
              <div>
                {title && (
                  <h3 id="modal-title" className="text-base font-semibold text-primary-text">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="modal-desc" className="text-xs text-secondary-text mt-1">
                    {description}
                  </p>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-primary-text p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

Modal.displayName = 'Modal'

export const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-end gap-3 p-5 border-t border-border/50 bg-neutral-950/20', className)} {...props} />
)
ModalFooter.displayName = 'ModalFooter'
