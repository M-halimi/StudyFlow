import type { User } from "next-auth"

export type AuthUser = User & {
  id: string
}

export type ActionState = {
  error?: string
  success?: string
  [key: string]: unknown
}
