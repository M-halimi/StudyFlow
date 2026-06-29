"use client"

import { useState } from "react"
import { updateSettings } from "@/features/settings/actions/settings-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Timer, Target, Bell } from "lucide-react"

interface UserSettings {
  id: string
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  dailyGoalMinutes: number
  weeklyGoalDays: number
  notificationEnabled: boolean
  soundMode: string
}

export function SettingsForm({ settings }: { settings: UserSettings | null }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await updateSettings(formData)
    if (result?.error) { setError(result.error) }
    else { toast.success("Settings saved") }
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[var(--muted)]" />
              <CardTitle>Pomodoro Timer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="focusDuration">Focus Duration (min)</Label>
                <Input id="focusDuration" name="focusDuration" type="number"
                  defaultValue={settings?.focusDuration ?? 25} min={1} max={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break Duration (min)</Label>
                <Input id="breakDuration" name="breakDuration" type="number"
                  defaultValue={settings?.breakDuration ?? 5} min={1} max={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">Long Break (min)</Label>
                <Input id="longBreakDuration" name="longBreakDuration" type="number"
                  defaultValue={settings?.longBreakDuration ?? 15} min={1} max={60} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--muted)]" />
              <CardTitle>Study Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dailyGoalMinutes">Daily Goal (minutes)</Label>
                <Input id="dailyGoalMinutes" name="dailyGoalMinutes" type="number"
                  defaultValue={settings?.dailyGoalMinutes ?? 120} min={1} max={480} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyGoalDays">Weekly Goal (days)</Label>
                <Input id="weeklyGoalDays" name="weeklyGoalDays" type="number"
                  defaultValue={settings?.weeklyGoalDays ?? 5} min={1} max={7} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--muted)]" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationEnabled"
                  defaultChecked={settings?.notificationEnabled ?? true}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--fg)]">Enable notifications</span>
                  <p className="text-xs text-[var(--muted)]">Receive notifications for tasks, sessions, and revisions</p>
                </div>
              </label>
              <div className="space-y-2">
                <Label htmlFor="soundMode">Notification sound</Label>
                <select
                  id="soundMode"
                  name="soundMode"
                  defaultValue={settings?.soundMode ?? "important"}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="off">Off</option>
                  <option value="important">Important only (default)</option>
                  <option value="all">All notifications</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] rounded-xl p-3">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </form>
  )
}
