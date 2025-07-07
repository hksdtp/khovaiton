import React, { useState } from 'react'
import { X, Gift, CheckCircle, Shield } from 'lucide-react'
import { Card } from '@/common/design-system/components/Card'
import { leadStorageService } from '@/services/leadStorageService'

interface CustomerData {
  name: string
  phone: string
  address: string
}

interface SecurityAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CustomerData) => void
}

export const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    phone: '',
    address: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.name && formData.phone && formData.address) {
      try {
        const lead = await leadStorageService.saveLead({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          source: 'marketing_modal'
        })

        console.log('✅ Lead saved with ID:', lead.id)
        onSubmit(formData)
        setIsSubmitted(true)

        setTimeout(() => {
          setIsSubmitted(false)
          onClose()
          setFormData({ name: '', phone: '', address: '' })
        }, 3000)

      } catch (error) {
        console.error('❌ Failed to save lead:', error)
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

      <Card className="w-full max-w-md bg-white relative animate-zoom-in rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header Section */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 text-center py-8 px-6 rounded-t-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                   radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '50px 50px, 80px 80px'
                }}></div>
              </div>

              <div className="relative z-10">
                <div className="text-yellow-300 text-3xl mb-3">
                  <Gift className="w-8 h-8 mx-auto" />
                </div>
                <h1 className="text-white text-xl font-bold mb-2">
                  XEM MẪU TRONG LINK
                </h1>
                <h2 className="text-yellow-300 text-lg font-semibold mb-4">
                  NHƯNG ĐỪNG CHỐT VỘI!
                </h2>
                <div className="bg-yellow-400 text-red-800 px-4 py-2 rounded-full inline-flex items-center font-bold text-sm">
                  <Gift className="w-4 h-4 mr-1" />
                  ƯU ĐÃI ĐẶC BIỆT
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                ĐỂ LẠI THÔNG TIN - NHẬN ƯU ĐÃI
              </h3>

              {/* Benefits */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center text-sm text-gray-700 hover:translate-x-1 transition-transform">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Nhận được <strong>giá tốt hơn</strong></span>
                </div>
                <div className="flex items-center text-sm text-gray-700 hover:translate-x-1 transition-transform">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Được <strong>ưu tiên giữ mã vải đẹp</strong></span>
                </div>
                <div className="flex items-center text-sm text-gray-700 hover:translate-x-1 transition-transform">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Được gửi <strong>mẫu chưa niêm yết công khai</strong></span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Họ và tên *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Số điện thoại *"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Địa chỉ *"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-900 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  ĐĂNG KÝ NGAY
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  ĐÓNG LẠI
                </button>
              </form>

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center">
                <Shield className="w-3 h-3 mr-1" />
                Chúng tôi cam kết bảo mật thông tin của bạn
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-bounce shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎉 Thành Công!</h3>
            <p className="text-gray-600 leading-relaxed">
              Cảm ơn bạn đã đăng ký! Chúng tôi sẽ liên hệ với bạn sớm nhất để gửi ưu đãi đặc biệt.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
