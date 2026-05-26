import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/30 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img src="/app-icon.jpg" alt="TaskAI Logo" className="w-20 sm:w-24 h-auto object-contain rounded-2xl shadow-lg shadow-black/5 mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">TaskAI</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center px-4">نظام إدارة المهام الذكي المدعوم بالذكاء الاصطناعي</p>
        </div>
        {children}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 text-[10px] sm:text-xs text-gray-400 select-none">
          <img src="/logo.png" alt="Ahmed Kabsh Logo" className="h-4 sm:h-5 w-auto object-contain bg-black rounded p-0.5" />
          <span>Copyright © 2026 Ahmed Kabsh. All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}
