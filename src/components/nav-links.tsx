'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()
  
  const isKanban = pathname === '/tasks'
  const isList = pathname === '/tasks/list'
  const isAnalytics = pathname === '/analytics'

  const activeClass = "px-2 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md bg-white shadow-sm font-medium text-blue-600 whitespace-nowrap"
  const inactiveClass = "px-2 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-500 whitespace-nowrap"

  return (
    <div className="flex items-center gap-1 bg-gray-100/80 rounded-md p-1 overflow-x-auto">
      <Link href="/analytics" className={isAnalytics ? activeClass : inactiveClass}>الإحصائيات</Link>
      <Link href="/tasks/list" className={isList ? activeClass : inactiveClass}>القائمة</Link>
      <Link href="/tasks" className={isKanban ? activeClass : inactiveClass}>إدارة المهام</Link>
    </div>
  )
}
