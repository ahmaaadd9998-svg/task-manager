import { auth } from '@/features/auth/auth.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>
      <Card>
        <CardHeader><CardTitle>الحساب</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">الاسم: </span>
            {session?.user?.name}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">البريد الإلكتروني: </span>
            {session?.user?.email}
          </div>
          <div className="text-sm text-muted-foreground">
            عضو منذ البداية
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
