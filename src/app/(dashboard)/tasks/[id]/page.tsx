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

  const task = getTask(id, session.user.id)
  if (!task) notFound()

  const projectList = getProjects(session.user.id)
  const project = projectList.find((p: any) => p.id === task.projectId)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/tasks"><Button variant="ghost">← رجوع</Button></Link>
        <h1 className="text-2xl font-bold">{task.title}</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تفاصيل المهمة</CardTitle>
          <TaskDetailActions taskId={task.id} />
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && <p className="text-sm">{task.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">الحالة:</span> <span>{statusLabels[task.status] ?? task.status}</span></div>
            <div><span className="text-muted-foreground">الأولوية:</span> <span className={`${task.priority === 'high' ? 'text-destructive font-medium' : ''}`}>{priorityLabels[task.priority] ?? task.priority}</span></div>
            {project && <div><span className="text-muted-foreground">المشروع:</span> {project.name}</div>}
            {task.dueDate && <div><span className="text-muted-foreground">تاريخ الاستحقاق:</span> {new Date(task.dueDate).toLocaleDateString('ar-SA')}</div>}
            <div><span className="text-muted-foreground">تاريخ الإنشاء:</span> {new Date(task.createdAt ?? Date.now()).toLocaleDateString('ar-SA')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
