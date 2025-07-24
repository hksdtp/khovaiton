import { useState } from 'react'
import { InventoryPage } from '@/features/inventory/components/InventoryPage'
import { SecurityAlertModal } from './SecurityAlertModal'
import { BottomBanner } from './BottomBanner'
import { VersionSwitcher } from './VersionSwitcher'
import { ContactIcons } from './ContactIcons'
import { GoogleSheetsTest } from '@/components/GoogleSheetsTest'

interface CustomerData {
  name: string
  phone: string
  address: string
}

export function MarketingInventoryPage() {
  const [showSecurityModal, setShowSecurityModal] = useState(true) // Mở ngay khi vào trang
  const [showBottomBanner, setShowBottomBanner] = useState(false) // Ẩn banner ban đầu
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [showGoogleSheetsTest, setShowGoogleSheetsTest] = useState(false)

  const handleSecuritySubmit = (data: CustomerData) => {
    setCustomerData(data)
    setShowBottomBanner(false) // Ẩn banner sau khi submit thành công

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

    // Hiển thị banner sau khi đóng form (nếu chưa submit thành công)
    const hasSubmitted = localStorage.getItem('marketing_info_submitted')
    if (!hasSubmitted) {
      setShowBottomBanner(true)
    }
  }

  const handleBannerClose = () => {
    setShowBottomBanner(false)
  }

  const handleBannerClick = () => {
    setShowSecurityModal(true)
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

      {/* Contact Icons for Marketing */}
      <ContactIcons />

      {/* Bottom Banner */}
      <BottomBanner
        isVisible={showBottomBanner && !showSecurityModal}
        onOpenModal={handleBannerClick}
        onClose={handleBannerClose}
      />

      {/* Google Sheets Test (Development only) */}
      {showGoogleSheetsTest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={() => setShowGoogleSheetsTest(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ×
            </button>
            <GoogleSheetsTest />
          </div>
        </div>
      )}

      {/* Development: Google Sheets Test Button - HIDDEN */}
      {false && process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowGoogleSheetsTest(true)}
          className="fixed bottom-20 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs z-30"
        >
          🧪 Test Sheets
        </button>
      )}

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
