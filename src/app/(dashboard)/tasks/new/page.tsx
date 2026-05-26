import { auth } from '@/features/auth/auth.config'
import { getProjects } from '@/features/projects/service'
import { TaskForm } from '@/features/tasks/components/task-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewTaskPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const projectList = await getProjects(session.user.id)

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Link href="/tasks"><Button variant="ghost">← رجوع</Button></Link>
        <h1 className="text-2xl font-bold">مهمة جديدة</h1>
      </div>
      <TaskForm projects={projectList} />
    </div>
  )
}
