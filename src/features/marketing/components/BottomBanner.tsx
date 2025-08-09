import React, { useState } from 'react'
import { Gift, X, Star, Zap, ChevronUp, ChevronDown } from 'lucide-react'

interface BottomBannerProps {
  onOpenModal: () => void
  onClose: () => void
  isVisible: boolean
  compact?: boolean
}

export const BottomBanner: React.FC<BottomBannerProps> = ({
  onOpenModal,
  onClose,
  isVisible,
  compact = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl z-30 animate-slide-up border-t-4 border-yellow-400">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 2px, transparent 2px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className={`relative z-10 flex items-center justify-between max-w-6xl mx-auto ${compact ? 'px-4 py-2' : 'px-6 py-4'}`}>
        <div className="flex items-center gap-4">
          {/* Animated Icon */}
          <div className="relative">
            <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-pulse ${isMinimized ? 'w-8 h-8' : 'w-12 h-12'}`}>
              <Gift className={`text-red-800 ${isMinimized ? 'w-4 h-4' : 'w-6 h-6'}`} />
            </div>
            {!isMinimized && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-bounce">
                <Star className="w-3 h-3 text-red-600 m-0.5" />
              </div>
            )}
          </div>

          {/* Main Text */}
          {!isMinimized ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-yellow-300 text-xs font-bold uppercase tracking-wide">
                  ƯU ĐÃI ĐẶC BIỆT
                </span>
              </div>
              <span className="text-lg font-bold leading-tight">
                Để lại thông tin để có <span className="text-yellow-300">giá tốt hơn</span> & <span className="text-yellow-300">giữ mã ưu đãi</span>
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-yellow-300">
              Ưu đãi đặc biệt
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isMinimized && (
            <button
              onClick={onOpenModal}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-800 px-6 py-3 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-2xl">👆</span>
              <span>Click ngay</span>
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors group"
            title={isMinimized ? "Mở rộng" : "Thu gọn"}
          >
            {isMinimized ? (
              <ChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors group"
            title="Đóng"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 animate-pulse"></div>
    </div>
  )
}
