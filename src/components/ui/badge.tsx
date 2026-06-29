import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)]/10 text-[var(--primary)]",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--muted-fg)]",
        destructive:
          "border-transparent bg-[var(--danger-bg)] text-[var(--danger)]",
        outline:
          "border-[var(--border)] text-[var(--muted-fg)]",
        success:
          "border-transparent bg-[var(--success-bg)] text-[var(--success)]",
        warning:
          "border-transparent bg-[var(--warning-bg)] text-[var(--warning)]",
        info:
          "border-transparent bg-[var(--info-bg)] text-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
