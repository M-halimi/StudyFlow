"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const taskSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().nullish().transform(v => v ?? undefined),
  subjectId: z.string().nullish().transform(v => v ?? undefined),
  topicId: z.string().nullish().transform(v => v ?? undefined),
  estimatedMinutes: z.coerce.number().nullish().transform(v => v ?? undefined),
  priority: z.string().default("MEDIUM"),
  dueDate: z.string().nullish().transform(v => v ?? undefined),
})

export async function createTask(formData: FormData) {
  const { userId } = await verifySession()

  const validated = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    subjectId: formData.get("subjectId"),
    topicId: formData.get("topicId"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input" }
  }

  const maxOrder = await prisma.task.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  })

  await prisma.task.create({
    data: {
      userId,
      title: validated.data.title,
      description: validated.data.description,
      subjectId: validated.data.subjectId || null,
      topicId: validated.data.topicId || null,
      estimatedMinutes: validated.data.estimatedMinutes,
      priority: validated.data.priority as any,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath("/planner")
}

export async function updateTaskStatus(id: string, status: string) {
  await verifySession()
  await prisma.task.update({ where: { id }, data: { status: status as any } })
  revalidatePath("/planner")
}

export async function reorderTasks(tasks: { id: string; sortOrder: number }[]) {
  await verifySession()

  await Promise.all(
    tasks.map((t) =>
      prisma.task.update({
        where: { id: t.id },
        data: { sortOrder: t.sortOrder },
      })
    )
  )

  revalidatePath("/planner")
}

export async function deleteTask(id: string) {
  await verifySession()
  await prisma.task.delete({ where: { id } })
  revalidatePath("/planner")
}
