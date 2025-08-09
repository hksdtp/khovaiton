import { FabricStatus } from '../types'
import { dataService } from '../services/dataService'

interface StatusBadgeProps {
  status: FabricStatus
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (status: FabricStatus) => {
    const configs = {
      'available': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        priority: 1
      },
      'low_stock': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠️',
        priority: 2
      },
      'out_of_stock': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        priority: 3
      },
      'expired': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '⏰',
        priority: 4
      },
      'damaged': {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '🔧',
        priority: 5
      }
    }
    return configs[status] || configs['available']
  }

  const config = getStatusConfig(status)
  const displayName = dataService.getStatusDisplayName(status)

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.color} ${className}`}
      title={`Ưu tiên: ${config.priority} - ${displayName}`}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      <span>{displayName}</span>
    </span>
  )
}
