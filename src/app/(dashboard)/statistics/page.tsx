import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { Clock, Layers, ListChecks, BookOpen, BarChart3, BrainCircuit } from "lucide-react"
import { formatDuration, formatRelativeTime } from "@/lib/utils"
import { subDays, startOfDay, endOfDay } from "date-fns"
import { DailyChart } from "./daily-chart"

export default async function StatisticsPage() {
  const { userId } = await verifySession()

  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))

  const dailyData = await Promise.all(
    last7Days.map(async (day) => {
      const agg = await prisma.studySession.aggregate({
        where: {
          userId,
          status: "COMPLETED",
          startTime: { gte: startOfDay(day), lte: endOfDay(day) },
        },
        _sum: { totalMinutes: true },
      })
      return {
        date: day.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: agg._sum.totalMinutes ?? 0,
      }
    })
  )

  const [totalSessions, taskCounts, subjects, topicStatuses, recentSessions] = await Promise.all([
    prisma.studySession.aggregate({
      where: { userId, status: "COMPLETED" },
      _sum: { totalMinutes: true },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.subject.count({ where: { userId } }),
    prisma.topic.groupBy({
      by: ["status"],
      where: { category: { subject: { userId } } },
      _count: true,
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 10,
      include: { topic: { select: { name: true } } },
    }),
  ])

  const totalMinutes = totalSessions._sum.totalMinutes ?? 0
  const sessionCount = totalSessions._count
  const completedTasks = taskCounts.find((t) => t.status === "COMPLETED")
  const pendingTasks = taskCounts.find((t) => t.status === "PENDING")
  const inProgressTasks = taskCounts.find((t) => t.status === "IN_PROGRESS")
  const maxTopics = Math.max(...topicStatuses.map((t) => t._count), 1)

  const statCards = [
    { title: "Total Study Time", value: formatDuration(totalMinutes), icon: Clock, sub: `${sessionCount} sessions`, color: "var(--primary)" },
    { title: "Study Sessions", value: String(sessionCount), icon: Layers, sub: "completed", color: "var(--info)" },
    { title: "Completed Tasks", value: String(completedTasks?._count ?? 0), icon: ListChecks, sub: `${pendingTasks?._count ?? 0} pending · ${inProgressTasks?._count ?? 0} in progress`, color: "var(--success)" },
    { title: "Subjects", value: String(subjects), icon: BookOpen, sub: "created", color: "var(--warning)" },
  ]

  const statusConfig: Record<string, { label: string; color: string }> = {
    NOT_STARTED: { label: "Not Started", color: "var(--muted)" },
    LEARNING: { label: "Learning", color: "var(--info)" },
    NEED_REVISION: { label: "Need Revision", color: "var(--warning)" },
    MASTERED: { label: "Mastered", color: "var(--success)" },
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Statistics</h1>
            <p className="text-sm text-[var(--muted)]">Your learning analytics at a glance</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{card.title}</span>
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold text-[var(--fg)]">{card.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--muted)]" />
              <CardTitle>Daily Study Time (Last 7 Days)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {dailyData.every((d) => d.minutes === 0) ? (
              <EmptyState icon={Clock} title="No sessions this week" description="Start studying to see your daily chart" />
            ) : (
              <DailyChart data={dailyData} />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--muted)]" />
                <CardTitle>Topics by Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {topicStatuses.length === 0 ? (
                <EmptyState icon={Layers} title="No topics yet" description="Create topics to see status distribution" />
              ) : (
                <div className="space-y-3">
                  {topicStatuses.map((t) => {
                    const config = statusConfig[t.status] ?? { label: t.status, color: "var(--muted)" }
                    return (
                      <div key={t.status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--fg)]">{config.label}</span>
                          <span className="text-[var(--muted)] text-xs">{t._count}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(t._count / maxTopics) * 100}%`, backgroundColor: config.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[var(--muted)]" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <EmptyState icon={BrainCircuit} title="No study sessions yet" description="Start studying to see activity" />
              ) : (
                <div className="divide-y divide-[var(--border-light)]">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--fg)] truncate">
                          {session.topic?.name ?? "General Study"}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{formatRelativeTime(session.startTime)}</p>
                      </div>
                      <span className="text-sm text-[var(--muted)] ml-3 shrink-0">
                        {session.totalMinutes ? formatDuration(session.totalMinutes) : "In progress"}
                      </span>
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
