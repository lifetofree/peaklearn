import { type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card: FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-border bg-card shadow-[0_1px_4px_0_rgb(0_0_0/0.06)]',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6 pb-0', className)} {...props}>
    {children}
  </div>
)

export const CardTitle: FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription: FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>
    {children}
  </p>
)

export const CardContent: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6 pt-4', className)} {...props}>
    {children}
  </div>
)
