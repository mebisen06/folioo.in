import * as React from 'react'
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

Input.displayName = 'Input'
