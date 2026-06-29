"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { formatDistanceToNow } from "date-fns"
import { createNotification } from "@/features/notifications/actions/notification-actions"
import type { SessionType } from "@/generated/prisma/enums"

const VALID_SESSION_TYPES = new Set<string>(["STUDY", "WORK", "BREAK", "COFFEE"])

function validateSessionType(value?: string): SessionType {
  if (value && VALID_SESSION_TYPES.has(value)) {
    return value as SessionType
  }
  return "STUDY" as SessionType
}

export async function startSession(topicId?: string, sessionType?: string, plannedDuration?: number) {
  const { userId } = await verifySession()
  const duration = plannedDuration || 30

  const topicName = topicId
    ? await prisma.topic.findUnique({ where: { id: topicId }, select: { name: true } })
    : null
  const title = topicName ? `${topicName.name} Session` : ""

  const session = await prisma.studySession.create({
    data: {
      userId,
      topicId: topicId || null,
      sessionType: validateSessionType(sessionType),
      title,
      plannedDuration: duration,
      remainingTime: duration * 60,
      startTime: new Date(),
      status: "ACTIVE",
    },
  })

  revalidatePath("/timer")
  revalidatePath("/dashboard")
  return { id: session.id, sessionType: session.sessionType }
}

export async function endSession(id: string, remainingTime: number, notes?: string) {
  await verifySession()

  const session = await prisma.studySession.findUnique({
    where: { id },
    select: { plannedDuration: true, userId: true, sessionType: true, topicId: true },
  })
  if (!session) return

  const elapsedMinutes = Math.max(1, session.plannedDuration - Math.round(remainingTime / 60))

  await prisma.studySession.update({
    where: { id },
    data: {
      status: "COMPLETED",
      endTime: new Date(),
      remainingTime,
      totalMinutes: elapsedMinutes,
      notes: notes || null,
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

    createNotification(
      session.userId,
      "REVISION_ALERT",
      `Revision scheduled for tomorrow`,
      `Next revision for your topic is due ${formatDistanceToNow(nextDate, { addSuffix: true })}`,
      `/subjects`,
    )
  }

  const hours = Math.floor(elapsedMinutes / 60)
  const mins = Math.round(elapsedMinutes % 60)
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  const typeLabel = session.sessionType === "WORK" ? "Work" :
    session.sessionType === "BREAK" ? "Break" :
    session.sessionType === "COFFEE" ? "Coffee break" : "Study"

  createNotification(
    session.userId,
    "SESSION_UPDATE",
    `${typeLabel} session completed!`,
    `You studied for ${durationStr}`,
    "/timer",
  )

  revalidatePath("/timer")
  revalidatePath("/dashboard")
}

export async function pauseSession(id: string, remainingTime: number) {
  await verifySession()

  await prisma.studySession.update({
    where: { id },
    data: { status: "PAUSED", remainingTime },
  })

  revalidatePath("/timer")
}

export async function autoSaveSession(id: string, remainingTime: number) {
  await verifySession().catch(() => null)

  await prisma.studySession.update({
    where: { id },
    data: { remainingTime },
  })
}

export async function resumeSession(id: string) {
  await verifySession()

  await prisma.studySession.update({
    where: { id },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/timer")
}

export async function duplicateSession(id: string) {
  const { userId } = await verifySession()

  const original = await prisma.studySession.findUnique({
    where: { id },
    select: { topicId: true, sessionType: true, title: true, totalMinutes: true, plannedDuration: true, remainingTime: true },
  })

  if (!original || !original.totalMinutes) return

  const topicName = original.topicId
    ? await prisma.topic.findUnique({ where: { id: original.topicId }, select: { name: true } })
    : null
  const baseTitle = topicName ? `${topicName.name} Session` : "Untitled"

  await prisma.studySession.create({
    data: {
      userId,
      topicId: original.topicId,
      sessionType: original.sessionType,
      title: `${baseTitle} (copy)`,
      plannedDuration: original.plannedDuration,
      remainingTime: original.remainingTime,
      startTime: new Date(),
      status: "ACTIVE",
    },
  })

  revalidatePath("/timer")
}

export async function getActiveSession() {
  const user = await verifySession().catch(() => null)
  if (!user) return null

  return prisma.studySession.findFirst({
    where: {
      userId: user.userId,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    select: {
      id: true,
      sessionType: true,
      topicId: true,
      plannedDuration: true,
      remainingTime: true,
      totalMinutes: true,
      status: true,
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
