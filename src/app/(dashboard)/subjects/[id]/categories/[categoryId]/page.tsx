import { notFound } from "next/navigation"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Sparkles } from "lucide-react"
import { TopicForm } from "@/features/topics/components/topic-form"
import { CategoryForm } from "@/features/categories/components/category-form"
import { DeleteCategoryButton } from "@/features/categories/components/delete-category-button"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDuration } from "@/lib/utils"

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-[var(--success-bg)] text-[var(--success)]",
  INTERMEDIATE: "bg-[var(--info-bg)] text-[var(--info)]",
  ADVANCED: "bg-[var(--warning-bg)] text-[var(--warning)]",
  EXPERT: "bg-[var(--danger-bg)] text-[var(--danger)]",
}

export default async function CategoryDetailPage(props: {
  params: Promise<{ id: string; categoryId: string }>
}) {
  const { id: subjectId, categoryId } = await props.params
  const { userId } = await verifySession()

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject || subject.userId !== userId) notFound()

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      topics: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!category || category.subjectId !== subjectId) notFound()

  const totalEstMinutes = category.topics.reduce(
    (acc, t) => acc + (t.estimatedMinutes ?? 0), 0
  )

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href={`/subjects/${subjectId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Link href={`/subjects/${subjectId}`} className="hover:text-[var(--fg)] transition-colors truncate">{subject.name}</Link>
                <span className="text-[var(--border)] shrink-0">/</span>
                <span className="text-[var(--fg)] truncate">{category.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--fg)] truncate">{category.name}</h1>
                <Badge variant="secondary" className="text-xs">{category.topics.length} topics</Badge>
                {totalEstMinutes > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" /> {formatDuration(totalEstMinutes)}
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-[var(--muted)] mt-0.5">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <CategoryForm
              subjectId={subjectId}
              mode="edit"
              defaultValues={{
                id: category.id,
                name: category.name,
                description: category.description ?? "",
              }}
            >
              <Button variant="outline" size="sm">Edit</Button>
            </CategoryForm>
            <DeleteCategoryButton id={category.id} />
            <TopicForm categoryId={categoryId}>
              <Button size="sm">New Topic</Button>
            </TopicForm>
          </div>
        </div>

        {category.topics.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No topics yet"
            description="Create topics to start studying"
            action={
              <TopicForm categoryId={categoryId}>
                <Button size="sm">Create Topic</Button>
              </TopicForm>
            }
          />
        ) : (
          <div className="space-y-2">
            {category.topics.map((topic) => (
              <Link key={topic.id} href={`/subjects/${subjectId}/categories/${categoryId}/topics/${topic.id}`}>
                <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-[var(--fg)]">{topic.name}</h3>
                          {topic.tags.length > 0 && topic.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5">{tag}</Badge>
                          ))}
                        </div>
                        {topic.description && (
                          <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{topic.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${difficultyColors[topic.difficulty] ?? ""}`}>
                          {topic.difficulty.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          {topic.status.replace("_", " ")}
                        </Badge>
                        {topic.estimatedMinutes && (
                          <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                            <Clock className="h-3 w-3" />
                            {formatDuration(topic.estimatedMinutes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
