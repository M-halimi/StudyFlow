import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { PomodoroTimer } from "@/features/timer/components/pomodoro-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate, formatDuration } from "@/lib/utils"
import { Timer, Clock } from "lucide-react"

export default async function TimerPage() {
  const { userId } = await verifySession()

  const [settings, recentSessions, topics] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 10,
      include: { topic: { select: { name: true } } },
    }),
    prisma.topic.findMany({
      where: { category: { subject: { userId } } },
      select: { id: true, name: true, category: { select: { subject: { select: { name: true } } } } },
      take: 50,
    }),
  ])

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Focus Timer</h1>
            <p className="text-sm text-[var(--muted)]">Stay focused with the Pomodoro technique</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <Timer className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="p-8">
              <PomodoroTimer
                defaultFocus={settings?.focusDuration ?? 25}
                defaultBreak={settings?.breakDuration ?? 5}
                defaultLongBreak={settings?.longBreakDuration ?? 15}
                topics={topics.map((t) => ({
                  id: t.id,
                  name: t.name,
                  subjectName: t.category.subject.name,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--muted)]" />
                <CardTitle>Recent Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <EmptyState icon={Clock} title="No sessions yet" description="Your study sessions will appear here" />
              ) : (
                <div className="divide-y divide-[var(--border-light)]">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--fg)] truncate">
                          {session.topic?.name ?? "General Study"}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{formatDate(session.startTime)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {session.totalMinutes && (
                          <span className="text-sm text-[var(--muted)]">{formatDuration(session.totalMinutes)}</span>
                        )}
                        <Badge variant={session.status === "COMPLETED" ? "success" : "secondary"} className="text-[10px]">
                          {session.status === "COMPLETED" ? "Done" : session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
