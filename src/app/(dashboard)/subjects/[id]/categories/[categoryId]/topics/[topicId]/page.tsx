import { notFound } from "next/navigation"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { ArrowLeft, Clock, Video, Link2, FileText, CheckCircle2, Circle, BrainCircuit, Plus } from "lucide-react"
import { TopicForm } from "@/features/topics/components/topic-form"
import { DeleteTopicButton } from "@/features/topics/components/delete-topic-button"
import { ResourceForm } from "@/features/resources/components/resource-form"
import { DeleteResourceButton } from "@/features/resources/components/delete-resource-button"
import { formatDate, formatDuration } from "@/lib/utils"

export default async function TopicDetailPage(props: {
  params: Promise<{ id: string; categoryId: string; topicId: string }>
}) {
  const { id: subjectId, categoryId, topicId } = await props.params
  const { userId } = await verifySession()

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject || subject.userId !== userId) notFound()

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      category: true,
      resources: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { updatedAt: "desc" }, take: 1 },
      revisions: { orderBy: { date: "desc" }, take: 5 },
    },
  })

  if (!topic || topic.categoryId !== categoryId) notFound()

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href={`/subjects/${subjectId}/categories/${categoryId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)] flex-wrap">
                <Link href={`/subjects/${subjectId}`} className="hover:text-[var(--fg)] transition-colors truncate">{subject.name}</Link>
                <span className="text-[var(--border)] shrink-0">/</span>
                <Link href={`/subjects/${subjectId}/categories/${categoryId}`} className="hover:text-[var(--fg)] transition-colors truncate">{topic.category.name}</Link>
                <span className="text-[var(--border)] shrink-0">/</span>
                <span className="text-[var(--fg)] truncate">{topic.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--fg)] truncate">{topic.name}</h1>
                <Badge variant={topic.status === "MASTERED" ? "success" : topic.status === "LEARNING" ? "info" : "secondary"}>
                  {topic.status.replace("_", " ")}
                </Badge>
              </div>
              {topic.description && <p className="text-sm text-[var(--muted)] mt-0.5">{topic.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <TopicForm
              categoryId={categoryId}
              mode="edit"
              defaultValues={{
                id: topic.id,
                name: topic.name,
                description: topic.description ?? "",
                difficulty: topic.difficulty,
                status: topic.status,
                estimatedMinutes: topic.estimatedMinutes ?? 0,
                tags: topic.tags,
              }}
            >
              <Button variant="outline" size="sm">Edit</Button>
            </TopicForm>
            <DeleteTopicButton id={topic.id} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-[var(--primary)]" />
                    <CardTitle>Resources</CardTitle>
                  </div>
                  <ResourceForm topicId={topic.id}>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </ResourceForm>
                </div>
              </CardHeader>
              <CardContent>
                {topic.resources.length === 0 ? (
                  <EmptyState icon={Link2} title="No resources yet" description="Add resources to help you study"
                    action={<ResourceForm topicId={topic.id} />}
                  />
                ) : (
                  <div className="divide-y divide-[var(--border-light)]">
                    {topic.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: resource.type === "YOUTUBE" ? "rgb(239 68 68 / 0.1)" : "rgb(59 130 246 / 0.1)" }}>
                          {resource.type === "YOUTUBE"
                            ? <Video className="h-4 w-4 text-[var(--danger)]" />
                            : <Link2 className="h-4 w-4 text-[var(--info)]" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <a href={resource.url ?? "#"} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-[var(--fg)] hover:text-[var(--primary)] transition-colors truncate block">
                            {resource.title}
                          </a>
                          <span className="text-[10px] text-[var(--muted)]">{resource.type}</span>
                        </div>
                        {resource.completed && <Badge variant="success" className="text-[10px]">Done</Badge>}
                        <DeleteResourceButton id={resource.id} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--primary)]" />
                  <CardTitle>Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {topic.notes.length === 0 ? (
                  <EmptyState icon={FileText} title="No notes yet" description="Add notes while studying" />
                ) : (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                    <p className="text-sm text-[var(--fg)] whitespace-pre-wrap leading-relaxed">{topic.notes[0].content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">Difficulty</span>
                  <Badge>{topic.difficulty.replace("_", " ")}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">Status</span>
                  <Badge variant="secondary">{topic.status.replace("_", " ")}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">Est. time</span>
                  <span className="flex items-center gap-1 text-sm text-[var(--fg)]">
                    <Clock className="h-3 w-3 text-[var(--muted)]" />
                    {topic.estimatedMinutes ? formatDuration(topic.estimatedMinutes) : "—"}
                  </span>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-[var(--muted)] block mb-1.5">Tags</span>
                  <div className="flex gap-1 flex-wrap">
                    {topic.tags.length > 0
                      ? topic.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5">{tag}</Badge>
                        ))
                      : <span className="text-sm text-[var(--muted)]">—</span>}
                  </div>
                </div>
                {topic.lastRevision && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Last revision</span>
                      <span className="text-sm text-[var(--fg)]">{formatDate(topic.lastRevision)}</span>
                    </div>
                  </>
                )}
                {topic.nextRevision && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Next revision</span>
                      <span className="text-sm text-[var(--fg)]">{formatDate(topic.nextRevision)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revision History</CardTitle>
              </CardHeader>
              <CardContent>
                {topic.revisions.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No revisions yet</p>
                ) : (
                  <div className="divide-y divide-[var(--border-light)]">
                    {topic.revisions.map((revision) => (
                      <div key={revision.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                        <span className="text-sm text-[var(--fg)]">{formatDate(revision.date)}</span>
                        {revision.completed
                          ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                          : <Circle className="h-4 w-4 text-[var(--muted)]" />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[var(--primary)]/5 border-[var(--primary)]/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-semibold text-[var(--primary)]">AI Assistant</span>
                </div>
                <p className="text-xs text-[var(--muted)]">Ask questions, get explanations, and generate practice problems about this topic.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
