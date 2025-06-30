import { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'rounded-lg border transition-all duration-200',
    ]

    const variantClasses = {
      default: [
        'bg-white border-gray-200 shadow-sm',
      ],
      glass: [
        'bg-white/95 border-gray-200',
        'shadow-md',
      ],
      elevated: [
        'bg-white border-gray-200',
        'shadow-lg',
      ],
    }

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const hoverClasses = hover
      ? [
          'hover:shadow-lg',
          'hover:border-gray-300',
          'cursor-pointer',
        ]
      : []

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
