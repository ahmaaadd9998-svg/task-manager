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

  const project = await getProject(id, session.user.id)
  if (!project) notFound()

  const taskList = await getTasks(session.user.id, id)


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/projects"><Button variant="ghost" size="sm" className="sm:h-10">← رجوع</Button></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color ?? '#3b82f6' }} />
            <h1 className="text-xl sm:text-2xl font-bold truncate">{project.name}</h1>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <Link href="/tasks/new"><Button size="sm" className="sm:h-10 sm:px-4">إضافة مهمة</Button></Link>
      </div>
      <div className="space-y-2">
        {taskList.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">
            <p>لا توجد مهام في هذا المشروع.</p>
          </CardContent></Card>
        ) : taskList.map((task) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center justify-between py-3 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <TaskStatusBadge status={task.status} taskId={task.id} />
                  <span className="truncate text-sm sm:text-base">{task.title}</span>
                </div>
                <span className={`text-xs shrink-0 ${task.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'}`}>
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
