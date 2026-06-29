"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

export async function startSession(topicId?: string) {
  const { userId } = await verifySession()

  const session = await prisma.studySession.create({
    data: {
      userId,
      topicId: topicId || null,
      startTime: new Date(),
      status: "ACTIVE",
    },
  })

  revalidatePath("/timer")
  revalidatePath("/dashboard")
  return { id: session.id }
}

export async function endSession(id: string, totalMinutes: number) {
  await verifySession()

  const session = await prisma.studySession.update({
    where: { id },
    data: {
      status: "COMPLETED",
      endTime: new Date(),
      totalMinutes,
    },
  })

  if (session.topicId) {
    const revisionCount = await prisma.revision.count({
      where: { topicId: session.topicId },
    })

    const intervals = [1, 3, 7, 14, 30]
    const nextIndex = Math.min(revisionCount, intervals.length - 1)
    const nextInterval = intervals[nextIndex]
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + nextInterval)

    await prisma.topic.update({
      where: { id: session.topicId },
      data: {
        status: "NEED_REVISION",
        lastRevision: new Date(),
        nextRevision: nextDate,
      },
    })

    await prisma.revision.create({
      data: {
        topicId: session.topicId,
        date: nextDate,
        interval: nextInterval,
      },
    })
  }

  revalidatePath("/timer")
  revalidatePath("/dashboard")
}

export async function getActiveSession() {
  const user = await verifySession().catch(() => null)
  if (!user) return null

  return prisma.studySession.findFirst({
    where: {
      userId: user.userId,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: {
      topic: {
        select: {
          name: true,
          category: { select: { subject: { select: { name: true } } } },
        },
      },
    },
    orderBy: { startTime: "desc" },
  })
}
