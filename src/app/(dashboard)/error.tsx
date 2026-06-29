"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--danger-bg)] mb-4">
            <AlertTriangle className="h-6 w-6 text-[var(--danger)]" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted)]">
            We encountered an error loading your dashboard. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-2 text-xs text-[var(--danger)] font-mono break-all">
              {error.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
