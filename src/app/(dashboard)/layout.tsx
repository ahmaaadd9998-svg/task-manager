import { auth } from '@/features/auth/auth.config'
import { LogoutButton } from '@/components/logout-button'
import { NavLinks } from '@/components/nav-links'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 px-4 sm:px-8 py-3 sm:py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <img src="/app-icon.jpg" alt="TaskAI Logo" className="h-8 sm:h-10 w-auto object-contain rounded" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">مدير المهام الذكي</h1>
          </div>
          <div className="sm:hidden">
            <LogoutButton />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto overflow-x-auto">
          <NavLinks />
          <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[120px]">{session?.user?.name || 'abdelilah'}</span>
          <div className="hidden sm:block">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8 overflow-x-auto">
        {children}
      </main>
      <footer className="py-4 sm:py-6 bg-white border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 mt-auto select-none">
        <img src="/logo.png" alt="Ahmed Kabsh Logo" className="h-5 sm:h-6 w-auto object-contain bg-black rounded p-0.5" />
        <span className="text-[10px] sm:text-xs">Copyright © 2026 Ahmed Kabsh. All rights reserved.</span>
      </footer>
    </div>
  )
}
