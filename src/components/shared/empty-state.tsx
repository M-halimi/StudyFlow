import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/5">
        <Icon className="h-8 w-8 text-[var(--primary)]/40" />
      </div>
      <h3 className="text-base font-semibold text-[var(--fg)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
