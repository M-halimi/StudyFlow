"use client"

import { useRouter } from "next/navigation"
import { resumeSession } from "@/features/sessions/actions/session-actions"
import { Copy } from "lucide-react"
import { duplicateSession } from "@/features/sessions/actions/session-actions"
import { toast } from "sonner"

interface SessionCardActionsProps {
  sessionId: string
  status: string
  duration: number | null
}

export function SessionCardActions({ sessionId, status, duration }: SessionCardActionsProps) {
  const router = useRouter()

  async function handleClick() {
    if (status === "PAUSED") {
      await resumeSession(sessionId)
      toast.success("Session resumed")
      router.push("/timer")
    } else if (status === "ACTIVE") {
      router.push("/timer")
    }
  }

  async function handleDuplicate(e: React.MouseEvent) {
    e.stopPropagation()
    await duplicateSession(sessionId)
    toast.success("Session duplicated")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1" onClick={handleClick}>
      {(status === "PAUSED" || status === "ACTIVE") && (
        <div className="absolute inset-0 cursor-pointer" />
      )}
      {duration && (
        <button
          onClick={handleDuplicate}
          className="relative z-10 rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Duplicate session"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
