import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/features/auth/auth.config'
import { getProject } from '@/features/projects/service'
import { getTasks } from '@/features/tasks/service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TaskStatusBadge } from '@/features/tasks/components/task-status-badge'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return null

  const project = getProject(id, session.user.id)
  if (!project) notFound()

  const taskList = getTasks(session.user.id, id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects"><Button variant="ghost">← رجوع</Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color ?? '#3b82f6' }} />
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <Link href="/tasks/new"><Button>إضافة مهمة</Button></Link>
      </div>
      <div className="space-y-2">
        {taskList.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">
            <p>لا توجد مهام في هذا المشروع.</p>
          </CardContent></Card>
        ) : taskList.map((task: any) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <TaskStatusBadge status={task.status} taskId={task.id} />
                  <span>{task.title}</span>
                </div>
                <span className={`text-xs ${task.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
