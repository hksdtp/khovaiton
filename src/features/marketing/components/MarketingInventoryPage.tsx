import { useState, useEffect } from 'react'
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
  // Kiểm tra localStorage để quyết định có hiển thị form hay không
  const [showSecurityModal, setShowSecurityModal] = useState(false) // Sẽ được set trong useEffect
  const [showBottomBanner, setShowBottomBanner] = useState(false) // Ẩn banner ban đầu
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [showGoogleSheetsTest, setShowGoogleSheetsTest] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // Track initialization

  // Kiểm tra localStorage khi component mount
  useEffect(() => {
    const checkSubmissionStatus = () => {
      const hasSubmitted = localStorage.getItem('marketing_info_submitted')
      const existingData = localStorage.getItem('marketing_customer_data')

      if (hasSubmitted && existingData) {
        // Đã submit rồi, không hiển thị form
        setShowSecurityModal(false)
        setShowBottomBanner(false)
        setCustomerData(JSON.parse(existingData))
        console.log('✅ User already submitted form, skipping modal')
      } else {
        // Chưa submit, hiển thị form
        setShowSecurityModal(true)
        console.log('📝 First time user, showing form')
      }

      setIsInitialized(true)
    }

    checkSubmissionStatus()
  }, [])

  // Chỉ render khi đã initialized để tránh flash
  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50" /> // Loading state
  }

  // Tạo unique device identifier để tránh trùng lặp
  const generateDeviceId = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('Device fingerprint', 2, 2)

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')

    // Tạo hash đơn giản
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  const handleSecuritySubmit = (data: CustomerData) => {
    const deviceId = generateDeviceId()
    const timestamp = new Date().toISOString()

    // Kiểm tra xem device này đã submit chưa
    const existingSubmissions = JSON.parse(localStorage.getItem('marketing_submissions') || '[]')
    const alreadySubmitted = existingSubmissions.some((sub: any) => sub.deviceId === deviceId)

    if (alreadySubmitted) {
      console.log('⚠️ Device already submitted, preventing duplicate')
      // Vẫn hiển thị success để UX tốt, nhưng không gửi duplicate data
      setCustomerData(data)
      setShowBottomBanner(false)
      return
    }

    // Lưu thông tin submission mới
    const submissionRecord = {
      deviceId,
      timestamp,
      data,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`
    }

    existingSubmissions.push(submissionRecord)
    localStorage.setItem('marketing_submissions', JSON.stringify(existingSubmissions))

    setCustomerData(data)
    setShowBottomBanner(false) // Ẩn banner sau khi submit thành công

    // Save to localStorage to prevent showing again
    localStorage.setItem('marketing_info_submitted', 'true')
    localStorage.setItem('marketing_customer_data', JSON.stringify(data))
    localStorage.setItem('marketing_device_id', deviceId)

    // Log for analytics với device info
    console.log('📊 Marketing Lead Captured:', {
      ...data,
      deviceId,
      timestamp,
      isUnique: true
    })

    // You can send to your CRM/backend here with device ID
    // sendToBackend({ ...data, deviceId, timestamp })
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

  // Admin reset function (hidden, accessible via console)
  const resetMarketingForm = () => {
    localStorage.removeItem('marketing_info_submitted')
    localStorage.removeItem('marketing_customer_data')
    localStorage.removeItem('marketing_device_id')
    localStorage.removeItem('marketing_submissions')
    setCustomerData(null)
    setShowSecurityModal(true)
    setShowBottomBanner(false)
    console.log('🔄 Marketing form reset successfully')
  }

  // Expose reset function to window for admin access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetMarketingForm = resetMarketingForm
      console.log('🔧 Admin function available: window.resetMarketingForm()')
    }
  }, [])

  // Keyboard shortcut for admin reset (Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        const confirm = window.confirm('Reset marketing form for this device?')
        if (confirm) {
          resetMarketingForm()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="relative">
      {/* Version Switcher */}
      <VersionSwitcher />

      {/* Regular inventory page with bottom padding for banner */}
      <div className={showBottomBanner ? "pb-16" : ""}>
        <InventoryPage />
      </div>
      
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
