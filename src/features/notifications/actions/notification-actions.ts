"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

type NotificationType = "TASK_REMINDER" | "REVISION_ALERT" | "SESSION_UPDATE" | "SYSTEM"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message?: string,
  link?: string,
) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { notificationEnabled: true },
  })

  if (settings && !settings.notificationEnabled) return

  await prisma.notification.create({
    data: { userId, type, title, message, link },
  })
}

export async function markAsRead(id: string) {
  const { userId } = await verifySession()

  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  })

  revalidatePath("/", "layout")
}

export async function markAllAsRead() {
  const { userId } = await verifySession()

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })

  revalidatePath("/", "layout")
}

export async function getUnreadCount() {
  const user = await verifySession().catch(() => null)
  if (!user) return 0

  return prisma.notification.count({
    where: { userId: user.userId, isRead: false },
  })
}

export async function getNotifications(limit = 5) {
  const { userId } = await verifySession()

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getNotificationSoundMode() {
  const { userId } = await verifySession()

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { soundMode: true },
  })

  return settings?.soundMode ?? "important"
}
