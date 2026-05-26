import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/auth.config'
import { getTasks } from '@/features/tasks/service'
import { TasksList } from '@/features/tasks/components/tasks-list'

export default async function TasksListPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const tasks = await getTasks(session.user.id)

  return <TasksList initialTasks={tasks} />
}
