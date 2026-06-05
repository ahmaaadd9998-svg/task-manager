import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth/auth.config'
import { getTask } from '@/features/tasks/service'
import { getProjects } from '@/features/projects/service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskDetailActions } from '@/features/tasks/components/task-detail-actions'

const priorityLabels: Record<string, string> = { low: 'منخفضة', medium: 'متوسطة', high: 'عالية' }
const statusLabels: Record<string, string> = { todo: 'للبدأ', in_progress: 'قيد التنفيذ', done: 'منتهية' }

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return null

  const task = await getTask(id, session.user.id)
  if (!task) notFound()

  const projectList = await getProjects(session.user.id)
  const project = projectList.find((p: any) => p.id === task.projectId)


  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/tasks"><Button variant="ghost" size="sm" className="sm:h-10">← رجوع</Button></Link>
        <h1 className="text-xl sm:text-2xl font-bold truncate">{task.title}</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm sm:text-base">تفاصيل المهمة</CardTitle>
          <TaskDetailActions taskId={task.id} />
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && <p className="text-sm leading-relaxed">{task.description}</p>}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="min-w-0"><span className="text-muted-foreground">الحالة:</span> <span>{statusLabels[task.status] ?? task.status}</span></div>
            <div className="min-w-0"><span className="text-muted-foreground">الأولوية:</span> <span className={`${task.priority === 'high' ? 'text-destructive font-medium' : ''}`}>{priorityLabels[task.priority] ?? task.priority}</span></div>
            {project && <div className="min-w-0"><span className="text-muted-foreground">المشروع:</span> <span className="truncate inline-block max-w-[120px] sm:max-w-full align-bottom">{project.name}</span></div>}
            {task.dueDate && <div className="min-w-0"><span className="text-muted-foreground">تاريخ الاستحقاق:</span> {new Date(task.dueDate).toLocaleDateString('ar-SA')}</div>}
            <div className="min-w-0 col-span-2 sm:col-span-1"><span className="text-muted-foreground">تاريخ الإنشاء:</span> {new Date(task.createdAt ?? Date.now()).toLocaleDateString('ar-SA')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
