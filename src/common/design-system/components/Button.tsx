import { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'font-semibold transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'border',
    ]

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white border-blue-600',
        'hover:bg-blue-700 hover:border-blue-700',
        'focus:ring-blue-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-gray-100 text-gray-900 border-gray-300',
        'hover:bg-gray-200 hover:border-gray-400',
        'focus:ring-gray-500',
        'shadow-sm hover:shadow-md',
      ],
      ghost: [
        'bg-transparent text-gray-700 border-transparent',
        'hover:bg-gray-100',
        'focus:ring-gray-500',
      ],
      danger: [
        'bg-red-600 text-white border-red-600',
        'hover:bg-red-700 hover:border-red-700',
        'focus:ring-red-500',
        'shadow-sm hover:shadow-md',
      ],
      outline: [
        'bg-transparent text-gray-700 border-gray-300',
        'hover:bg-gray-50 hover:border-gray-400',
        'focus:ring-gray-500',
        'shadow-sm hover:shadow-md',
      ],
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isLoading && 'cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
