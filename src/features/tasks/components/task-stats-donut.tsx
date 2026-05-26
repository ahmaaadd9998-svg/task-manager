const radius = 50
const circ = 2 * Math.PI * radius

export function TaskStatsDonut({
  total,
  done,
  inProgress,
  todo,
}: {
  total: number
  done: number
  inProgress: number
  todo: number
}) {
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0
  const todoRate = total > 0 ? Math.round((todo / total) * 100) : 0

  const doneStroke = (done / (total || 1)) * circ
  const inProgressStroke = (inProgress / (total || 1)) * circ
  const todoStroke = (todo / (total || 1)) * circ

  const doneOffset = circ
  const inProgressOffset = doneOffset - doneStroke
  const todoOffset = inProgressOffset - inProgressStroke

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6">
      {total === 0 ? (
        <p className="text-sm text-gray-400 font-medium">لا توجد بيانات كافية لعرض الرسم البياني.</p>
      ) : (
        <>
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              {done > 0 && (
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#10B981" strokeWidth="14"
                  strokeDasharray={circ} strokeDashoffset={doneOffset} strokeLinecap="round"
                  className="transition-all duration-500" />
              )}
              {inProgress > 0 && (
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F59E0B" strokeWidth="14"
                  strokeDasharray={circ} strokeDashoffset={inProgressOffset} strokeLinecap="round"
                  className="transition-all duration-500" />
              )}
              {todo > 0 && (
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#94A3B8" strokeWidth="14"
                  strokeDasharray={circ} strokeDashoffset={todoOffset} strokeLinecap="round"
                  className="transition-all duration-500" />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-800">{total}</span>
              <span className="text-[10px] text-gray-400 font-semibold">إجمالي المهام</span>
            </div>
          </div>
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
    </div>
  )
}
