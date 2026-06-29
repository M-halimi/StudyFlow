import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { JournalForm } from "@/features/journal/components/journal-form"
import { PageTransition } from "@/components/shared/page-transition"
import { FileText } from "lucide-react"

export default async function JournalPage() {
  const { userId } = await verifySession()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const entry = await prisma.journal.findFirst({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
    },
  })

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Journal</h1>
            <p className="text-sm text-[var(--muted)]">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <JournalForm entry={entry} />
      </div>
    </PageTransition>
  )
}
