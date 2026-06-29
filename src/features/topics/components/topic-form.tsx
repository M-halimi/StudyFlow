"use client"

import { useState } from "react"
import { createTopic, updateTopic } from "@/features/topics/actions/topic-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface TopicFormProps {
  categoryId: string
  mode?: "create" | "edit"
  defaultValues?: {
    id: string
    name: string
    description: string
    difficulty: string
    status: string
    estimatedMinutes: number
    tags: string[]
  }
  children?: React.ReactNode
}

export function TopicForm({
  categoryId,
  mode = "create",
  defaultValues,
  children,
}: TopicFormProps) {
  const [open, setOpen] = useState(false)
  const [difficulty, setDifficulty] = useState(defaultValues?.difficulty ?? "BEGINNER")
  const [status, setStatus] = useState(defaultValues?.status ?? "NOT_STARTED")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const action =
      mode === "create"
        ? createTopic.bind(null, categoryId)
        : updateTopic.bind(null, defaultValues!.id)

    try {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
        setPending(false)
      } else {
        toast.success(mode === "create" ? "Topic created" : "Topic updated")
        setOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Topic
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Topic" : "Edit Topic"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new topic to study"
              : "Update your topic"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaultValues?.name}
                placeholder="e.g. Relativsatz, Genitiv"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={defaultValues?.description}
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <input type="hidden" name="difficulty" value={difficulty} />
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <input type="hidden" name="status" value={status} />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="LEARNING">Learning</SelectItem>
                    <SelectItem value="NEED_REVISION">Need Revision</SelectItem>
                    <SelectItem value="MASTERED">Mastered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated Time (minutes)</Label>
              <Input
                id="estimatedMinutes"
                name="estimatedMinutes"
                type="number"
                defaultValue={defaultValues?.estimatedMinutes}
                placeholder="e.g. 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={defaultValues?.tags?.join(", ")}
                placeholder="e.g. grammar, important, exam"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
