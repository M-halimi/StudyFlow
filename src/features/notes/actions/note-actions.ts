"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const noteSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  content: z.string().min(1, { error: "Content is required" }),
})

export async function createNote(topicId: string, formData: FormData) {
  try {
    await verifySession()

    const validated = noteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { category: { select: { subjectId: true } } },
    })
    if (!topic) return { error: "Topic not found" }

    await prisma.note.create({
      data: {
        topicId,
        title: validated.data.title,
        content: validated.data.content,
      },
    })

    revalidatePath(`/subjects/${topic.category.subjectId}/categories/${topic.categoryId}/topics/${topicId}`)
  } catch (err) {
    console.error("createNote error:", err)
    return { error: err instanceof Error ? err.message : "Failed to create note" }
  }
}

export async function updateNote(id: string, formData: FormData) {
  try {
    await verifySession()

    const validated = noteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const note = await prisma.note.findUnique({
      where: { id },
      include: { topic: { include: { category: { select: { subjectId: true } } } } },
    })
    if (!note) return { error: "Note not found" }

    await prisma.note.update({
      where: { id },
      data: {
        title: validated.data.title,
        content: validated.data.content,
      },
    })

    revalidatePath(`/subjects/${note.topic.category.subjectId}/categories/${note.topic.categoryId}/topics/${note.topicId}`)
  } catch (err) {
    console.error("updateNote error:", err)
    return { error: err instanceof Error ? err.message : "Failed to update note" }
  }
}

export async function deleteNote(id: string) {
  try {
    await verifySession()

    const note = await prisma.note.findUnique({
      where: { id },
      include: { topic: { include: { category: { select: { subjectId: true } } } } },
    })
    if (!note) return { error: "Note not found" }

    await prisma.note.delete({ where: { id } })

    revalidatePath(`/subjects/${note.topic.category.subjectId}/categories/${note.topic.categoryId}/topics/${note.topicId}`)
  } catch (err) {
    console.error("deleteNote error:", err)
    return { error: err instanceof Error ? err.message : "Failed to delete note" }
  }
}
