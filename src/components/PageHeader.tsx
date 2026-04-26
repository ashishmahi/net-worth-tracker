import * as React from 'react'
import { cn } from '@/lib/utils'

export type PageHeaderProps = {
  title: string
  meta?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, meta, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-start min-[768px]:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold">{title}</h1>
        {meta}
      </div>
      {action != null && (
        <div
          className={cn(
            'w-full min-w-0 min-[768px]:w-auto shrink-0',
            'min-[768px]:flex min-[768px]:justify-end'
          )}
        >
          {action}
        </div>
      )}
    </div>
  )
}
