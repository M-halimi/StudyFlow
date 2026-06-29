import { Card, CardContent } from "@/components/ui/card"
import { PageTransition } from "@/components/shared/page-transition"
import { Clock, BarChart3, CalendarDays, TrendingUp, ListChecks, BookOpen, Target, Zap } from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface StatsProps {
  stats: {
    totalMinutes: number
    todayMinutes: number
    weekMinutes: number
    monthMinutes: number
    totalSessions: number
    todaySessions: number
    subjects: number
    pendingTasks: number
    pendingRevisions: number
    activeGoals: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const cards = [
    { title: "Total Study Time", value: formatDuration(stats.totalMinutes), icon: Clock, sub: `${stats.totalSessions} sessions`, color: "var(--primary)" },
    { title: "Today", value: formatDuration(stats.todayMinutes), icon: BarChart3, sub: `${stats.todaySessions} sessions`, color: "var(--success)" },
    { title: "This Week", value: formatDuration(stats.weekMinutes), icon: CalendarDays, sub: "this week", color: "var(--info)" },
    { title: "This Month", value: formatDuration(stats.monthMinutes), icon: TrendingUp, sub: `${stats.subjects} subjects`, color: "var(--warning)" },
    { title: "Pending Tasks", value: String(stats.pendingTasks), icon: ListChecks, sub: "tasks to complete", color: "var(--danger)" },
    { title: "Upcoming Revisions", value: String(stats.pendingRevisions), icon: BookOpen, sub: "revisions due", color: "var(--accent)" },
    { title: "Active Goals", value: String(stats.activeGoals), icon: Target, sub: "in progress", color: "var(--success)" },
    { title: "Subjects", value: String(stats.subjects), icon: Zap, sub: "created", color: "var(--primary)" },
  ]

  return (
    <PageTransition>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{card.title}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--fg)]">{card.value}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageTransition>
  )
}
