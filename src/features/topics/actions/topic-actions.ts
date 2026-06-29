"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const topicSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  description: z.string().nullish().transform(v => v ?? undefined),
  difficulty: z.string().nullish().default("BEGINNER"),
  status: z.string().nullish().default("NOT_STARTED"),
  estimatedMinutes: z.coerce.number().nullish().transform(v => v ?? undefined),
  tags: z.string().nullish().transform(v => v ?? undefined),
})

export async function createTopic(categoryId: string, formData: FormData) {
  try {
    await verifySession()

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { subjectId: true },
    })
    if (!category) return { error: "Category not found" }

    const validated = topicSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      difficulty: formData.get("difficulty"),
      status: formData.get("status"),
      estimatedMinutes: formData.get("estimatedMinutes"),
      tags: formData.get("tags"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const tags = validated.data.tags
      ? validated.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : []

    await prisma.topic.create({
      data: {
        categoryId,
        name: validated.data.name,
        description: validated.data.description,
        difficulty: validated.data.difficulty as any,
        status: validated.data.status as any,
        estimatedMinutes: validated.data.estimatedMinutes,
        tags,
      },
    })

    revalidatePath(`/subjects/${category.subjectId}`)
    revalidatePath(`/subjects/${category.subjectId}/categories/${categoryId}`)
  } catch (err) {
    console.error("createTopic error:", err)
    return { error: err instanceof Error ? err.message : "Failed to create topic" }
  }
}

export async function updateTopic(id: string, formData: FormData) {
  try {
    await verifySession()

    const validated = topicSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      difficulty: formData.get("difficulty"),
      status: formData.get("status"),
      estimatedMinutes: formData.get("estimatedMinutes"),
      tags: formData.get("tags"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const tags = validated.data.tags
      ? validated.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : []

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!topic) return { error: "Not found" }

    await prisma.topic.update({
      where: { id },
      data: {
        name: validated.data.name,
        description: validated.data.description,
        difficulty: validated.data.difficulty as any,
        status: validated.data.status as any,
        estimatedMinutes: validated.data.estimatedMinutes,
        tags,
      },
    })

    revalidatePath(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}`)
    revalidatePath(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}/topics/${id}`)
  } catch (err) {
    console.error("updateTopic error:", err)
    return { error: err instanceof Error ? err.message : "Failed to update topic" }
  }
}

export async function deleteTopic(id: string) {
  await verifySession()

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!topic) return { error: "Not found" }

  await prisma.topic.delete({ where: { id } })

  revalidatePath(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}`)
  redirect(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}`)
}
