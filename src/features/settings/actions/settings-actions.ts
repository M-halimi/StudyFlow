"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const settingsSchema = z.object({
  focusDuration: z.coerce.number().min(1, { error: "Must be at least 1" }).max(120, { error: "Must be at most 120" }),
  breakDuration: z.coerce.number().min(1, { error: "Must be at least 1" }).max(30, { error: "Must be at most 30" }),
  longBreakDuration: z.coerce.number().min(1, { error: "Must be at least 1" }).max(60, { error: "Must be at most 60" }),
  dailyGoalMinutes: z.coerce.number().min(1, { error: "Must be at least 1" }).max(480, { error: "Must be at most 480" }),
  weeklyGoalDays: z.coerce.number().min(1, { error: "Must be at least 1" }).max(7, { error: "Must be at most 7" }),
})

export async function updateSettings(formData: FormData) {
  const { userId } = await verifySession()

  const validated = settingsSchema.safeParse({
    focusDuration: formData.get("focusDuration"),
    breakDuration: formData.get("breakDuration"),
    longBreakDuration: formData.get("longBreakDuration"),
    dailyGoalMinutes: formData.get("dailyGoalMinutes"),
    weeklyGoalDays: formData.get("weeklyGoalDays"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.userSettings.upsert({
    where: { userId },
    update: validated.data,
    create: { userId, ...validated.data },
  })

  revalidatePath("/settings")
}
