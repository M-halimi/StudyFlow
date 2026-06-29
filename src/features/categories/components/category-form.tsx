"use client"

import { useState } from "react"
import { createCategory, updateCategory } from "@/features/categories/actions/category-actions"
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
import { Plus } from "lucide-react"

interface CategoryFormProps {
  subjectId: string
  mode?: "create" | "edit"
  defaultValues?: { id: string; name: string; description: string }
  children?: React.ReactNode
}

export function CategoryForm({
  subjectId,
  mode = "create",
  defaultValues,
  children,
}: CategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const action = mode === "create"
      ? createCategory.bind(null, subjectId)
      : updateCategory.bind(null, defaultValues!.id)
    try {
      const result = await action(formData)
      if (result?.error) { setError(result.error); setPending(false) }
      else { setOpen(false) }
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
            Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new category to organize your topics" : "Update your category"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={defaultValues?.name} placeholder="e.g. Grammar, Vocabulary" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" name="description" defaultValue={defaultValues?.description} placeholder="Brief description" />
            </div>
            {error && <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] rounded-xl p-3">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
