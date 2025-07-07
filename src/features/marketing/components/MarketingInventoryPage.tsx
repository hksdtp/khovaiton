import { useState, useEffect } from 'react'
import { InventoryPage } from '@/features/inventory/components/InventoryPage'
import { SecurityAlertModal } from './SecurityAlertModal'
import { VersionSwitcher } from './VersionSwitcher'

interface CustomerData {
  name: string
  phone: string
  address: string
}

export function MarketingInventoryPage() {
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)

  useEffect(() => {
    // Show security modal after 5 seconds for marketing version
    const timer = setTimeout(() => {
      // Only show if not already submitted
      const hasSubmitted = localStorage.getItem('marketing_info_submitted')
      if (!hasSubmitted) {
        setShowSecurityModal(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleSecuritySubmit = (data: CustomerData) => {
    setCustomerData(data)
    
    // Save to localStorage to prevent showing again
    localStorage.setItem('marketing_info_submitted', 'true')
    localStorage.setItem('marketing_customer_data', JSON.stringify(data))
    
    // Log for analytics (in real app, send to backend)
    console.log('📊 Marketing Lead Captured:', data)
    
    // You can send to your CRM/backend here
    // sendToBackend(data)
  }

  const handleModalClose = () => {
    setShowSecurityModal(false)
    
    // Show again after 30 seconds if not submitted
    setTimeout(() => {
      const hasSubmitted = localStorage.getItem('marketing_info_submitted')
      if (!hasSubmitted) {
        setShowSecurityModal(true)
      }
    }, 30000)
  }

  return (
    <div className="relative">
      {/* Version Switcher */}
      <VersionSwitcher />

      {/* Regular inventory page */}
      <InventoryPage />
      
      {/* Marketing overlay */}
      <SecurityAlertModal
        isOpen={showSecurityModal}
        onClose={handleModalClose}
        onSubmit={handleSecuritySubmit}
      />
      
      {/* Marketing tracking pixel (hidden) */}
      <div className="hidden">
        <img 
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
          alt=""
          onLoad={() => {
            // Track page view for marketing
            console.log('📊 Marketing Page View Tracked')
          }}
        />
      </div>
      
      {/* Customer info display for admin (development only) */}
      {process.env.NODE_ENV === 'development' && customerData && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3 text-sm max-w-xs">
          <div className="font-medium text-green-800 mb-1">📊 Lead Captured:</div>
          <div className="text-green-700">
            <div>👤 {customerData.name}</div>
            <div>📞 {customerData.phone}</div>
            <div>📍 {customerData.address}</div>
          </div>
        </div>
      )}
    </div>
  )
}
