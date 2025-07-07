import React, { useState, useEffect } from 'react'
import { X, Shield, Lock, Eye, AlertTriangle } from 'lucide-react'
import { Card } from '@/common/design-system/components'

interface SecurityAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CustomerData) => void
}

interface CustomerData {
  name: string
  phone: string
  address: string
}

export function SecurityAlertModal({ isOpen, onClose, onSubmit }: SecurityAlertModalProps) {
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Show security alert after 2 seconds
      const timer = setTimeout(() => setShowAlert(true), 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.phone && formData.address) {
      onSubmit(formData)
      setIsSubmitted(true)
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFormData({ name: '', phone: '', address: '' })
      }, 3000)
    }
  }

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {!isSubmitted ? (
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Hệ Thống Bảo Mật Website
              </h2>
              <p className="text-sm text-gray-600">
                Trang web của bạn đang được bảo vệ bởi hệ thống bảo mật tiên tiến
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Mã Hóa SSL</div>
                  <div className="text-xs text-gray-500">Bảo vệ dữ liệu với mã hóa 256-bit</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Giám Sát 24/7</div>
                  <div className="text-xs text-gray-500">Theo dõi và phát hiện mối đe dọa</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">Firewall Thông Minh</div>
                  <div className="text-xs text-gray-500">Chặn các cuộc tấn công tự động</div>
                </div>
              </div>
            </div>

            {/* Security Alert */}
            {showAlert && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-pulse">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="text-sm font-medium text-red-800">
                    🚨 CẢNH BÁO BẢO MẬT: Phát hiện hoạt động đáng ngờ!
                  </div>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  Để lại thông tin để có giá tốt hơn & giữ mã ưu đãi
                </p>
              </div>
            )}

            {/* Form */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Bảo Mật Thông Tin</h3>
              <p className="text-sm text-gray-600 mb-4">
                Để lại thông tin để nhận ưu đãi đặc biệt và bảo vệ tài khoản
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Họ và tên *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Số điện thoại *"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Địa chỉ *"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Security commitment */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="font-medium">Cam kết bảo mật:</div>
                  <div>• Thông tin được mã hóa và bảo mật tuyệt đối</div>
                  <div>• Chỉ sử dụng để gửi ưu đãi và bảo vệ tài khoản</div>
                  <div>• Không chia sẻ với bên thứ ba</div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    GỬI THÔNG TIN
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    ❌ ĐÓNG LẠI - XEM SAU
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Success Message */
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thành Công!</h3>
            <p className="text-gray-600">
              Thông tin của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ sớm nhất!
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
