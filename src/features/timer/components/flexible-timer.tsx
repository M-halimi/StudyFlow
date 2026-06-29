"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, RotateCcw, BookOpen, Briefcase, Coffee, CupSoda } from "lucide-react"
import { startSession, endSession, pauseSession, resumeSession, autoSaveSession } from "@/features/sessions/actions/session-actions"
import { playSessionEndSound } from "@/lib/notification-sound"
import { toast } from "sonner"
import { motion } from "motion/react"

interface InitialSession {
  id: string
  sessionType: string
  topicId: string | null
  plannedDuration: number
  remainingTime: number
  status: string
}

interface FlexibleTimerProps {
  topics?: { id: string; name: string; subjectName: string }[]
  initialSession?: InitialSession | null
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

export function FlexibleTimer({ topics = [], initialSession }: FlexibleTimerProps) {
  const initDur = initialSession?.plannedDuration || 30
  const initRemaining = initialSession?.remainingTime ?? initDur * 60

  const [duration, setDuration] = useState(initDur)
  const [timeLeft, setTimeLeft] = useState(initRemaining)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(!!initialSession)
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null)
  const [selectedTopic, setSelectedTopic] = useState(initialSession?.topicId ?? "")
  const [sessionType, setSessionType] = useState<string>(initialSession?.sessionType ?? "STUDY")
  const [notes, setNotes] = useState("")

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef(sessionId)
  const timeLeftRef = useRef(timeLeft)
  const notesRef = useRef(notes)
  const sessionTypeRef = useRef(sessionType)
  const selectedTopicRef = useRef(selectedTopic)
  const durationRef = useRef(duration)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])
  useEffect(() => { notesRef.current = notes }, [notes])
  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])
  useEffect(() => { selectedTopicRef.current = selectedTopic }, [selectedTopic])
  useEffect(() => { durationRef.current = duration }, [duration])

  const saveToServer = useCallback(async (remainingSeconds: number) => {
    const sid = sessionIdRef.current
    if (!sid) return
    try {
      await autoSaveSession(sid, remainingSeconds)
    } catch {
    }
  }, [])

  const completeSession = useCallback(async (rt: number) => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)

    const type = sessionTypeRef.current
    playSessionEndSound(type as "STUDY" | "WORK" | "BREAK" | "COFFEE")

    const sid = sessionIdRef.current
    if (sid) {
      await endSession(sid, rt, notesRef.current || undefined)
      setSessionId(null)
      toast.success(rt === 0 ? "Session complete!" : "Session saved")
    }

    setHasStarted(false)
    setTimeLeft(durationRef.current * 60)
    setNotes("")
  }, [])

  function setNewDuration(minutes: number) {
    if (isRunning) return
    setDuration(minutes)
    setTimeLeft(minutes * 60)
    setHasStarted(false)
  }

  async function handleStart() {
    if (hasStarted) {
      setIsRunning(true)
      if (sessionIdRef.current) {
        await resumeSession(sessionIdRef.current)
      }
      return
    }

    const result = await startSession(selectedTopic || undefined, sessionType, duration)
    setSessionId(result.id)
    setHasStarted(true)
    setIsRunning(true)
  }

  async function handlePause() {
    setIsRunning(false)
    if (sessionIdRef.current) {
      await pauseSession(sessionIdRef.current, timeLeftRef.current)
    }
  }

  async function handleStop() {
    await saveToServer(timeLeftRef.current)
    await completeSession(timeLeftRef.current)
  }

  async function handleReset() {
    const sid = sessionIdRef.current
    if (sid) {
      await saveToServer(timeLeftRef.current)
      await endSession(sid, timeLeftRef.current, notesRef.current || undefined).catch(() => {})
    }
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    setHasStarted(false)
    setTimeLeft(duration * 60)
    setSessionId(null)
    setNotes("")
  }

  async function handleComplete() {
    await completeSession(0)
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
    }, 1000)

    autoSaveRef.current = setInterval(() => {
      const sid = sessionIdRef.current
      const tl = timeLeftRef.current
      if (sid && tl > 0) {
        autoSaveSession(sid, tl).catch(() => {})
      }
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [isRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sid = sessionIdRef.current
      const tl = timeLeftRef.current
      if (sid && isRunning) {
        navigator.sendBeacon("/api/sessions/auto-save", JSON.stringify({ id: sid, remainingTime: tl }))
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isRunning])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = duration * 60
  const progress = totalSeconds > 0 ? 1 - timeLeft / totalSeconds : 0
  const statusText = !hasStarted ? "Ready" : isRunning ? (TYPE_LABELS[sessionType] ?? "Studying...") : "Paused"

  const circleRadius = 130
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference * (1 - progress)

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
            <label className="text-sm font-medium text-[var(--fg)]">Duration (minutes)</label>
            <Input
              type="number"
              min={1}
              max={480}
              value={duration}
              onChange={(e) => setNewDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center text-lg font-medium"
            />
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

          {initialSession && (
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-3 text-center">
              <p className="text-sm font-medium text-[var(--fg)]">Resume previous session</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {initialSession.status === "PAUSED" ? "You have a paused session" : "Session was still active"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
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

      <div className="relative flex items-center justify-center">
        <svg width="300" height="300" className="-rotate-90">
          <circle
            cx="150" cy="150" r={circleRadius}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="6"
          />
          {hasStarted && (
            <motion.circle
              cx="150" cy="150" r={circleRadius}
              fill="none"
              stroke={
                !isRunning ? "var(--muted)" :
                sessionType === "WORK" ? "var(--warning)" :
                sessionType === "BREAK" ? "var(--success)" :
                sessionType === "COFFEE" ? "var(--danger)" :
                "var(--primary)"
              }
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={!isRunning ? "opacity-50" : ""}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span key={timeLeft} className="text-6xl font-bold tabular-nums text-[var(--fg)]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.span>
          <span className="text-sm text-[var(--muted)] mt-1">{statusText}</span>
        </div>
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
