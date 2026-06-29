import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Timer, BarChart3 } from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  const features = [
    { icon: BookOpen, title: "Subjects & Topics", desc: "Organize your learning with subjects, categories, and topics" },
    { icon: Timer, title: "Pomodoro Timer", desc: "Stay focused with built-in study sessions and breaks" },
    { icon: BarChart3, title: "Progress Analytics", desc: "Track your study time, goals, and achievements" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[var(--fg)]">StudyFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 mb-6">
          <Sparkles className="h-7 w-7 text-[var(--primary)]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-[var(--fg)] max-w-2xl">
          Your learning journey, organized.
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-md mb-8">
          StudyFlow helps you track subjects, plan study sessions, and stay consistent with your goals.
        </p>
        <Link href="/register">
          <Button size="lg" className="h-12 px-8 text-base">Start studying free</Button>
        </Link>

        <div className="grid gap-4 sm:grid-cols-3 mt-20 max-w-2xl w-full">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 mb-3">
                  <Icon className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--fg)]">{f.title}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
