import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageTransition } from "@/components/shared/page-transition"
import { formatRelativeTime, formatDuration } from "@/lib/utils"
import { BrainCircuit } from "lucide-react"

export async function RecentActivity({ userId }: { userId: string }) {
  const sessions = await prisma.studySession.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    take: 10,
    include: {
      topic: {
        select: { name: true },
      },
    },
  })

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState icon={BrainCircuit} title="No study sessions yet" description="Start your first study session with the timer" />
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />
              {sessions.map((session) => (
                <div key={session.id} className="relative flex items-start gap-4 py-2.5">
                  <div className="relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--surface)]" />
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--fg)] truncate">
                        {session.topic?.name ?? "General Study"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatRelativeTime(session.startTime)}
                      </p>
                    </div>
                    <Badge variant={session.totalMinutes ? "secondary" : "warning"} className="ml-3 shrink-0 text-xs">
                      {session.totalMinutes ? formatDuration(session.totalMinutes) : "In progress"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  )
}
