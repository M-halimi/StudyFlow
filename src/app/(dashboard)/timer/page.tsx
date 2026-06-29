import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { FlexibleTimer } from "@/features/timer/components/flexible-timer"
import { LoadMoreSessions } from "@/features/sessions/components/load-more-sessions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDuration } from "@/lib/utils"
import { Timer, Clock, BookOpen, Briefcase, Coffee, CupSoda } from "lucide-react"
import { startOfDay, subDays, isSameDay, format } from "date-fns"

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  STUDY: BookOpen,
  WORK: Briefcase,
  BREAK: Coffee,
  COFFEE: CupSoda,
}

const TYPE_LABELS: Record<string, string> = {
  STUDY: "Study",
  WORK: "Work",
  BREAK: "Break",
  COFFEE: "Coffee",
}

function getGroupLabel(date: Date): string {
  const today = startOfDay(new Date())
  const sessionDay = startOfDay(date)
  if (isSameDay(sessionDay, today)) return "Today"
  if (isSameDay(sessionDay, subDays(today, 1))) return "Yesterday"
  if (sessionDay >= subDays(today, 6)) return "This Week"
  return "Earlier"
}

function groupSessions(sessions: Awaited<ReturnType<typeof prisma.studySession.findMany<{ include: { topic: { select: { name: true } } } }>>>) {
  const grouped: { label: string; sessions: typeof sessions }[] = []
  const seenLabels = new Set<string>()

  for (const session of sessions) {
    const label = getGroupLabel(session.startTime)
    if (!seenLabels.has(label)) {
      seenLabels.add(label)
      grouped.push({ label, sessions: [] })
    }
    const group = grouped.find((g) => g.label === label)
    if (group) group.sessions.push(session)
  }

  return grouped
}

async function SessionRow({ session }: { session: Awaited<ReturnType<typeof prisma.studySession.findMany<{ include: { topic: { select: { name: true } } } }>>>[number] }) {
  const TypeIcon = TYPE_ICONS[session.sessionType] ?? Clock
  const typeLabel = TYPE_LABELS[session.sessionType] ?? "Study"
  const isClickable = session.status === "PAUSED" || session.status === "ACTIVE"

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 relative ${isClickable ? "cursor-pointer hover:bg-[var(--surface-hover)]" : ""} transition-colors`}
    >
      {isClickable && (
        <a href="/timer" className="absolute inset-0" />
      )}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
        session.sessionType === "STUDY" ? "bg-[var(--primary)]/10" :
        session.sessionType === "WORK" ? "bg-[var(--warning)]/10" :
        session.sessionType === "BREAK" ? "bg-[var(--success)]/10" :
        "bg-[var(--danger)]/10"
      }`}>
        <TypeIcon className={`h-4 w-4 ${
          session.sessionType === "STUDY" ? "text-[var(--primary)]" :
          session.sessionType === "WORK" ? "text-[var(--warning)]" :
          session.sessionType === "BREAK" ? "text-[var(--success)]" :
          "text-[var(--danger)]"
        }`} />
      </div>
      <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--fg)] truncate">
            {session.title || session.topic?.name || "Untitled"}
          </p>
          <Badge variant={
            session.sessionType === "WORK" ? "warning" :
            session.sessionType === "BREAK" ? "success" :
            "info"
          } className="text-[10px] shrink-0">
            {typeLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--muted)]">
            {format(session.startTime, "h:mm a")}
          </span>
          {session.totalMinutes && (
            <>
              <span className="text-[10px] text-[var(--muted)] opacity-40">·</span>
              <span className="text-xs text-[var(--muted)]">
                {formatDuration(session.totalMinutes)}
              </span>
            </>
          )}
          {session.status !== "COMPLETED" && (
            <>
              <span className="text-[10px] text-[var(--muted)] opacity-40">·</span>
              <span className="text-xs text-[var(--warning)] font-medium capitalize">
                {session.status.toLowerCase()}
              </span>
            </>
          )}
        </div>
      </div>
      {isClickable && (
        <span className="relative z-10 text-[11px] text-[var(--primary)] font-medium shrink-0">
          {session.status === "PAUSED" ? "Resume" : "Open"}
        </span>
      )}
    </div>
  )
}

export default async function TimerPage() {
  const { userId } = await verifySession()

  const [allSessions, topics, pausedSession] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 20,
      include: { topic: { select: { name: true } } },
    }),
    prisma.topic.findMany({
      where: { category: { subject: { userId } } },
      select: { id: true, name: true, category: { select: { subject: { select: { name: true } } } } },
      take: 50,
    }),
    prisma.studySession.findFirst({
      where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
      orderBy: { startTime: "desc" },
      select: { id: true, sessionType: true, topicId: true, plannedDuration: true, remainingTime: true, status: true },
    }),
  ])

  const initialSessions = allSessions.slice(0, 10)
  const hasMore = allSessions.length > 10
  const initialGrouped = groupSessions(initialSessions)

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Focus Timer</h1>
            <p className="text-sm text-[var(--muted)]">Set your own duration and focus</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <Timer className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="p-8">
              <FlexibleTimer
                initialSession={pausedSession}
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
            <CardContent className="p-0">
              {allSessions.length === 0 ? (
                <div className="px-4 pb-4">
                  <EmptyState icon={Clock} title="No sessions yet" description="Your study sessions will appear here" />
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-light)]">
                  {initialGrouped.map((group) => (
                    <div key={group.label}>
                      <div className="px-4 py-2 bg-[var(--surface)]/50">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                          {group.label}
                        </span>
                      </div>
                      <div className="divide-y divide-[var(--border-light)]">
                        {group.sessions.map((session) => (
                          <SessionRow key={session.id} session={session} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {hasMore && (
                    <LoadMoreSessions sessions={allSessions.slice(10)} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
