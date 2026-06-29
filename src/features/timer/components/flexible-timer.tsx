"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, RotateCcw, BookOpen, Briefcase, Coffee, CupSoda } from "lucide-react"
import { startSession, endSession, pauseSession, resumeSession } from "@/features/sessions/actions/session-actions"
import { playSessionEndSound } from "@/lib/notification-sound"
import { toast } from "sonner"
import { motion } from "motion/react"

interface FlexibleTimerProps {
  topics?: { id: string; name: string; subjectName: string }[]
}

const PRESETS = [15, 30, 60, 90]

const SESSION_TYPES = [
  { value: "STUDY", label: "Study", icon: BookOpen },
  { value: "WORK", label: "Work", icon: Briefcase },
  { value: "BREAK", label: "Break", icon: Coffee },
  { value: "COFFEE", label: "Coffee", icon: CupSoda },
] as const

const TYPE_LABELS: Record<string, string> = {
  STUDY: "Studying...",
  WORK: "Working...",
  BREAK: "On break...",
  COFFEE: "Coffee time...",
}

export function FlexibleTimer({ topics = [] }: FlexibleTimerProps) {
  const [duration, setDuration] = useState(30)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [sessionType, setSessionType] = useState<string>("STUDY")
  const [sessionTitle, setSessionTitle] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [notes, setNotes] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef(sessionId)
  const elapsedRef = useRef(elapsedSeconds)
  const notesRef = useRef(notes)
  const sessionTypeRef = useRef(sessionType)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { elapsedRef.current = elapsedSeconds }, [elapsedSeconds])
  useEffect(() => { notesRef.current = notes }, [notes])
  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])

  function setNewDuration(minutes: number) {
    if (isRunning) return
    setDuration(minutes)
    setTimeLeft(minutes * 60)
    setHasStarted(false)
    setElapsedSeconds(0)
  }

  async function handleStart() {
    if (hasStarted) {
      setIsRunning(true)
      if (sessionIdRef.current) {
        await resumeSession(sessionIdRef.current)
      }
      return
    }

    const result = await startSession(selectedTopic || undefined, sessionType, sessionTitle || undefined)
    setSessionId(result.id)
    setHasStarted(true)
    setIsRunning(true)
    setSessionTitle("")
  }

  async function handlePause() {
    setIsRunning(false)
    if (sessionIdRef.current) {
      await pauseSession(sessionIdRef.current)
    }
  }

  function playEndSound() {
    const type = sessionTypeRef.current
    playSessionEndSound(type as "STUDY" | "WORK" | "BREAK" | "COFFEE")
  }

  async function handleStop() {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    playEndSound()

    if (sessionIdRef.current) {
      const actualMinutes = Math.max(1, Math.round(elapsedRef.current / 60))
      await endSession(sessionIdRef.current, actualMinutes, notesRef.current || undefined)
      setSessionId(null)
      toast.success("Session saved")
    }

    setHasStarted(false)
    setTimeLeft(duration * 60)
    setElapsedSeconds(0)
    setNotes("")
  }

  function handleReset() {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setHasStarted(false)
    setTimeLeft(duration * 60)
    setElapsedSeconds(0)
    setSessionId(null)
    setNotes("")
  }

  async function handleComplete() {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    playEndSound()

    if (sessionIdRef.current) {
      const actualMinutes = Math.max(1, Math.round(elapsedRef.current / 60))
      await endSession(sessionIdRef.current, actualMinutes, notesRef.current || undefined)
      setSessionId(null)
      toast.success("Session complete!")
    }

    setHasStarted(false)
    setTimeLeft(duration * 60)
    setElapsedSeconds(0)
    setNotes("")
  }

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          handleComplete()
          return 0
        }
        return prev - 1
      })
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = duration * 60
  const progress = totalSeconds > 0 ? 1 - timeLeft / totalSeconds : 0
  const statusText = !hasStarted ? "Ready" : isRunning ? (TYPE_LABELS[sessionType] ?? "Studying...") : "Paused"

  return (
    <div className="flex flex-col items-center space-y-6">
      {!hasStarted ? (
        <div className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg)]">Session Type</label>
            <div className="grid grid-cols-4 gap-2">
              {SESSION_TYPES.map((t) => {
                const Icon = t.icon
                const isActive = sessionType === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => { if (!isRunning) setSessionType(t.value) }}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg)]">Title (optional)</label>
            <Input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Math review, Chapter 5..."
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg)]">Study Duration (minutes)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={480}
                value={duration}
                onChange={(e) => setNewDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center text-lg font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setNewDuration(p)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  duration === p
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--fg)]"
                }`}
              >
                {p}m
              </button>
            ))}
          </div>

          {topics.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fg)]">Topic (optional)</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">General Study</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subjectName})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md space-y-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
            <motion.div
              className="h-full rounded-full bg-[var(--primary)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>{Math.round(progress * 100)}%</span>
            <span>{duration} min</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--fg)]">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you study?"
              rows={2}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              disabled={isRunning}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-baseline gap-1">
          <motion.span key={timeLeft} className="text-7xl font-bold tabular-nums text-[var(--fg)]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.span>
        </div>
        <span className="text-sm text-[var(--muted)]">{statusText}</span>
      </div>

      <div className="flex items-center gap-3">
        {!hasStarted ? (
          <Button onClick={handleStart} disabled={duration < 1} size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-[var(--primary)]/20">
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        ) : isRunning ? (
          <Button onClick={handlePause} size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-[var(--primary)]/20">
            <Pause className="h-6 w-6" />
          </Button>
        ) : (
          <Button onClick={handleStart} size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-[var(--primary)]/20">
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        )}

        {hasStarted && (
          <Button onClick={handleStop} variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Square className="h-4 w-4" />
          </Button>
        )}

        <Button onClick={handleReset} variant="outline" size="icon" className="h-10 w-10 rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
