import "server-only"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cache } from "react"

export const verifySession = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  return { userId: session.user.id, user: session.user }
})

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
})
