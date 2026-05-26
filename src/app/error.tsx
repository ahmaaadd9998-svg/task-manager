'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-4">
      <h2 className="text-2xl font-bold text-red-600">حدث خطأ غير متوقع</h2>
      <p className="text-gray-500 text-sm">نأسف للإزعاج. يرجى المحاولة مرة أخرى.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors mt-2"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
