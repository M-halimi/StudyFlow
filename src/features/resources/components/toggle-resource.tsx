"use client"

import { useState } from "react"
import { toggleResourceCompleted } from "@/features/resources/actions/resource-actions"
import { CheckCircle2, Circle } from "lucide-react"

export function ToggleResource({ id, completed }: { id: string; completed: boolean }) {
  const [pending, setPending] = useState(false)
  const [isCompleted, setIsCompleted] = useState(completed)

  async function handleToggle() {
    setPending(true)
    const newValue = !isCompleted
    setIsCompleted(newValue)
    await toggleResourceCompleted(id, newValue)
    setPending(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="shrink-0"
    >
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
      ) : (
        <Circle className="h-5 w-5 text-[var(--muted)] hover:text-[var(--fg)] transition-colors" />
      )}
    </button>
  )
}
