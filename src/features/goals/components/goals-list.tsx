"use client"

import { useState } from "react"
import { updateGoalProgress, deleteGoal } from "@/features/goals/actions/goal-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Target, CheckCircle2, Circle } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate } from "@/lib/utils"

interface Goal {
  id: string
  title: string
  description: string | null
  targetValue: number | null
  currentValue: number
  unit: string | null
  dueDate: Date | null
  completed: boolean
}

export function GoalsList({ goals }: { goals: Goal[] }) {
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({})

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <div className="space-y-8">
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Active Goals</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} progressInputs={progressInputs} setProgressInputs={setProgressInputs} />
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Completed Goals</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} progressInputs={progressInputs} setProgressInputs={setProgressInputs} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <EmptyState icon={Target} title="No goals yet" description="Create your first goal to start tracking progress" />
      )}
    </div>
  )
}

function GoalCard({
  goal, progressInputs, setProgressInputs,
}: {
  goal: Goal
  progressInputs: Record<string, string>
  setProgressInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const [pending, setPending] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const percentage = goal.targetValue
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0

  async function handleUpdateProgress() {
    const val = progressInputs[goal.id]
    if (!val) return
    setPending(true)
    await updateGoalProgress(goal.id, Number(val))
    setPending(false)
  }

  async function handleDelete() {
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    setPending(true)
    await deleteGoal(goal.id)
  }

  return (
    <Card className={goal.completed ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: goal.completed ? "var(--success-bg)" : "var(--primary)/10" }}>
            {goal.completed
              ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              : <Circle className="h-4 w-4 text-[var(--primary)]" />
            }
          </div>
          <div>
            <CardTitle className="text-sm">{goal.title}</CardTitle>
            {goal.description && <p className="text-xs text-[var(--muted)] mt-0.5">{goal.description}</p>}
          </div>
        </div>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <button className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Goal</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this goal? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" disabled={pending} onClick={confirmDelete}>
                {pending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goal.targetValue ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">{goal.currentValue} / {goal.targetValue} {goal.unit ?? ""}</span>
              <span className="font-medium text-[var(--fg)]">{percentage}%</span>
            </div>
            <Progress value={percentage} />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Progress: {goal.currentValue} {goal.unit ?? ""}</p>
        )}
        {!goal.completed && (
          <div className="mt-3 flex items-center gap-2">
            <Input type="number" placeholder="Update progress"
              value={progressInputs[goal.id] ?? ""}
              onChange={(e) => setProgressInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))}
              className="h-8 text-sm" />
            <Button size="sm" variant="secondary" onClick={handleUpdateProgress}
              disabled={pending || !progressInputs[goal.id]}>
              {pending ? "..." : "Update"}
            </Button>
          </div>
        )}
        {goal.dueDate && <p className="mt-2 text-xs text-[var(--muted)]">Due {formatDate(goal.dueDate)}</p>}
      </CardContent>
    </Card>
  )
}
