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
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate device fingerprint for duplicate prevention
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')

    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(36)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate all fields
    const nameError = validateName(formData.name)
    const phoneError = validatePhone(formData.phone.replace(/\D/g, ''))
    const addressError = validateAddress(formData.address)

    const newErrors = {
      name: nameError,
      phone: phoneError,
      address: addressError
    }

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '')

    if (hasErrors) {
      setIsSubmitting(false)
      return
    }

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint()
    const timestamp = new Date().toISOString()

    try {
      // Check for duplicate submission from same device
      const existingSubmissions = JSON.parse(localStorage.getItem('marketing_submissions') || '[]')
      const isDuplicate = existingSubmissions.some((sub: any) =>
        sub.deviceFingerprint === deviceFingerprint ||
        (sub.data.phone === formData.phone.replace(/\D/g, '') && sub.data.name.toLowerCase() === formData.name.trim().toLowerCase())
      )

      if (isDuplicate) {
        console.log('⚠️ Duplicate submission detected, preventing save')
        // Still show success for UX but don't save
        onSubmit({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim()
        })
        setIsSubmitted(true)

        setTimeout(() => {
          setIsSubmitted(false)
          onClose()
          setFormData({ name: '', phone: '', address: '' })
          setErrors({})
          setIsSubmitting(false)
        }, 3000)
        return
      }

      // Save lead with device fingerprint
      const lead = await leadStorageService.saveLead({
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address.trim(),
        source: 'marketing_modal',
        deviceFingerprint
      })

      console.log('✅ Lead saved with ID:', lead.id)

      // Record submission to prevent duplicates
      existingSubmissions.push({
        deviceFingerprint,
        timestamp,
        data: {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim()
        }
      })
      localStorage.setItem('marketing_submissions', JSON.stringify(existingSubmissions))

      onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address.trim()
      })
      setIsSubmitted(true)

      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFormData({ name: '', phone: '', address: '' })
        setErrors({})
        setIsSubmitting(false)
      }, 3000)

    } catch (error) {
      console.error('❌ Failed to save lead:', error)
      setIsSubmitting(false)
      // Still proceed with success for UX
      onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address.trim()
      })
      setIsSubmitted(true)

      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFormData({ name: '', phone: '', address: '' })
        setErrors({})
        setIsSubmitting(false)
      }, 3000)
    }
  }

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Vui lòng nhập họ tên'
    if (name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
    if (name.length > 50) return 'Họ tên không được quá 50 ký tự'
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) return 'Họ tên chỉ được chứa chữ cái và khoảng trắng'
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Vui lòng nhập số điện thoại'
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) return 'Số điện thoại phải có ít nhất 10 số'
    if (cleanPhone.length > 11) return 'Số điện thoại không được quá 11 số'
    if (!/^(0[3|5|7|8|9])[0-9]{8,9}$/.test(cleanPhone)) return 'Số điện thoại không đúng định dạng'
    return ''
  }

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Vui lòng nhập địa chỉ'
    if (address.trim().length < 5) return 'Địa chỉ phải có ít nhất 5 ký tự'
    if (address.length > 200) return 'Địa chỉ không được quá 200 ký tự'
    return ''
  }

  const formatPhone = (phone: string): string => {
    // Chỉ giữ lại số
    const numbers = phone.replace(/\D/g, '')

    // Format theo pattern: 0xxx xxx xxx hoặc 0xxx xxxx xxx
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 11)}`
  }

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    let processedValue = value
    let error = ''

    // Xử lý từng field
    switch (field) {
      case 'name':
        // Capitalize first letter of each word
        processedValue = value.replace(/\b\w/g, l => l.toUpperCase())
        error = validateName(processedValue)
        break
      case 'phone':
        // Format phone number
        processedValue = formatPhone(value)
        error = validatePhone(processedValue.replace(/\D/g, ''))
        break
      case 'address':
        // Capitalize first letter
        processedValue = value.charAt(0).toUpperCase() + value.slice(1)
        error = validateAddress(processedValue)
        break
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))

    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
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
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.name
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                    }`}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Số điện thoại * (VD: 0901 234 567)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                    }`}
                    maxLength={13}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Địa chỉ * (VD: 123 Nguyễn Văn A, Quận 1, TP.HCM)"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      errors.address
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                    }`}
                    maxLength={200}
                    disabled={isSubmitting}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.address}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-900 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ĐANG XỬ LÝ...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      ĐĂNG KÝ NGAY
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm disabled:opacity-50"
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
