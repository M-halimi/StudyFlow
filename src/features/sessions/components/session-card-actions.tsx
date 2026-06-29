"use client"

import { useRouter } from "next/navigation"
import { duplicateSession } from "@/features/sessions/actions/session-actions"
import { Play, Copy } from "lucide-react"
import { toast } from "sonner"

interface SessionCardActionsProps {
  sessionId: string
  type: string
  duration: number | null
}

export function SessionCardActions({ sessionId, type, duration }: SessionCardActionsProps) {
  const router = useRouter()

  async function handleContinue() {
    await duplicateSession(sessionId)
    toast.success("New session created")
    router.push("/timer")
  }

  async function handleDuplicate() {
    await duplicateSession(sessionId)
    toast.success("Session duplicated")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      {duration && (
        <button
          onClick={handleContinue}
          className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
          title="Continue session"
        >
          <Play className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={handleDuplicate}
        className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-colors"
        title="Duplicate session"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
