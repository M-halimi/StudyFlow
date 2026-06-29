import { notFound } from "next/navigation"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Layers, BookOpen } from "lucide-react"
import { SubjectForm } from "@/features/subjects/components/subject-form"
import { CategoryForm } from "@/features/categories/components/category-form"
import { DeleteSubjectButton } from "@/features/subjects/components/delete-subject-button"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

export default async function SubjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const { userId } = await verifySession()

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          _count: { select: { topics: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!subject || subject.userId !== userId) {
    notFound()
  }

  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[subject.icon] ?? Icons.BookOpen
  const totalTopics = subject.categories.reduce((acc, c) => acc + c._count.topics, 0)

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/subjects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--fg)] truncate">{subject.name}</h1>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Layers className="h-3 w-3" /> {subject.categories.length} categories
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <BookOpen className="h-3 w-3" /> {totalTopics} topics
                </Badge>
              </div>
              {subject.description && (
                <p className="text-sm text-[var(--muted)] mt-0.5">{subject.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <SubjectForm
              mode="edit"
              defaultValues={{
                id: subject.id,
                name: subject.name,
                color: subject.color,
                icon: subject.icon,
                description: subject.description ?? "",
              }}
            >
              <Button variant="outline" size="sm">Edit</Button>
            </SubjectForm>
            <DeleteSubjectButton id={subject.id} />
            <CategoryForm subjectId={subject.id}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Category
              </Button>
            </CategoryForm>
          </div>
        </div>

        {subject.categories.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No categories yet"
            description="Add categories to organize your topics"
            action={
              <CategoryForm subjectId={subject.id}>
                <Button size="sm">Add Category</Button>
              </CategoryForm>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subject.categories.map((category) => (
              <Link key={category.id} href={`/subjects/${subject.id}/categories/${category.id}`}>
                <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${subject.color}10` }}>
                        <Layers className="h-5 w-5" style={{ color: subject.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-[var(--fg)]">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{category.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0">
                          {category._count.topics} topics
                        </Badge>
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
