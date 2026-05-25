import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/auth.config'
import { getTasks } from '@/features/tasks/service'
import { KanbanBoard } from '@/features/tasks/components/kanban-board'

export default async function TasksPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const tasks = getTasks(session.user.id)

  return <KanbanBoard initialTasks={tasks} />
}
