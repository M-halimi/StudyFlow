import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns"
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats"
import { RecentActivity } from "@/features/dashboard/components/recent-activity"
import { TodayTasks } from "@/features/dashboard/components/today-tasks"
import { UpcomingRevisions } from "@/features/dashboard/components/upcoming-revisions"
import { Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const { userId } = await verifySession()
  const now = new Date()

  const [totalSessions, todaySessions, weeklySessions, monthlySessions, subjects, tasks, revisions, goals] = await Promise.all([
    prisma.studySession.aggregate({
      where: { userId, status: "COMPLETED" },
      _sum: { totalMinutes: true },
      _count: true,
    }),
    prisma.studySession.aggregate({
      where: {
        userId,
        status: "COMPLETED",
        startTime: { gte: startOfDay(now), lte: endOfDay(now) },
      },
      _sum: { totalMinutes: true },
      _count: true,
    }),
    prisma.studySession.aggregate({
      where: {
        userId,
        status: "COMPLETED",
        startTime: { gte: startOfWeek(now), lte: endOfWeek(now) },
      },
      _sum: { totalMinutes: true },
    }),
    prisma.studySession.aggregate({
      where: {
        userId,
        status: "COMPLETED",
        startTime: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      _sum: { totalMinutes: true },
    }),
    prisma.subject.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "PENDING" } }),
    prisma.revision.count({
      where: {
        topic: { category: { subject: { userId } } },
        date: { gte: startOfDay(now) },
        completed: false,
      },
    }),
    prisma.goal.count({ where: { userId, completed: false } }),
  ])

  const totalMinutes = totalSessions._sum.totalMinutes ?? 0
  const todayMinutes = todaySessions._sum.totalMinutes ?? 0
  const weekMinutes = weeklySessions._sum.totalMinutes ?? 0
  const monthMinutes = monthlySessions._sum.totalMinutes ?? 0

  const stats = {
    totalMinutes,
    todayMinutes,
    weekMinutes,
    monthMinutes,
    totalSessions: totalSessions._count,
    todaySessions: todaySessions._count,
    subjects,
    pendingTasks: tasks,
    pendingRevisions: revisions,
    activeGoals: goals,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Here&apos;s your study overview for today</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TodayTasks />
        <UpcomingRevisions />
      </div>

      <RecentActivity userId={userId} />
    </div>
  )
}
