import { auth } from '@/features/auth/auth.config'
import { db } from '@/core/db'
import { tasks } from '@/core/db/schema/tasks'
import { eq, and, count, lt, gte } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const total = (await db.select({ value: count() }).from(tasks).where(eq(tasks.userId, session.user.id)).get())?.value ?? 0
  const done = (await db.select({ value: count() }).from(tasks).where(and(eq(tasks.userId, session.user.id), eq(tasks.status, 'done'))).get())?.value ?? 0
  const inProgress = (await db.select({ value: count() }).from(tasks).where(and(eq(tasks.userId, session.user.id), eq(tasks.status, 'in_progress'))).get())?.value ?? 0
  const todo = (await db.select({ value: count() }).from(tasks).where(and(eq(tasks.userId, session.user.id), eq(tasks.status, 'todo'))).get())?.value ?? 0
  const overdue = (await db.select({ value: count() }).from(tasks).where(
    and(eq(tasks.userId, session.user.id), eq(tasks.status, 'todo'), lt(tasks.dueDate, now))
  ).get())?.value ?? 0
  const weekDone = (await db.select({ value: count() }).from(tasks).where(
    and(eq(tasks.userId, session.user.id), eq(tasks.status, 'done'), gte(tasks.updatedAt, weekAgo))
  ).get())?.value ?? 0


  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0
  const todoRate = total > 0 ? Math.round((todo / total) * 100) : 0

  // SVG Donut Chart Calculation (Circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.16)
  const radius = 50
  const circ = 2 * Math.PI * radius // 314.16

  const doneStroke = (done / (total || 1)) * circ
  const inProgressStroke = (inProgress / (total || 1)) * circ
  const todoStroke = (todo / (total || 1)) * circ

  const doneOffset = circ // Starts at 12 o'clock (rotating 90deg counter-clockwise is common, but let's just lay it sequentially)
  const inProgressOffset = doneOffset - doneStroke
  const todoOffset = inProgressOffset - inProgressStroke

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إحصائيات المهام</h1>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500">نسبة الإنجاز</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-blue-600">{completionRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500">قيد التنفيذ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-yellow-600">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500">مهام متأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-red-600">{overdue}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500">أنجزت هذا الأسبوع</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-green-600">{weekDone}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut Chart Card */}
        <Card className="border-gray-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-700">توزيع حالة المهام</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6">
            {total === 0 ? (
              <p className="text-sm text-gray-400 font-medium">لا توجد بيانات كافية لعرض الرسم البياني.</p>
            ) : (
              <>
                {/* SVG Donut */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                    />
                    {/* Done Slice */}
                    {done > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="14"
                        strokeDasharray={circ}
                        strokeDashoffset={doneOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    )}
                    {/* In Progress Slice */}
                    {inProgress > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="14"
                        strokeDasharray={circ}
                        strokeDashoffset={inProgressOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    )}
                    {/* Todo Slice */}
                    {todo > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#94A3B8"
                        strokeWidth="14"
                        strokeDasharray={circ}
                        strokeDashoffset={todoOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    )}
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-800">{total}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">إجمالي المهام</span>
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600 font-medium">مكتملة ({done}) — {completionRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-gray-600 font-medium">قيد التنفيذ ({inProgress}) — {inProgressRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-xs text-gray-600 font-medium">قيد الانتظار ({todo}) — {todoRate}%</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Bar Chart Card */}
        <Card className="border-gray-200/80 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-700">معدل الإنجاز التفصيلي</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-6 py-6">
            {total === 0 ? (
              <p className="text-sm text-gray-400 font-medium text-center">لا توجد بيانات كافية لعرض الرسم البياني.</p>
            ) : (
              <div className="space-y-4">
                {/* Done Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>مكتملة</span>
                    <span>{done} مهمة ({completionRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                {/* In Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>قيد التنفيذ</span>
                    <span>{inProgress} مهمة ({inProgressRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${inProgressRate}%` }} />
                  </div>
                </div>

                {/* Todo Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>قيد الانتظار</span>
                    <span>{todo} مهمة ({todoRate}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-gray-400 h-full rounded-full transition-all duration-500" style={{ width: `${todoRate}%` }} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Card */}
      <Card className="border-gray-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-gray-700">رؤية الذكاء الاصطناعي</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-sm text-gray-400 font-medium">قم بإنشاء بعض المهام للحصول على تحليلات ذكية ومخصصة لأدائك اليومي.</p>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {completionRate >= 80
                ? `أنت تحقق تقدماً استثنائياً! لقد أنجزت ${completionRate}% من إجمالي مهامك. حافظ على هذا الأداء العالي والنشاط.`
                : overdue > 0
                  ? `انتبه! هناك ${overdue} مهام متأخرة عن موعدها الاستحقاقي. نقترح عليك مراجعة هذه المهام، وتبسيطها عن طريق إضافتها كخطوات فرعية صغيرة لتسهيل إنجازها.`
                  : `تسير في الطريق الصحيح مع إنجاز ${done} من أصل ${total} مهام. ننصحك بالتركيز حالياً على إنجاز المهام قيد التنفيذ (${inProgress}) للمحافظة على تدفق إنتاجيتك.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
