import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageTransition } from "@/components/shared/page-transition"
import { formatRelativeTime } from "@/lib/utils"
import { startOfDay } from "date-fns"
import { BookOpen } from "lucide-react"

export async function UpcomingRevisions() {
  const session = await auth()
  if (!session?.user?.id) return null

  const revisions = await prisma.revision.findMany({
    where: {
      topic: { category: { subject: { userId: session.user.id } } },
      date: { gte: startOfDay(new Date()) },
      completed: false,
    },
    include: {
      topic: {
        include: {
          category: {
            include: { subject: true },
          },
        },
      },
    },
    orderBy: { date: "asc" },
    take: 5,
  })

  return (
    <PageTransition>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <EmptyState icon={BookOpen} title="No upcoming revisions" description="Revisions will appear here" />
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {revisions.map((revision) => (
                <div key={revision.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--fg)] truncate">{revision.topic.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {revision.topic.category.name} &middot; {revision.topic.category.subject.name}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-3 shrink-0 text-xs">
                    {formatRelativeTime(revision.date)}
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
