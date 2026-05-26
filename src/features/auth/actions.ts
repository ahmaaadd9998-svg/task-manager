'use server'

import { createUser } from './service'
import { registerSchema } from './validations'

type ActionResult = { error?: string; success?: boolean } | undefined

export async function registerAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = registerSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: 'البيانات المدخلة غير صالحة. يرجى التحقق من المدخلات.' }
  }

  try {
    await createUser(parsed.data)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    return { error: message === 'Email already registered' ? 'البريد الإلكتروني مسجل بالفعل' : 'حدث خطأ أثناء التسجيل' }
  }
}
