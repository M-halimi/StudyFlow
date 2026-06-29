"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "motion/react"
import { useSidebar } from "./sidebar-context"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Timer,
  BarChart3,
  Target,
  Trophy,
  FileText,
  Search,
  Settings,
  LogOut,
  BookMarked,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/timer", label: "Focus Timer", icon: Timer },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/journal", label: "Journal", icon: FileText },
  { href: "/templates", label: "Templates", icon: BookMarked },
]

const bottomItems = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
]

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-lg"
    >
      <div className={cn(
        "flex items-center border-b border-[var(--sidebar-border)] px-4",
        collapsed ? "justify-center h-14" : "justify-between h-14"
      )}>
        {!collapsed && (
          <Link href="/dashboard" onClick={onNavClick} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--sidebar-fg)]">
              StudyFlow
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" onClick={onNavClick}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--fg)]",
            collapsed && "hidden"
          )}
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.div
              key={item.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              <Link href={item.href} onClick={onNavClick}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--sidebar-fg)]"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[var(--primary)]")} />
                  {!collapsed && <span>{item.label}</span>}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-2 space-y-0.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--sidebar-fg)]",
            collapsed && "justify-center px-2"
          )}
        >
          <PanelLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onNavClick}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--sidebar-fg)]"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[var(--primary)]")} />
                {!collapsed && <span>{item.label}</span>}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {!collapsed && session?.user && (
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]">
              {session.user.name?.[0] ?? session.user.email?.[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--sidebar-fg)]">
                {session.user.name ?? "User"}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}

function CollapsedToggle() {
  const { collapsed, setCollapsed } = useSidebar()
  if (!collapsed) return null
  return (
    <div className="fixed left-3 top-3 z-50">
      <button
        onClick={() => setCollapsed(false)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-lg text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
      >
        <PanelLeft className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <div className="hidden lg:flex fixed left-3 top-3 bottom-3 z-40">
        <SidebarContent />
      </div>
      <CollapsedToggle />
    </>
  )
}

export function MobileSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebar()

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] p-3 lg:hidden"
          >
            <div className="relative h-full">
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute -right-2 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar)] shadow-md text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
