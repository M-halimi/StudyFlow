"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"
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

export async function register(formData: FormData) {
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

  return { success: true }
}
