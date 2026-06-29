import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/features/search/components/search-input"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { BookOpen, FolderOpen, FileText, Search, ListChecks } from "lucide-react"
import Link from "next/link"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { userId } = await verifySession()
  const { q } = await searchParams

  if (!q?.trim()) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--fg)]">Search</h1>
              <p className="text-sm text-[var(--muted)]">Search across your subjects, categories, topics, and tasks</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <Search className="h-5 w-5 text-[var(--primary)]" />
            </div>
          </div>
          <SearchInput initialQuery={q ?? ""} />
          <EmptyState
            icon={Search}
            title="Search your study materials"
            description="Enter a query to search across subjects, categories, topics, and tasks"
          />
        </div>
      </PageTransition>
    )
  }

  const query = q.trim()

  const [subjects, categories, topics, tasks] = await Promise.all([
    prisma.subject.findMany({
      where: { userId, name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, color: true, icon: true, _count: { select: { categories: true } } },
    }),
    prisma.category.findMany({
      where: { subject: { userId }, name: { contains: query, mode: "insensitive" } },
      include: { subject: { select: { id: true, name: true, color: true } } },
    }),
    prisma.topic.findMany({
      where: {
        category: { subject: { userId } },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: {
          select: { id: true, name: true, subject: { select: { id: true, name: true, color: true } } },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
      take: 20,
    }),
  ])

  const totalResults = subjects.length + categories.length + topics.length + tasks.length

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Search</h1>
          <p className="text-sm text-[var(--muted)]">{totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>
        </div>
        <SearchInput initialQuery={query} />

        {totalResults === 0 ? (
          <EmptyState icon={Search} title="No results found" description="Try a different search term" />
        ) : (
          <div className="space-y-8">
            {subjects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Subjects</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/subjects/${subject.id}`}>
                      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--fg)] truncate">{subject.name}</p>
                              <p className="text-xs text-[var(--muted)]">{subject._count.categories} categories</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Categories</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/subjects/${category.subject.id}/categories/${category.id}`}>
                      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5" style={{ color: category.subject.color }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--fg)] truncate">{category.name}</p>
                              <p className="text-xs text-[var(--muted)]">in {category.subject.name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {topics.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Topics</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map((topic) => (
                    <Link key={topic.id}                     href={`/subjects/${topic.category.subject.id}/categories/${topic.category.id}/topics/${topic.id}`}>
                      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" style={{ color: topic.category.subject.color }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--fg)] truncate">{topic.name}</p>
                              <p className="text-xs text-[var(--muted)]">{topic.category.name} &middot; {topic.category.subject.name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Tasks</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tasks.map((task) => (
                    <Link key={task.id} href="/planner">
                      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <ListChecks className="h-5 w-5" style={{ color: task.subject?.color ?? "var(--muted)" }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--fg)] truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {task.subject && <p className="text-xs text-[var(--muted)]">{task.subject.name}</p>}
                                <Badge variant="secondary" className="text-[10px] px-1.5">{task.status.replace("_", " ")}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
