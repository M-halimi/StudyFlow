import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/features/settings/components/settings-form"
import { PageTransition } from "@/components/shared/page-transition"
import { User, Mail, Calendar, Settings } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function SettingsPage() {
  const { userId } = await verifySession()

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.userSettings.findUnique({
      where: { userId },
    }),
  ])

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Settings</h1>
            <p className="text-sm text-[var(--muted)]">Manage your preferences and profile</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <Settings className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--muted)]" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg)]">
                <User className="h-4 w-4 text-[var(--muted)]" />
                <span className="text-sm text-[var(--fg)]">{user?.name ?? "No name set"}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg)]">
                <Mail className="h-4 w-4 text-[var(--muted)]" />
                <span className="text-sm text-[var(--fg)]">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg)]">
                <Calendar className="h-4 w-4 text-[var(--muted)]" />
                <span className="text-sm text-[var(--fg)]">Joined {formatDate(user?.createdAt ?? new Date())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <SettingsForm settings={settings} />
      </div>
    </PageTransition>
  )
}
