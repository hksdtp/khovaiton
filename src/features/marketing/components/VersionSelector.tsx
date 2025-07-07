// Version Selector Component
import { Link, useLocation } from 'react-router-dom'
import { Users, Target, Package } from 'lucide-react'
import { Card } from '@/common/design-system/components'

export function VersionSelector() {
  const location = useLocation()
  
  // Don't show selector on version pages
  if (location.pathname.includes('/sale') || location.pathname.includes('/marketing')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl">
              <Package className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kho Vải Tồn
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hệ thống quản lý inventory hiện đại
          </p>
          <p className="text-gray-500">
            Chọn phiên bản phù hợp với team của bạn
          </p>
        </div>

        {/* Version Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sale Version */}
          <Link to="/sale" className="group">
            <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-blue-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors">
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📊 Phiên Bản SALE
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Dành cho team Sales - Quản lý inventory thuần túy
                </p>
                
                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Quản lý 335 sản phẩm vải</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Filter thông minh theo ảnh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Tìm kiếm nhanh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Upload ảnh Cloudinary</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Giao diện sạch, tập trung</span>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    ✅ Phù hợp cho:
                  </div>
                  <div className="text-sm text-green-700">
                    Sales team, quản lý kho, kiểm tra tồn kho
                  </div>
                </div>
                
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors group-hover:bg-green-700">
                  Vào Phiên Bản Sale →
                </button>
              </div>
            </Card>
          </Link>

          {/* Marketing Version */}
          <Link to="/marketing" className="group">
            <Card className="h-full p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-purple-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                    <Target className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Phiên Bản MARKETING
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Dành cho Marketing - Thu thập leads từ khách hàng
                </p>
                
                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Tất cả tính năng Sale +</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">🚨 Popup cảnh báo bảo mật</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">📝 Thu thập thông tin khách</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">📊 Tracking marketing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">🎁 Ưu đãi đặc biệt</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="text-sm font-medium text-purple-800 mb-1">
                    🎯 Phù hợp cho:
                  </div>
                  <div className="text-sm text-purple-700">
                    Marketing team, thu thập leads, chăm sóc khách hàng
                  </div>
                </div>
                
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors group-hover:bg-purple-700">
                  Vào Phiên Bản Marketing →
                </button>
              </div>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            💡 Cả 2 phiên bản đều sử dụng cùng dữ liệu inventory
          </p>
        </div>
      </div>
    </div>
  )
}
