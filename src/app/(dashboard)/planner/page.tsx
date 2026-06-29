import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"

import { PlannerClient } from "@/features/planner/components/planner-client"

export default async function PlannerPage() {
  const { userId } = await verifySession()

  const [tasks, subjects] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      include: {
        subject: { select: { name: true, color: true } },
        topic: { select: { name: true } },
      },
    }),
    prisma.subject.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ])

  return <PlannerClient tasks={tasks} subjects={subjects} />
}
