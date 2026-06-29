"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee } from "lucide-react"
import { startSession, endSession } from "@/features/sessions/actions/session-actions"
import { toast } from "sonner"
import { motion } from "motion/react"

type TimerMode = "focus" | "break" | "longBreak"

interface PomodoroTimerProps {
  defaultFocus?: number
  defaultBreak?: number
  defaultLongBreak?: number
  topics?: { id: string; name: string; subjectName: string }[]
}

export function PomodoroTimer({
  defaultFocus = 25,
  defaultBreak = 5,
  defaultLongBreak = 15,
  topics = [],
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(defaultFocus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modeRef = useRef(mode)
  const sessionIdRef = useRef(sessionId)
  const elapsedRef = useRef(elapsedSeconds)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { elapsedRef.current = elapsedSeconds }, [elapsedSeconds])

  const durations: Record<TimerMode, number> = {
    focus: defaultFocus * 60,
    break: defaultBreak * 60,
    longBreak: defaultLongBreak * 60,
  }

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(durations[mode])
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [mode])

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false)
    const currentMode = modeRef.current
    if (currentMode === "focus") {
      setCompletedPomodoros((prev) => {
        const newCount = prev + 1
        if (sessionIdRef.current) {
          endSession(sessionIdRef.current, elapsedRef.current / 60)
          setSessionId(null)
          setElapsedSeconds(0)
        }
        toast.success("Focus session complete! Take a break.")
        if (newCount % 4 === 0) {
          setMode("longBreak")
          setTimeLeft(defaultLongBreak * 60)
        } else {
          setMode("break")
          setTimeLeft(defaultBreak * 60)
        }
        return newCount
      })
    } else {
      setMode("focus")
      setTimeLeft(defaultFocus * 60)
      toast.success("Break over! Ready to focus?")
    }
  }, [defaultFocus, defaultBreak, defaultLongBreak])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, handleTimerComplete])

  async function toggleTimer() {
    if (isRunning) { setIsRunning(false); return }
    if (mode === "focus" && !sessionId) {
      const result = await startSession(selectedTopic || undefined)
      setSessionId(result.id)
    }
    setIsRunning(true)
  }

  function skipBreak() {
    setIsRunning(false)
    setMode("focus")
    setTimeLeft(defaultFocus * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = 1 - timeLeft / (durations[mode] || 1)
  const circumference = 2 * Math.PI * 130
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1">
        {(["focus", "break", "longBreak"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { if (!isRunning) { setMode(m); setTimeLeft(durations[m]); resetTimer() } }}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {m === "focus" ? "Focus" : m === "break" ? "Break" : "Long Break"}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="300" height="300" className="-rotate-90">
          <circle cx="150" cy="150" r="130" fill="none" stroke="var(--secondary)" strokeWidth="6" />
          <motion.circle
            cx="150" cy="150" r="130" fill="none"
            stroke={mode === "focus" ? "var(--primary)" : mode === "break" ? "var(--success)" : "var(--warning)"}
            strokeWidth="6" strokeDasharray={circumference}
            strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span key={timeLeft} className="text-6xl font-bold tabular-nums text-[var(--fg)]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.span>
          <span className="text-sm text-[var(--muted)] mt-1">
            {mode === "focus" ? "Focus Time" : mode === "break" ? "Break" : "Long Break"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={toggleTimer} size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-[var(--primary)]/20">
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>
        <Button onClick={() => resetTimer()} variant="outline" size="icon" className="h-10 w-10 rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>
        {mode !== "focus" && (
          <Button onClick={skipBreak} variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <Coffee className="h-4 w-4" />
          </Button>
        )}
      </div>

      {mode === "focus" && topics.length > 0 && (
        <div className="w-full max-w-xs">
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

      <p className="text-sm text-[var(--muted)]">
        Completed <span className="font-semibold text-[var(--fg)]">{completedPomodoros}</span> pomodoro{completedPomodoros !== 1 ? "s" : ""} today
      </p>
    </div>
  )
}
