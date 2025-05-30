"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, BookOpen, Calendar, CheckCircle, Upload, Zap, Crown, Medal, Flame } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "academic" | "productivity" | "consistency" | "milestone"
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

const achievementIcons = {
  trophy: Trophy,
  star: Star,
  target: Target,
  book: BookOpen,
  calendar: Calendar,
  check: CheckCircle,
  upload: Upload,
  zap: Zap,
  crown: Crown,
  medal: Medal,
  flame: Flame,
}

const rarityColors = {
  common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  epic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
}

const categoryColors = {
  academic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  productivity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  consistency: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  milestone: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Steps",
      description: "Upload your first schedule",
      icon: "upload",
      category: "milestone",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: "2024-01-15",
      rarity: "common",
    },
    {
      id: "2",
      title: "Class Collector",
      description: "Add 5 classes to your schedule",
      icon: "book",
      category: "academic",
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      rarity: "rare",
    },
    {
      id: "3",
      title: "Assignment Ace",
      description: "Complete 10 assignments on time",
      icon: "check",
      category: "productivity",
      progress: 7,
      maxProgress: 10,
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "4",
      title: "Streak Master",
      description: "Maintain a 7-day study streak",
      icon: "flame",
      category: "consistency",
      progress: 4,
      maxProgress: 7,
      unlocked: false,
      rarity: "epic",
    },
    {
      id: "5",
      title: "Perfect Semester",
      description: "Complete a full semester with 100% assignment completion",
      icon: "crown",
      category: "academic",
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      rarity: "legendary",
    },
    {
      id: "6",
      title: "Early Bird",
      description: "Submit 5 assignments early",
      icon: "zap",
      category: "productivity",
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      rarity: "rare",
    },
  ])

  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    currentStreak: 4,
  })

  useEffect(() => {
    const unlocked = achievements.filter((a) => a.unlocked).length
    const total = achievements.length
    const points = achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => {
        const rarityPoints = { common: 10, rare: 25, epic: 50, legendary: 100 }
        return sum + rarityPoints[a.rarity]
      }, 0)

    setStats({
      totalAchievements: total,
      unlockedAchievements: unlocked,
      totalPoints: points,
      currentStreak: 4,
    })
  }, [achievements])

  const getProgressPercentage = (progress: number, maxProgress: number) => {
    return Math.min((progress / maxProgress) * 100, 100)
  }

  const getRarityPoints = (rarity: Achievement["rarity"]) => {
    const points = { common: 10, rare: 25, epic: 50, legendary: 100 }
    return points[rarity]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your progress and unlock rewards for your academic success
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.unlockedAchievements}/{stats.totalAchievements}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPoints}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Complete tasks and reach milestones to unlock achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons]
              const progressPercentage = getProgressPercentage(achievement.progress, achievement.maxProgress)

              return (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden ${
                    achievement.unlocked
                      ? "ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950"
                      : "opacity-75"
                  }`}
                >
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <div className="p-1 bg-yellow-400 rounded-full">
                        <CheckCircle className="h-4 w-4 text-yellow-900" />
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          achievement.unlocked ? "bg-yellow-100 dark:bg-yellow-900" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            achievement.unlocked
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={categoryColors[achievement.category]}>
                            {achievement.category}
                          </Badge>
                          <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                            {achievement.rarity} • {getRarityPoints(achievement.rarity)} pts
                          </Badge>
                        </div>

                        {!achievement.unlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="text-gray-900 dark:text-white">
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}

                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
