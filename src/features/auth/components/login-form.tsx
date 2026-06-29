"use client"

import { useActionState } from "react"
import Link from "next/link"
import { login } from "@/features/auth/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your StudyFlow account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="hello@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error && (
            <p className="text-sm text-[var(--danger)] bg-[var(--danger-bg)] rounded-xl p-3">{state.error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--fg)] font-medium hover:text-[var(--primary)] transition-colors">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
