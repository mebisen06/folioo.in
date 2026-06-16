import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string // e.g. "⌘K"
  onClear?: () => void
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onChange, shortcut = '⌘K', onClear, placeholder = 'Search...', ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const activeRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    // Listen for Ctrl+K / Cmd+K to focus search
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

SearchBar.displayName = 'SearchBar'
