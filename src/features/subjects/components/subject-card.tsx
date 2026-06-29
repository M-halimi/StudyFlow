import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SubjectCardProps {
  id: string
  name: string
  color: string
  icon: string
  description: string | null
  categoryCount: number
  topicCount: number
}

export function SubjectCard({
  id,
  name,
  color,
  icon,
  description,
  categoryCount,
  topicCount,
}: SubjectCardProps) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[icon] ?? Icons.BookOpen

  return (
    <Link href={`/subjects/${id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}15`, color }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-[var(--fg)] truncate">{name}</h3>
              {description && (
                <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">{description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{categoryCount} categories</Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{topicCount} topics</Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (topicCount / 40) * 100)}%`, backgroundColor: color }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
