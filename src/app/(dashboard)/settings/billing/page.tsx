import { auth } from '@/features/auth/auth.config'
import { getUserSubscription } from '@/features/billing/service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { upgradeToProAction, manageBillingAction } from '@/features/billing/actions'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const subscription = getUserSubscription(session.user.id)
  const isPro = subscription?.plan === 'pro'

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">الفواتير</h1>
      <Card>
        <CardHeader><CardTitle>الباقة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isPro ? 'باقة Pro' : 'الباقة المجانية'}</p>
              <p className="text-sm text-muted-foreground">
                {isPro ? 'جميع الميزات متاحة' : 'ميزات أساسية فقط'}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border ${isPro ? 'border-green-500 text-green-500' : 'border-muted-foreground text-muted-foreground'}`}>
              {subscription?.status === 'active' ? 'نشط' : 'ملغي'}
            </span>
          </div>
          {isPro ? (
            <form action={manageBillingAction}>
              <Button type="submit" variant="outline">إدارة الفوترة</Button>
            </form>
          ) : (
            <form action={upgradeToProAction}>
              <Button type="submit">ترقية إلى Pro — $12/شهر</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
