import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/shared/page-transition"
import {
  Play, Flame, Trophy, Clock, ListChecks, BookOpen, Target,
  RefreshCw, Award, Layers, Lock,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const ACHIEVEMENTS = [
  { type: "FIRST_SESSION", name: "First Session", description: "Complete your first study session", icon: Play },
  { type: "SEVEN_DAY_STREAK", name: "7 Day Streak", description: "Study 7 days in a row", icon: Flame },
  { type: "THIRTY_DAY_STREAK", name: "30 Day Streak", description: "Study 30 days in a row", icon: Trophy },
  { type: "HUNDRED_HOURS", name: "100 Hours", description: "Study 100 hours total", icon: Clock },
  { type: "HUNDRED_TASKS", name: "100 Tasks", description: "Complete 100 tasks", icon: ListChecks },
  { type: "FIRST_SUBJECT", name: "First Subject", description: "Create your first subject", icon: BookOpen },
  { type: "FIRST_GOAL", name: "First Goal", description: "Create your first goal", icon: Target },
  { type: "FIRST_REVISION", name: "First Revision", description: "Complete your first revision", icon: RefreshCw },
  { type: "MASTER_TOPIC", name: "Mastered Topic", description: "Master your first topic", icon: Award },
  { type: "FIFTY_SESSIONS", name: "50 Sessions", description: "Complete 50 study sessions", icon: Layers },
] as const

export default async function AchievementsPage() {
  const { userId } = await verifySession()

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  })

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievement, ua.unlockedAt]))

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">Achievements</h1>
            <p className="text-sm text-[var(--muted)]">{userAchievements.length} / {ACHIEVEMENTS.length} unlocked</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <Trophy className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedMap.has(achievement.type)
            const unlockedAt = unlockedMap.get(achievement.type)
            const Icon = achievement.icon

            return (
              <Card key={achievement.type} className={!unlocked ? "opacity-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: unlocked ? "var(--success-bg)" : "var(--secondary)" }}>
                      {unlocked ? (
                        <Icon className="h-5 w-5 text-[var(--success)]" />
                      ) : (
                        <Lock className="h-5 w-5 text-[var(--muted)]" />
                      )}
                    </div>
                    {unlocked && <Badge variant="success" className="text-[10px]">Unlocked</Badge>}
                  </div>
                  <CardTitle className="mt-3 text-sm">{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                {unlockedAt && (
                  <CardContent>
                    <p className="text-xs text-[var(--muted)]">Unlocked on {formatDate(unlockedAt)}</p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
