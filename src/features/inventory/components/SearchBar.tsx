import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/shared/hooks'
import { cn } from '@/shared/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Tìm kiếm vải, mã sản phẩm, vị trí kho...', 
  className 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  
  // Debounce the search to avoid too many API calls
  const debouncedValue = useDebounce(localValue, 300)
  
  // Update parent when debounced value changes
  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  // Update local value when prop value changes (e.g., from reset)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={cn(
      'relative transition-all duration-200 ease-out',
      className
    )}>
      <div className={cn(
        'relative transition-all duration-200',
        'bg-gray-100 rounded-full border border-gray-200 overflow-hidden',
        isFocused && 'bg-white border-blue-500 shadow-md'
      )}>

        <div className="relative flex items-center">
          <Search className={cn(
            'absolute left-4 w-5 h-5 transition-all duration-200',
            isFocused ? 'text-blue-600' : 'text-gray-400'
          )} />

          <input
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-12 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base"
          />

          {localValue && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 bg-gray-300 hover:bg-gray-400 rounded-full transition-all duration-200"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
