"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const subjectSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  color: z.string().default("#6366f1"),
  icon: z.string().default("BookOpen"),
  description: z.string().nullish().transform(v => v ?? undefined),
})

export async function createSubject(formData: FormData) {
  try {
    const { userId } = await verifySession()

    const validated = subjectSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color"),
      icon: formData.get("icon"),
      description: formData.get("description"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    await prisma.subject.create({
      data: { ...validated.data, userId },
    })

    revalidatePath("/subjects")
  } catch (err) {
    console.error("createSubject error:", err)
    return { error: err instanceof Error ? err.message : "Failed to create subject" }
  }
}

export async function updateSubject(id: string, formData: FormData) {
  try {
    const { userId } = await verifySession()

    const validated = subjectSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color"),
      icon: formData.get("icon"),
      description: formData.get("description"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const subject = await prisma.subject.findUnique({ where: { id } })
    if (!subject || subject.userId !== userId) {
      return { error: "Not found" }
    }

    await prisma.subject.update({
      where: { id },
      data: validated.data,
    })

    revalidatePath("/subjects")
    revalidatePath(`/subjects/${id}`)
  } catch (err) {
    console.error("updateSubject error:", err)
    return { error: err instanceof Error ? err.message : "Failed to update subject" }
  }
}

export async function deleteSubject(id: string) {
  const { userId } = await verifySession()

  const subject = await prisma.subject.findUnique({ where: { id } })
  if (!subject || subject.userId !== userId) {
    return { error: "Not found" }
  }

  await prisma.subject.delete({ where: { id } })

  revalidatePath("/subjects")
  redirect("/subjects")
}
