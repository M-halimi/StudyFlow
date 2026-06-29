"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const goalSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().nullish().transform(v => v ?? undefined),
  targetValue: z.coerce.number(),
  unit: z.string().nullish().transform(v => v ?? undefined),
  dueDate: z.string().nullish().transform(v => v ?? undefined),
})

export async function createGoal(formData: FormData) {
  const { userId } = await verifySession()

  const validated = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    targetValue: formData.get("targetValue"),
    unit: formData.get("unit"),
    dueDate: formData.get("dueDate"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.goal.create({
    data: {
      userId,
      title: validated.data.title,
      description: validated.data.description,
      targetValue: validated.data.targetValue,
      unit: validated.data.unit,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
    },
  })

  revalidatePath("/goals")
}

export async function updateGoalProgress(id: string, currentValue: number) {
  const { userId } = await verifySession()

  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) {
    return { error: "Not found" }
  }

  const completed = goal.targetValue != null && currentValue >= goal.targetValue

  await prisma.goal.update({
    where: { id },
    data: { currentValue, completed },
  })

  revalidatePath("/goals")
}

export async function deleteGoal(id: string) {
  const { userId } = await verifySession()

  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) {
    return { error: "Not found" }
  }

  await prisma.goal.delete({ where: { id } })

  revalidatePath("/goals")
}
