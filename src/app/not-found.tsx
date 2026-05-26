import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-4">
      <h2 className="text-6xl font-black text-blue-600">404</h2>
      <p className="text-gray-500 text-lg">الصفحة غير موجودة</p>
      <Link href="/tasks" className="text-blue-600 hover:underline font-medium mt-2">
        العودة إلى لوحة التحكم
      </Link>
    </div>
  )
}
