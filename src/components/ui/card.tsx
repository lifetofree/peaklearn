import { type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card: FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn('rounded-xl border border-border bg-card', className)}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-5 pt-5 pb-0', className)} {...props}>
    {children}
  </div>
)

export const CardTitle: FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className, children, ...props
}) => (
  <h3 className={cn('text-sm font-semibold tracking-tight', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription: FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className, children, ...props
}) => (
  <p className={cn('text-xs text-muted-foreground mt-0.5', className)} {...props}>
    {children}
  </p>
)

export const CardContent: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-5 py-4', className)} {...props}>
    {children}
  </div>
)
