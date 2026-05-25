'use client'

import { useActionState } from 'react'
import { createTaskAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export function TaskForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createTaskAction, undefined)

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input id="title" name="title" placeholder="ما الذي تريد إنجازه؟" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="تفاصيل إضافية..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <select id="priority" name="priority" defaultValue="medium" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectId">المشروع</Label>
            <select id="projectId" name="projectId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">بدون مشروع</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>{pending ? 'جاري الإنشاء...' : 'إنشاء المهمة'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
