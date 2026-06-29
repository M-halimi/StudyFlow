"use client"

import { useState } from "react"
import { createNote, updateNote } from "@/features/notes/actions/note-actions"
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
import { Plus, Pencil } from "lucide-react"
import { toast } from "sonner"

interface NoteFormProps {
  topicId: string
  mode?: "create" | "edit"
  defaultValues?: {
    id: string
    title: string
    content: string
  }
  children?: React.ReactNode
}

export function NoteForm({ topicId, mode = "create", defaultValues, children }: NoteFormProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const action = mode === "create"
      ? createNote.bind(null, topicId)
      : updateNote.bind(null, defaultValues!.id)

    try {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
        setPending(false)
      } else {
        toast.success(mode === "create" ? "Note added" : "Note updated")
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
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Note" : "Edit Note"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Write down your study notes" : "Update your note"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={defaultValues?.title}
                placeholder="Note title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                name="content"
                defaultValue={defaultValues?.content}
                placeholder="Write your notes here..."
                required
                rows={10}
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] rounded-xl p-3">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
