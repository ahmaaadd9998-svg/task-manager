import { auth } from '@/features/auth/auth.config'
import { LogoutButton } from '@/components/logout-button'
import { NavLinks } from '@/components/nav-links'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/app-icon.jpg" alt="TaskAI Logo" className="h-10 w-auto object-contain rounded" />
          <h1 className="text-xl font-bold text-gray-900">مدير المهام الذكي</h1>
        </div>
        <div className="flex items-center gap-6">
          <NavLinks />
          <span className="text-sm font-medium text-gray-700">{session?.user?.name || 'abdelilah'}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-8 overflow-x-auto">
        {children}
      </main>
      <footer className="py-6 bg-white border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 mt-auto select-none">
        <img src="/logo.png" alt="Ahmed Kabsh Logo" className="h-6 w-auto object-contain bg-black rounded p-0.5" />
        <span>Copyright © 2026 Ahmed Kabsh. All rights reserved.</span>
      </footer>
    </div>
  )
}
