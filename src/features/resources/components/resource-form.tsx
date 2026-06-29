"use client"

import { useState } from "react"
import { createResource } from "@/features/resources/actions/resource-actions"
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

interface ResourceFormProps {
  topicId: string
  children?: React.ReactNode
}

export function ResourceForm({ topicId, children }: ResourceFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("WEBSITE")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const action = createResource.bind(null, topicId)

    try {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
        setPending(false)
      } else {
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
            Resource
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Add a link, video, PDF, or other study resource
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g. German Grammar Guide" required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <input type="hidden" name="type" value={type} />
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXERCISE">Exercise</SelectItem>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (optional)</Label>
              <Input id="url" name="url" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" name="description" placeholder="Brief note about this resource" />
            </div>
            {error && <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] rounded-xl p-3">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
