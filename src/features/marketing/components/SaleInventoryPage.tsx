// Sale Inventory Page Component
import { InventoryPage } from '@/features/inventory/components/InventoryPage'
import { VersionSwitcher } from './VersionSwitcher'

export function SaleInventoryPage() {
  return (
    <div className="relative">
      {/* Version Switcher */}
      <VersionSwitcher />
      
      {/* Regular inventory page */}
      <InventoryPage />
    </div>
  )
}
