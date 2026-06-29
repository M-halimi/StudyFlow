"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const resourceSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  url: z.string().nullish().transform(v => v ?? undefined),
  type: z.string().default("WEBSITE"),
  description: z.string().nullish().transform(v => v ?? undefined),
})

export async function createResource(topicId: string, formData: FormData) {
  try {
    await verifySession()

    const validated = resourceSchema.safeParse({
      title: formData.get("title"),
      url: formData.get("url"),
      type: formData.get("type"),
      description: formData.get("description"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { category: { select: { subjectId: true } } },
    })
    if (!topic) return { error: "Topic not found" }

    await prisma.resource.create({
      data: {
        topicId,
        title: validated.data.title,
        url: validated.data.url,
        type: validated.data.type as any,
        description: validated.data.description,
      },
    })

    revalidatePath(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}/topics/${topicId}`)
  } catch (err) {
    console.error("createResource error:", err)
    return { error: err instanceof Error ? err.message : "Failed to create resource" }
  }
}

export async function deleteResource(id: string) {
  await verifySession()

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { topic: { include: { category: { select: { subjectId: true } } } } },
  })
  if (!resource) return { error: "Not found" }

  await prisma.resource.delete({ where: { id } })

  revalidatePath(`/subjects/${resource.topic.category.subjectId}/categories/${resource.topic.categoryId}/topics/${resource.topicId}`)
}
