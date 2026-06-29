"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { GripVertical, Trash2, Clock, ListChecks } from "lucide-react"
import { TaskForm } from "./task-form"
import { TaskEditForm } from "./task-edit-form"
import { updateTaskStatus, reorderTasks, deleteTask } from "@/features/planner/actions/planner-actions"
import { formatDuration } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { PageTransition } from "@/components/shared/page-transition"
import { motion } from "motion/react"

interface Task {
  id: string
  title: string
  description: string | null
  subjectId: string | null
  estimatedMinutes: number | null
  priority: string
  status: string
  sortOrder: number
  dueDate: Date | null
  subject: { name: string; color: string } | null
  topic: { name: string } | null
}

interface PlannerClientProps {
  tasks: Task[]
  subjects: { id: string; name: string; color: string }[]
}

function SortableTask({ task, subjects }: { task: Task; subjects: { id: string; name: string; color: string }[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePending, setDeletePending] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const priorityColors: Record<string, string> = {
    LOW: "border-l-[var(--muted)]",
    MEDIUM: "border-l-[var(--primary)]",
    HIGH: "border-l-[var(--warning)]",
    URGENT: "border-l-[var(--danger)]",
  }

  async function confirmDelete() {
    setDeletePending(true)
    await deleteTask(task.id)
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm ${priorityColors[task.priority]} border-l-4`}>
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-[var(--muted)] hover:text-[var(--fg)]">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--fg)]">{task.title}</span>
          {task.subject && (
            <Badge variant="secondary" className="text-[10px] px-1.5"
              style={{ backgroundColor: `${task.subject.color}15`, color: task.subject.color }}>
              {task.subject.name}
            </Badge>
          )}
          <Badge variant={task.priority === "URGENT" ? "destructive" : task.priority === "HIGH" ? "warning" : "secondary"} className="text-[10px] px-1.5">
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-0.5">
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(task.estimatedMinutes)}
            </span>
          )}
          {task.topic && <span>{task.topic.name}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <TaskEditForm task={task} subjects={subjects} />
        <select
          value={task.status}
          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--fg)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <button className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" disabled={deletePending} onClick={confirmDelete}>
                {deletePending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

export function PlannerClient({ tasks, subjects }: PlannerClientProps) {
  const [items, setItems] = useState(tasks)
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const paginatedItems = items.slice(0, page * PAGE_SIZE)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    await reorderTasks(newItems.map((item, index) => ({ id: item.id, sortOrder: index })))
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Planner</h1>
            <p className="text-sm text-[var(--muted)]">
              {items.filter((t) => t.status !== "COMPLETED").length} tasks remaining
            </p>
          </div>
          <TaskForm subjects={subjects} />
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="No tasks yet"
                  description="Create your first task to get started"
                  action={<TaskForm subjects={subjects} />}
                />
              ) : (
                paginatedItems.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableTask task={task} subjects={subjects} />
                  </motion.div>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  )
}
