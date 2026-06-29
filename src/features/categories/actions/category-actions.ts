"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const categorySchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  description: z.string().nullish().transform(v => v ?? undefined),
})

export async function createCategory(subjectId: string, formData: FormData) {
  try {
    const { userId } = await verifySession()

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.userId !== userId) return { error: "Not found" }

    const validated = categorySchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    await prisma.category.create({
      data: { ...validated.data, subjectId },
    })

    revalidatePath(`/subjects/${subjectId}`)
  } catch (err) {
    console.error("createCategory error:", err)
    return { error: err instanceof Error ? err.message : "Failed to create category" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    await verifySession()

    const validated = categorySchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    })

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message ?? "Invalid input" }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { subject: true },
    })
    if (!category) return { error: "Not found" }

    await prisma.category.update({ where: { id }, data: validated.data })

    revalidatePath(`/subjects/${category.subjectId}`)
    revalidatePath(`/subjects/${category.subjectId}/categories/${id}`)
  } catch (err) {
    console.error("updateCategory error:", err)
    return { error: err instanceof Error ? err.message : "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  await verifySession()

  const category = await prisma.category.findUnique({
    where: { id },
    include: { subject: true },
  })
  if (!category) return { error: "Not found" }

  await prisma.category.delete({ where: { id } })

  revalidatePath(`/subjects/${category.subjectId}`)
  redirect(`/subjects/${category.subjectId}`)
}
