"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  Plus,
  Calendar,
  Upload,
  Award,
  Star,
  Calculator,
  Beaker,
  Globe,
  Palette,
  Music,
  Monitor,
  Microscope,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"

interface Class {
  id: string
  name: string
  code: string
  instructor: string
  color: string
  icon: string
  schedule_days: string[]
  start_time: string
  end_time: string
  location: string
}

const classIcons = {
  book: BookOpen,
  calculator: Calculator,
  beaker: Beaker,
  globe: Globe,
  palette: Palette,
  music: Music,
  computer: Monitor,
  microscope: Microscope,
}

const classColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

export default function ClassesPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user])

  const fetchClasses = async () => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Classes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your class schedule and syllabi
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No classes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your schedule to automatically create your class list, or add classes manually.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Schedule
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Class Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${classItem.color}20` }}
                    >
                      {classIcons[classItem.icon] ? (\
                        <classIcons[classItem.icon] \
                          className="h-5 w-5" 
                          style={{ color: classItem.color }}
                        />
                      ) : (
                        <BookOpen 
                          className="h-5 w-5" 
                          style={{ color: classItem.color }}
                        />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {classItem.code}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Award className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span>{classItem.instructor}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    {classItem.schedule_days?.join(', ')} • {' '}
                    {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                  </span>
                </div>
                
                {classItem.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{classItem.location}</span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    View Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="h-4 w-4 mr-1" />
                    Add Syllabus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
