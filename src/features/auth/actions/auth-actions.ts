"use server"

import { hash } from "bcryptjs"
import { signIn } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import { z } from "zod"
import { redirect } from "next/navigation"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

const registerSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters" }),
  email: z.email({ error: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" }),
})

async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() ?? "unknown"
}

export async function register(prevState: unknown, formData: FormData) {
  const ip = await getClientIp()

  if (!checkRateLimit(`register:${ip}`)) {
    return { error: "Too many attempts. Please try again later." }
  }

  const validated = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]
    return { error: firstIssue?.message ?? "Invalid input" }
  }

  const { name, email, password } = validated.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "An account with this email already exists" }
  }

  const hashedPassword = await hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      settings: { create: {} },
    },
  })

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch {
    resetRateLimit(`register:${ip}`)
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/dashboard")
}

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const ip = await getClientIp()

  if (!checkRateLimit(`login:${ip}`)) {
    return { error: "Too many attempts. Please try again later." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    return { error: "Something went wrong" }
  }

  redirect("/dashboard")
}
