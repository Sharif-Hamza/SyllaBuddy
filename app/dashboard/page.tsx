"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Upload, BookOpen, Clock, CheckCircle, TrendingUp, Award, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"

interface DashboardStats {
  totalClasses: number
  upcomingAssignments: number
  completedAssignments: number
  schedulesUploaded: number
}

interface RecentActivity {
  id: string
  type: "upload" | "assignment" | "class"
  title: string
  description: string
  timestamp: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    upcomingAssignments: 0,
    completedAssignments: 0,
    schedulesUploaded: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    const supabase = getSupabaseClient()

    try {
      // Fetch classes count
      const { count: classesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      // Fetch assignments
      const { data: assignments } = await supabase.from("assignments").select("completed").eq("user_id", user?.id)

      // Fetch schedules count
      const { count: schedulesCount } = await supabase
        .from("schedules")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)

      const upcomingAssignments = assignments?.filter((a) => !a.completed).length || 0
      const completedAssignments = assignments?.filter((a) => a.completed).length || 0

      setStats({
        totalClasses: classesCount || 0,
        upcomingAssignments,
        completedAssignments,
        schedulesUploaded: schedulesCount || 0,
      })

      // Mock recent activity for now
      setRecentActivity([
        {
          id: "1",
          type: "upload",
          title: "Schedule Uploaded",
          description: "Fall 2024 schedule processed successfully",
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          type: "assignment",
          title: "Assignment Due Soon",
          description: "Math 101 - Problem Set 3 due tomorrow",
          timestamp: "1 day ago",
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate =
    stats.completedAssignments + stats.upcomingAssignments > 0
      ? (stats.completedAssignments / (stats.completedAssignments + stats.upcomingAssignments)) * 100
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || "Student"}! 👋</h1>
        <p className="text-blue-100">
          Ready to organize your academic life? Let's make this semester your best one yet.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClasses}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingAssignments}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedAssignments}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Schedules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.schedulesUploaded}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Overview
            </CardTitle>
            <CardDescription>Your academic progress this semester</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Assignment Completion</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completedAssignments}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.upcomingAssignments}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/upload">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Schedule
              </Button>
            </Link>
            <Link href="/calendar">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </Link>
            <Link href="/classes">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Classes
              </Button>
            </Link>
            <Link href="/achievements">
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    {activity.type === "upload" && <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    {activity.type === "assignment" && (
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                    {activity.type === "class" && <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity yet</p>
              <p className="text-sm">Start by uploading your schedule!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
