import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTemplateForm } from "@/features/templates/components/create-template-form"
import { DeleteTemplateButton } from "@/features/templates/components/delete-template-button"
import { PageTransition } from "@/components/shared/page-transition"
import { EmptyState } from "@/components/shared/empty-state"
import { BookMarked } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function TemplatesPage() {
  const { userId } = await verifySession()

  const templates = await prisma.template.findMany({
    where: { userId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Templates</h1>
            <p className="text-sm text-[var(--muted)]">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
          </div>
          <CreateTemplateForm />
        </div>

        {templates.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No templates yet"
            description="Create a template to quickly set up study sessions"
            action={<CreateTemplateForm />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                      <BookMarked className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      {template.description && (
                        <p className="text-xs text-[var(--muted)] mt-0.5">{template.description}</p>
                      )}
                    </div>
                  </div>
                  <DeleteTemplateButton id={template.id} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Badge variant="secondary" className="text-[10px]">{template._count.tasks} tasks</Badge>
                    <span>Created {formatDate(template.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
