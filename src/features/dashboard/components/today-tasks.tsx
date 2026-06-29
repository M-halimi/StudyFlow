import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageTransition } from "@/components/shared/page-transition"
import { startOfDay, endOfDay } from "date-fns"
import { ListChecks } from "lucide-react"

export async function TodayTasks() {
  const session = await auth()
  if (!session?.user?.id) return null

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      dueDate: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
    },
    orderBy: { sortOrder: "asc" },
    take: 5,
  })

  const priorityBorder: Record<string, string> = {
    URGENT: "border-l-[var(--danger)]",
    HIGH: "border-l-[var(--warning)]",
    MEDIUM: "border-l-[var(--primary)]",
    LOW: "border-l-[var(--muted)]",
  }

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s Tasks</CardTitle>
            {tasks.length > 0 && (
              <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <EmptyState icon={ListChecks} title="No tasks for today" description="Add tasks to your planner" />
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-1 rounded-full ${priorityBorder[task.priority] ?? "border-l-[var(--muted)]"}`} />
                    <span className="text-sm text-[var(--fg)]">{task.title}</span>
                  </div>
                  <Badge variant={task.priority === "URGENT" ? "destructive" : task.priority === "HIGH" ? "warning" : "secondary"} className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  )
}
