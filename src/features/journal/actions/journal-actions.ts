"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const journalSchema = z.object({
  wins: z.string().nullish().transform(v => v ?? undefined),
  struggles: z.string().nullish().transform(v => v ?? undefined),
  learned: z.string().nullish().transform(v => v ?? undefined),
  plan: z.string().nullish().transform(v => v ?? undefined),
  mood: z.string().nullish().transform(v => v ?? undefined),
})

export async function saveJournalEntry(formData: FormData) {
  const { userId } = await verifySession()

  const validated = journalSchema.safeParse({
    wins: formData.get("wins"),
    struggles: formData.get("struggles"),
    learned: formData.get("learned"),
    plan: formData.get("plan"),
    mood: formData.get("mood") || null,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input" }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.journal.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    update: {
      wins: validated.data.wins,
      struggles: validated.data.struggles,
      learned: validated.data.learned,
      plan: validated.data.plan,
      mood: validated.data.mood ? (validated.data.mood as any) : null,
    },
    create: {
      userId,
      date: today,
      wins: validated.data.wins,
      struggles: validated.data.struggles,
      learned: validated.data.learned,
      plan: validated.data.plan,
      mood: validated.data.mood ? (validated.data.mood as any) : null,
    },
  })

  revalidatePath("/journal")
}

export async function getJournalEntry(dateStr: string) {
  const { userId } = await verifySession()

  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  const entry = await prisma.journal.findUnique({
    where: {
      userId_date: { userId, date },
    },
  })

  return entry
}
