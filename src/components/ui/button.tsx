import { type FC, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  children: ReactNode
}

const variantStyles = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/88 active:scale-[0.97]',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/88 active:scale-[0.97]',
  outline:
    'border border-border bg-transparent hover:bg-secondary text-foreground',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/60',
  ghost:
    'text-muted-foreground hover:bg-secondary hover:text-foreground',
  link:
    'text-primary underline-offset-4 hover:underline',
}

const sizeStyles = {
  default: 'h-9 px-4 text-sm',
  sm:      'h-8 px-3 text-xs',
  lg:      'h-10 px-6 text-sm',
  icon:    'h-9 w-9',
}

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  asChild = false,
  className,
  children,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
