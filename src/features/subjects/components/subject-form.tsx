"use client"

import { useState } from "react"
import { createSubject, updateSubject } from "@/features/subjects/actions/subject-actions"
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
import * as Icons from "lucide-react"
import { Plus } from "lucide-react"

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#2563eb",
]

const ICONS = [
  "BookOpen", "Book", "BookMarked", "Library",
  "Pen", "PenTool", "Pencil", "Feather",
  "Languages", "Globe", "Code", "Atom",
  "Sigma", "Pi", "Flask", "Microscope",
  "Music", "Palette", "Camera", "Map",
]

interface SubjectFormProps {
  mode: "create" | "edit"
  defaultValues?: {
    id: string
    name: string
    color: string
    icon: string
    description: string
  }
  children?: React.ReactNode
}

export function SubjectForm({ mode, defaultValues, children }: SubjectFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(defaultValues?.color ?? COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(defaultValues?.icon ?? "BookOpen")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const action = mode === "create" ? createSubject : updateSubject.bind(null, defaultValues!.id)

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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Subject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg">{mode === "create" ? "Create Subject" : "Edit Subject"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new subject to your study plan" : "Update your subject"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[var(--fg)]">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaultValues?.name}
                placeholder="e.g. German, Programming"
                required
                className="rounded-xl border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--primary)]/50 focus:ring-[var(--ring)]"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-[var(--fg)]">Color</Label>
              <input type="hidden" name="color" value={selectedColor} />
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="h-7 w-7 rounded-xl border-2 transition-all duration-200 ease-[0.16,1,0.3,1] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? "var(--fg)" : "transparent",
                      boxShadow: selectedColor === color ? `0 0 0 2px ${color}40` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-[var(--fg)]">Icon</Label>
              <input type="hidden" name="icon" value={selectedIcon} />
              <div className="flex flex-wrap gap-2">
                {ICONS.map((iconName) => {
                  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all duration-200 ease-[0.16,1,0.3,1] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                      style={{
                        borderColor: selectedIcon === iconName ? "var(--fg)" : "var(--border)",
                        backgroundColor: selectedIcon === iconName ? `${selectedColor}15` : "var(--surface)",
                        color: selectedIcon === iconName ? selectedColor : "var(--muted-fg)",
                      }}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-[var(--fg)]">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                defaultValue={defaultValues?.description}
                placeholder="Brief description of this subject"
                className="rounded-xl border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--primary)]/50 focus:ring-[var(--ring)]"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger)]/20 px-4 py-3">
                <p className="text-sm text-[var(--danger)]">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
