'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
    >
      تسجيل الخروج
    </button>
  )
}
