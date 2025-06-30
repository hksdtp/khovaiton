interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Facebook-style Background */}
      <div className="fixed inset-0 bg-gray-50">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-gray-100/50" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
