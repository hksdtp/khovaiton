/**
 * Contact Icons Component
 * Ninh ơi, component này hiển thị icons Zalo và điện thoại cho phiên bản Marketing
 */


import { Phone } from 'lucide-react'

interface ContactIconsProps {
  className?: string
}

export function ContactIcons({ className = '' }: ContactIconsProps) {
  const handleZaloClick = () => {
    // Mở Zalo chat - có thể thay đổi số điện thoại theo yêu cầu
    window.open('https://zalo.me/0901234567', '_blank')
  }

  const handlePhoneClick = () => {
    // Gọi điện thoại
    window.open('tel:0901234567')
  }

  return (
    <div className={`fixed bottom-6 right-6 flex flex-col gap-3 z-40 ${className}`}>
      {/* Zalo Icon */}
      <button
        onClick={handleZaloClick}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title="Chat Zalo"
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L2 22l5.65-1.05C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.76-.3-4-.85L6 20l.85-2C6.3 16.76 6 15.4 6 14c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M8.5 11.5h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2z"/>
        </svg>
      </button>

      {/* Phone Icon */}
      <button
        onClick={handlePhoneClick}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title="Gọi điện"
      >
        <Phone 
          size={28} 
          className="group-hover:scale-110 transition-transform" 
        />
      </button>
    </div>
  )
}
