import * as React from 'react'
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
  sparkline?: number[] // array of values between 0 and 100 to draw a custom SVG sparkline
}

export const DashboardCard = ({
  title,
  value,
  description,
  trend,
  icon,
  isLoading = false,
  className,
  sparkline
}: DashboardCardProps) => {
  return (
    <Card interactive glow variant="default" className={cn('relative', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
            {title}
          </span>
          {icon && (
            <div className="text-zinc-500 w-4 h-4 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mt-4 flex flex-col gap-2 animate-shimmer">
            <div className="h-8 w-24 bg-zinc-800 rounded-md" />
            <div className="h-4 w-36 bg-zinc-800 rounded-md" />
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-primary-text">
                {value}
              </span>
              
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                    trend.direction === 'up' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10',
                    trend.direction === 'down' && 'bg-red-500/10 text-red-400 border border-red-500/10',
                    trend.direction === 'neutral' && 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  )}
                >
                  {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                  {trend.value}
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-secondary-text mt-1 font-medium">
                {description}
              </p>
            )}

            {/* Sparkline Graphic rendering */}
            {sparkline && sparkline.length > 0 && (
              <div className="mt-5 h-8 w-full">
                <svg className="w-full h-full" viewBox={`0 0 100 30`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background Fill area */}
                  <path
                    d={`
                      M 0 30 
                      ${sparkline.map((val, idx) => `L ${(idx / (sparkline.length - 1)) * 100} ${30 - (val / 100) * 25}`).join(' ')} 
                      L 100 30 Z
                    `}
                    fill="url(#sparkline-grad)"
                  />
                  
                  {/* Line stroke */}
                  <path
                    d={sparkline.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx / (sparkline.length - 1)) * 100} ${30 - (val / 100) * 25}`).join(' ')}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

DashboardCard.displayName = 'DashboardCard'
