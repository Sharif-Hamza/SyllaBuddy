"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, BookOpen, FileText, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  event_type: "class" | "assignment" | "exam" | "custom"
  class_name?: string
  class_color?: string
}

const eventTypeColors = {
  class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  assignment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  custom: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

const eventTypeIcons = {
  class: BookOpen,
  assignment: FileText,
  exam: AlertCircle,
  custom: CalendarIcon,
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"month" | "week" | "day">("month")

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user, currentDate])

  const fetchEvents = async () => {
    const supabase = getSupabaseClient()

    try {
      // Get start and end of current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          classes(name, color)
        `)
        .eq("user_id", user?.id)
        .gte("start_time", startOfMonth.toISOString())
        .lte("start_time", endOfMonth.toISOString())
        .order("start_time", { ascending: true })

      if (error) throw error

      const formattedEvents =
        data?.map((event) => ({
          ...event,
          class_name: event.classes?.name,
          class_color: event.classes?.color,
        })) || []

      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDay = (day: number) => {
    if (!day) return []

    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === dayDate.toDateString()
    })
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View your classes, assignments, and important dates</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
                Month
              </Button>
              <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
                Week
              </Button>
              <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>
                Day
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth().map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : []
              const isToday =
                day &&
                new Date().toDateString() ===
                  new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                    day ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                  } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const Icon = eventTypeIcons[event.event_type]
                          return (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${eventTypeColors[event.event_type]}`}
                              title={`${event.title} - ${formatTime(event.start_time)}`}
                            >
                              <div className="flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your next assignments and important dates</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => {
                const Icon = eventTypeIcons[event.event_type]
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`p-2 rounded-full ${eventTypeColors[event.event_type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.start_time)}
                        </div>
                        {event.class_name && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {event.class_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{event.event_type}</Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm">Upload your schedule to see your classes and assignments here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
