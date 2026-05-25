'use server'

import { createUser } from './service'
import { registerSchema } from './validations'

export async function registerAction(_prev: any, formData: FormData) {
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
  } catch (err: any) {
    return { error: err.message === 'Email already registered' ? 'البريد الإلكتروني مسجل بالفعل' : 'حدث خطأ أثناء التسجيل' }
  }
}
