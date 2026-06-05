'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else {
        router.push('/tasks')
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      let guestEmail = localStorage.getItem('guest_email')
      if (!guestEmail) {
        guestEmail = `guest_${window.crypto.randomUUID()}@guest.taskai.local`
        localStorage.setItem('guest_email', guestEmail)
      }

      const res = await signIn('credentials', {
        email: guestEmail,
        password: 'guest12345',
        redirect: false,
      })

      if (res?.error) {
        setError('فشل الدخول كزائر. يرجى المحاولة لاحقاً.')
      } else {
        router.push('/tasks')
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-gray-200/80 shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-right"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-right"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs">أو</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGuestLogin} 
          className="w-full border-purple-200 hover:bg-purple-50/50 hover:text-purple-700 text-purple-600"
          disabled={loading}
        >
          الدخول كـ زائر (بدون حساب)
        </Button>

        <p className="text-xs text-center text-gray-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            إنشاء حساب جديد
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
