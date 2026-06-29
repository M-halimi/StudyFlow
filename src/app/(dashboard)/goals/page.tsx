import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { GoalsList } from "@/features/goals/components/goals-list"
import { CreateGoalForm } from "@/features/goals/components/create-goal-form"
import { PageTransition } from "@/components/shared/page-transition"
import { Target } from "lucide-react"

export default async function GoalsPage() {
  const { userId } = await verifySession()

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <Target className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--fg)]">Goals</h1>
              <p className="text-sm text-[var(--muted)]">{activeGoals.length} active &middot; {completedGoals.length} completed</p>
            </div>
          </div>
          <CreateGoalForm />
        </div>

        <GoalsList goals={goals} />
      </div>
    </PageTransition>
  )
}
