"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bell, Clock, ListChecks, RefreshCw, Info, CheckCheck } from "lucide-react"
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, getNotificationSoundMode } from "@/features/notifications/actions/notification-actions"
import { playNotificationSound } from "@/lib/notification-sound"
import { formatDistanceToNow } from "date-fns"

const IMPORTANT_TYPES = new Set(["REVISION_ALERT", "TASK_REMINDER"])

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  isRead: boolean
  createdAt: Date
}

const typeIcons: Record<string, typeof Bell> = {
  TASK_REMINDER: ListChecks,
  REVISION_ALERT: RefreshCw,
  SESSION_UPDATE: Clock,
  SYSTEM: Info,
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const latestIdRef = useRef<string | null>(null)
  const soundModeRef = useRef<string>("important")
  const router = useRouter()

  const fetch = useCallback(async () => {
    const [items, count, mode] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
      getNotificationSoundMode(),
    ])
    const typed = items as Notification[]
    setNotifications(typed)
    setUnreadCount(count)
    soundModeRef.current = mode

    if (mode !== "off" && typed.length > 0 && typed[0].id !== latestIdRef.current) {
      const latest = typed[0]
      const shouldPlay = mode === "all" || (mode === "important" && IMPORTANT_TYPES.has(latest.type))
      if (shouldPlay && document.visibilityState === "visible") {
        playNotificationSound()
      }
      latestIdRef.current = latest.id
    }
  }, [])

  useEffect(() => {
    getUnreadCount().then(setUnreadCount)
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [fetch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleClick(item: Notification) {
    if (!item.isRead) {
      await markAsRead(item.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      )
    }
    if (item.link) {
      router.push(item.link)
      setOpen(false)
    }
  }

  async function handleMarkAllRead() {
    await markAllAsRead()
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative text-[var(--muted)]"
        onClick={() => { setOpen(!open); if (!open) fetch() }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="text-sm font-semibold text-[var(--fg)]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell className="h-8 w-8 text-[var(--muted)] opacity-40" />
                <p className="text-sm text-[var(--muted)]">No notifications yet</p>
                <p className="text-xs text-[var(--muted)] opacity-60">Your notifications will appear here</p>
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = typeIcons[item.type] ?? Bell
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)] border-b border-[var(--border)] last:border-0 ${
                      !item.isRead ? "bg-[var(--primary)]/[0.03]" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      item.type === "TASK_REMINDER" ? "bg-[var(--warning)]/10" :
                      item.type === "REVISION_ALERT" ? "bg-[var(--danger)]/10" :
                      item.type === "SESSION_UPDATE" ? "bg-[var(--success)]/10" :
                      "bg-[var(--primary)]/10"
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        item.type === "TASK_REMINDER" ? "text-[var(--warning)]" :
                        item.type === "REVISION_ALERT" ? "text-[var(--danger)]" :
                        item.type === "SESSION_UPDATE" ? "text-[var(--success)]" :
                        "text-[var(--primary)]"
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${!item.isRead ? "font-semibold text-[var(--fg)]" : "text-[var(--fg)]"}`}>
                        {item.title}
                      </p>
                      {item.message && (
                        <p className="text-xs text-[var(--muted)] truncate mt-0.5">{item.message}</p>
                      )}
                      <p className="text-[11px] text-[var(--muted)] opacity-60 mt-1">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!item.isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
