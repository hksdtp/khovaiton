import React, { useState, useEffect } from 'react'
import { X, Shield, MessageSquare, AlertTriangle } from 'lucide-react'
import { leadStorageService } from '@/services/leadStorageService'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.phone && formData.address) {
      try {
        // Lưu vào lead storage service
        const lead = await leadStorageService.saveLead({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          source: 'marketing_modal'
        })

        console.log('✅ Lead saved with ID:', lead.id)

        // Gọi callback để cập nhật UI
        onSubmit(formData)
        setIsSubmitted(true)

        // Auto close after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false)
          onClose()
          setFormData({ name: '', phone: '', address: '' })
        }, 3000)

      } catch (error) {
        console.error('❌ Failed to save lead:', error)
        // Vẫn tiếp tục với flow cũ nếu có lỗi
        onSubmit(formData)
        setIsSubmitted(true)
        setTimeout(() => {
          setIsSubmitted(false)
          onClose()
          setFormData({ name: '', phone: '', address: '' })
        }, 3000)
      }
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
            <div className="text-left mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Xem mẫu trong link – nhưng đừng chốt vội!
                </h2>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">
                  <em>Để lại thông tin – bạn sẽ nhận được giá tốt hơn, được ưu tiên giữ mã vải đẹp và được gửi mẫu chưa niêm yết công khai.</em>
                </p>
              </div>
              <p className="text-gray-800 font-medium mb-4">
                Vui lòng để lại thông tin để nhận ưu đãi tốt nhất từ kho:
              </p>
              <div className="space-y-2 text-gray-700 mb-4">
                <p><strong>1. Tên:</strong></p>
                <p><strong>2. Số điện thoại:</strong></p>
                <p><strong>3. Địa chỉ:</strong> (có thể chỉ cần tỉnh/thành để gợi ý mẫu phù hợp)</p>
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

            {/* Additional Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-xs">📞</span>
                </div>
                <p className="text-sm text-gray-700">
                  Bên mình sẽ liên hệ ngay sau khi nhận thông tin để gửi mã phù hợp và báo giá ưu tiên.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center mt-0.5">
                  <span className="text-yellow-600 text-xs">👀</span>
                </div>
                <p className="text-sm text-gray-700">
                  Bạn vẫn có thể tiếp tục xem mẫu nếu chưa sẵn sàng để lại thông tin.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="mb-6">
              
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
                    className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
                  >
                    📋 GỬI THÔNG TIN
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    ❌ ĐÓNG LẠI – XEM SAU
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
