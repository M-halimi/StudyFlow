"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

const templateSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  description: z.string().nullish().transform(v => v ?? undefined),
})

export async function createTemplate(formData: FormData) {
  const { userId } = await verifySession()

  const validated = templateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.template.create({
    data: { ...validated.data, userId },
  })

  revalidatePath("/templates")
}

export async function deleteTemplate(id: string) {
  const { userId } = await verifySession()

  const template = await prisma.template.findUnique({ where: { id } })
  if (!template || template.userId !== userId) {
    return { error: "Not found" }
  }

  await prisma.template.delete({ where: { id } })

  revalidatePath("/templates")
}
