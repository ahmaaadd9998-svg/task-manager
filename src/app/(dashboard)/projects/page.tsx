import Link from 'next/link'
import { auth } from '@/features/auth/auth.config'
import { getProjects } from '@/features/projects/service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createProjectAction } from '@/features/projects/actions'

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const projectList = await getProjects(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold">المشاريع</h1>
        <form action={async () => {
          'use server'
          const fd = new FormData()
          fd.set('name', 'مشروع جديد')
          await createProjectAction(fd)
        }}>
          <Button type="submit" size="sm" className="sm:h-10 sm:px-4">مشروع جديد</Button>
        </form>
      </div>
      {projectList.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p>لا توجد مشاريع بعد. أنشئ أول مشروع.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color ?? '#3b82f6' }} />
                    <h3 className="font-semibold truncate">{project.name}</h3>
                  </div>
                  {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
