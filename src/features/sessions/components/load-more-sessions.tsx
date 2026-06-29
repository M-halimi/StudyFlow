"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatDuration } from "@/lib/utils"
import { BookOpen, Briefcase, Coffee, CupSoda, Clock } from "lucide-react"
import { startOfDay, subDays, isSameDay, format } from "date-fns"
import { useRouter } from "next/navigation"
import { resumeSession } from "@/features/sessions/actions/session-actions"
import { toast } from "sonner"

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

interface SessionData {
  id: string
  userId: string
  topicId: string | null
  sessionType: string
  title: string
  startTime: Date
  endTime: Date | null
  totalMinutes: number | null
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  topic: { name: string } | null
}

export function LoadMoreSessions({ sessions }: { sessions: SessionData[] }) {
  const [showAll, setShowAll] = useState(false)
  const router = useRouter()

  if (!showAll) {
    return (
      <button
        onClick={() => setShowAll(true)}
        className="w-full px-4 py-3 text-sm text-[var(--primary)] font-medium hover:bg-[var(--surface-hover)] transition-colors"
      >
        Show all ({sessions.length} more)
      </button>
    )
  }

  const grouped: { label: string; sessions: SessionData[] }[] = []
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

  async function handleResume(id: string) {
    await resumeSession(id)
    toast.success("Session resumed")
    router.push("/timer")
  }

  return (
    <>
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="px-4 py-2 bg-[var(--surface)]/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              {group.label}
            </span>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {group.sessions.map((session) => {
              const TypeIcon = TYPE_ICONS[session.sessionType] ?? Clock
              const typeLabel = TYPE_LABELS[session.sessionType] ?? "Study"
              const isClickable = session.status === "PAUSED" || session.status === "ACTIVE"

              return (
                <div
                  key={session.id}
                  onClick={() => isClickable && handleResume(session.id)}
                  className={`flex items-center gap-3 px-4 py-3 relative ${isClickable ? "cursor-pointer hover:bg-[var(--surface-hover)]" : ""} transition-colors`}
                >
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
                  <div className="min-w-0 flex-1">
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
                    <span className="text-[11px] text-[var(--primary)] font-medium shrink-0">
                      {session.status === "PAUSED" ? "Resume" : "Open"}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
