"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "@/providers/theme"
import { useSidebar } from "@/components/shared/sidebar-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Sun,
  Moon,
  Monitor,
  Menu,
} from "lucide-react"
import { useMemo } from "react"
import { NotificationDropdown } from "@/features/notifications/components/notification-dropdown"

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subjects": "Subjects",
  "/planner": "Planner",
  "/timer": "Focus Timer",
  "/statistics": "Statistics",
  "/goals": "Goals",
  "/journal": "Journal",
  "/search": "Search",
  "/settings": "Settings",
}

export function TopNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const { setMobileOpen } = useSidebar()

  const breadcrumb = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean)
    if (parts.length === 0) return "Dashboard"
    const base = `/${parts[0]}`
    return breadcrumbMap[base] ?? "Dashboard"
  }, [pathname])

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const

  return (
    <header className="sticky top-3 z-30 mx-auto mb-4 flex h-12 w-[calc(100%-1.5rem)] items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--navbar)] px-4 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden text-[var(--muted)]"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-[var(--fg)]">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Link href="/search">
          <Button variant="ghost" size="icon-sm" className="text-[var(--muted)]">
            <Search className="h-4 w-4" />
          </Button>
        </Link>

        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-[var(--muted)]">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themes.map((t) => {
              const Icon = t.icon
              return (
                <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}>
                  <Icon className="mr-2 h-4 w-4" />
                  {t.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-5 w-px bg-[var(--border)]" />

        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--surface-hover)]">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {session.user.name?.[0] ?? session.user.email?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-[var(--fg)]">{session.user.name}</p>
                <p className="text-xs text-[var(--muted)]">{session.user.email}</p>
              </div>
              <div className="h-px bg-[var(--border)] my-1" />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
