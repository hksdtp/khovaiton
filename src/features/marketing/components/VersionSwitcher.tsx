import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, Target, Home, ChevronDown } from 'lucide-react'

export function VersionSwitcher() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  
  // Don't show on home page
  if (location.pathname === '/') {
    return null
  }

  const getCurrentVersion = () => {
    if (location.pathname.includes('/sale')) {
      return { name: 'Sale', icon: Users, color: 'green' }
    }
    if (location.pathname.includes('/marketing')) {
      return { name: 'Marketing', icon: Target, color: 'purple' }
    }
    return { name: 'Inventory', icon: Users, color: 'blue' }
  }

  const currentVersion = getCurrentVersion()
  const Icon = currentVersion.icon

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        {/* Current Version Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
            currentVersion.color === 'green' ? 'border-green-200 bg-green-50' :
            currentVersion.color === 'purple' ? 'border-purple-200 bg-purple-50' :
            'border-blue-200 bg-blue-50'
          }`}
        >
          <Icon className={`w-4 h-4 ${
            currentVersion.color === 'green' ? 'text-green-600' :
            currentVersion.color === 'purple' ? 'text-purple-600' :
            'text-blue-600'
          }`} />
          <span className={`text-sm font-medium ${
            currentVersion.color === 'green' ? 'text-green-800' :
            currentVersion.color === 'purple' ? 'text-purple-800' :
            'text-blue-800'
          }`}>
            {currentVersion.name}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            currentVersion.color === 'green' ? 'text-green-600' :
            currentVersion.color === 'purple' ? 'text-purple-600' :
            'text-blue-600'
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <Home className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">🏠 Trang Chủ</div>
                <div className="text-xs text-gray-500">Chọn phiên bản</div>
              </div>
            </Link>

            {/* Sale Version */}
            <Link
              to="/sale"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 ${
                location.pathname.includes('/sale') ? 'bg-green-50' : ''
              }`}
            >
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">📊 Phiên Bản Sale</div>
                <div className="text-xs text-gray-500">Quản lý inventory thuần túy</div>
              </div>
              {location.pathname.includes('/sale') && (
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </Link>

            {/* Marketing Version */}
            <Link
              to="/marketing"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${
                location.pathname.includes('/marketing') ? 'bg-purple-50' : ''
              }`}
            >
              <Target className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">🎯 Phiên Bản Marketing</div>
                <div className="text-xs text-gray-500">Thu thập leads khách hàng</div>
              </div>
              {location.pathname.includes('/marketing') && (
                <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
            </Link>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
