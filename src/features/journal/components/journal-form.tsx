"use client"

import { useState } from "react"
import { saveJournalEntry } from "@/features/journal/actions/journal-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SmilePlus, Smile, Meh, Frown, Angry } from "lucide-react"

const MOODS = [
  { value: "GREAT", icon: SmilePlus, label: "Great", color: "text-[var(--success)]" },
  { value: "GOOD", icon: Smile, label: "Good", color: "text-[var(--info)]" },
  { value: "OKAY", icon: Meh, label: "Okay", color: "text-[var(--warning)]" },
  { value: "BAD", icon: Frown, label: "Bad", color: "text-[var(--warning)]" },
  { value: "AWFUL", icon: Angry, label: "Awful", color: "text-[var(--danger)]" },
] as const

interface JournalEntry {
  id: string
  wins: string | null
  struggles: string | null
  learned: string | null
  plan: string | null
  mood: string | null
}

export function JournalForm({ entry }: { entry: JournalEntry | null }) {
  const [selectedMood, setSelectedMood] = useState(entry?.mood ?? "")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await saveJournalEntry(formData)
    if (result?.error) { toast.error(result.error) }
    else { toast.success(entry ? "Journal updated" : "Journal saved") }
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent>
            <input type="hidden" name="mood" value={selectedMood} />
            <div className="flex gap-2">
              {MOODS.map((mood) => {
                const Icon = mood.icon
                const isSelected = selectedMood === mood.value
                return (
                  <button key={mood.value} type="button"
                    onClick={() => setSelectedMood(isSelected ? "" : mood.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200 ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:border-[var(--muted)]"
                    }`}>
                    <Icon className={`h-6 w-6 ${isSelected ? mood.color : "text-[var(--muted)]"}`} />
                    <span className={`text-xs ${isSelected ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}>{mood.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {(["wins", "struggles", "learned", "plan"] as const).map((field) => (
          <Card key={field}>
            <CardHeader>
              <CardTitle>
                {field === "wins" ? "What went well?" : field === "struggles" ? "What challenges did you face?" : field === "learned" ? "What did you learn?" : "Plan for tomorrow"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea name={field} defaultValue={entry?.[field] ?? ""}
                placeholder={
                  field === "wins" ? "Write down your wins for today..." :
                  field === "struggles" ? "Write about struggles or challenges..." :
                  field === "learned" ? "Key takeaways from today..." :
                  "What do you want to study next?"
                }
                className="min-h-[100px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200" />
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : entry ? "Update Journal" : "Save Journal"}
          </Button>
        </div>
      </div>
    </form>
  )
}
