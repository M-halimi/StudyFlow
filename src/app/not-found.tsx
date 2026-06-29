import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 mb-6">
        <Sparkles className="h-7 w-7 text-[var(--primary)]" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-[var(--fg)] mb-2">Page not found</h1>
      <p className="text-[var(--muted)] mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  )
}
