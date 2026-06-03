'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Columns, ListTodo, Folder, User } from 'lucide-react'

export function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/analytics',
      label: 'الإحصائيات',
      icon: BarChart3,
      active: pathname === '/analytics',
    },
    {
      href: '/tasks',
      label: 'المهام',
      icon: Columns,
      active: pathname === '/tasks',
    },
    {
      href: '/tasks/list',
      label: 'القائمة',
      icon: ListTodo,
      active: pathname === '/tasks/list',
    },
    {
      href: '/projects',
      label: 'المشاريع',
      icon: Folder,
      active: pathname.startsWith('/projects'),
    },
    {
      href: '/settings/profile',
      label: 'الملف الشخصي',
      icon: User,
      active: pathname.startsWith('/settings'),
    },
  ]

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-2 flex items-center justify-around pb-safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all rounded-xl select-none active:scale-95 ${
              item.active 
                ? 'text-blue-600 font-semibold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${item.active ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
