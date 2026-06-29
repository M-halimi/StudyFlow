import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[var(--fg)]">StudyFlow</span>
          </Link>
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-[var(--primary)]/5 items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[var(--fg)]">Your learning journey, organized.</h2>
            <p className="text-[var(--muted)]">Track subjects, plan sessions, and stay consistent with your goals.</p>
          </div>
          <div className="grid gap-3">
            {[
              { title: "Smart Planning", desc: "Organize subjects, categories, and topics" },
              { title: "Pomodoro Timer", desc: "Stay focused with built-in study sessions" },
              { title: "Progress Tracking", desc: "Monitor your achievements and growth" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm font-semibold text-[var(--fg)]">{item.title}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
