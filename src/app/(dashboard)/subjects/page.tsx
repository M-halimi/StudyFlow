import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { SubjectCard } from "@/features/subjects/components/subject-card"
import { SubjectForm } from "@/features/subjects/components/subject-form"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { BookOpen } from "lucide-react"

export default async function SubjectsPage() {
  const { userId } = await verifySession()

  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: {
      _count: { select: { categories: true } },
      categories: { include: { _count: { select: { topics: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalTopics = subjects.reduce(
    (acc, s) => acc + s.categories.reduce((a, c) => a + c._count.topics, 0),
    0
  )

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Subjects</h1>
            <p className="text-sm text-[var(--muted)]">{subjects.length} subjects &middot; {totalTopics} topics</p>
          </div>
          <SubjectForm mode="create" />
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Create your first subject to get started"
            action={<SubjectForm mode="create" />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                color={subject.color}
                icon={subject.icon}
                description={subject.description}
                categoryCount={subject._count.categories}
                topicCount={subject.categories.reduce(
                  (acc, c) => acc + c._count.topics, 0
                )}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
