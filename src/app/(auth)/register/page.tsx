'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { registerAction } from '@/features/auth/actions'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData()
    fd.set('name', name)
    fd.set('email', email)
    fd.set('password', password)

    try {
      const res = await registerAction(null, fd)

      if (res?.error) {
        setError(res.error)
      } else {
        // Auto-login after successful registration
        const loginRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (loginRes?.error) {
          router.push('/login?registered=true')
        } else {
          router.push('/tasks')
          router.refresh()
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-gray-200/80 shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              type="text"
              placeholder="مثال: عبد الإله"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-right"
              required
            />
          </div>
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
            <Label htmlFor="password">كلمة المرور (8 رموز على الأقل)</Label>
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
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
