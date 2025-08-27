"use client"

import type React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DateTimePicker24h } from "@/components/ui/date-time-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Fragment, useEffect, useRef, useState } from "react"
import { useActivities } from "@/hooks/use-activities"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

interface ActivityTrackerProps {
    selectedActivity?: string | null
    onAddActivity: (name: string, timestamp: Date) => void
    isAddingActivity?: boolean
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function ActivityTracker({
    selectedActivity = null,
    onAddActivity,
    isAddingActivity = false,
}: ActivityTrackerProps) {
    const { data } = authClient.useSession();
    const { data: activities } = useActivities();



    const nameRef = useRef<HTMLInputElement>(null);
    const [timestamp, setTimestamp] = useState<Date>(new Date());

    useEffect(() => {
        if (nameRef.current) {
            if (selectedActivity) nameRef.current.value = selectedActivity
            else nameRef.current.value = ""
        }
    }, [selectedActivity])

    const filteredActivities = selectedActivity
        ? activities?.filter((activity) => activity.name === selectedActivity) ?? []
        : activities ?? []

    const getActivityCount = (day: number, hour: number) => {
        return filteredActivities.filter((activity) => new Date(activity.timestamp).getDay() === day && new Date(activity.timestamp).getHours() === hour).length
    }

    const getActivityLevel = (count: number) => {
        if (count === 0) return 0
        if (count === 1) return 1
        if (count === 2) return 2
        if (count <= 4) return 3
        return 4
    }

    const getActivitiesForSlot = (day: number, hour: number) => {
        return filteredActivities.filter((activity) => new Date(activity.timestamp).getDay() === day && new Date(activity.timestamp).getHours() === hour)
    }

    const formatHour = (hour: number) => {
        return `${hour.toString().padStart(2, "0")}:00`
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const activityName = nameRef.current?.value.trim();
        if (activityName && timestamp && !isAddingActivity) {
            onAddActivity(activityName, timestamp)
        }
    }

    const handleUseCurrentDateTime = () => {
        setTimestamp(new Date())
    }

    return (
        <TooltipProvider>
            <div className="bg-card border rounded-lg p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left side - Activity Grid */}
                    <div className="flex-1 space-y-6">
                        {selectedActivity && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Showing activities for:</span>
                                <span className="font-medium text-foreground">{selectedActivity}</span>
                            </div>
                        )}

                        <div className="w-full overflow-x-auto">
                            <div className="min-w-fit space-y-4">
                                <div className="relative">
                                    <div
                                        className="grid gap-1"
                                        style={{
                                            gridTemplateColumns: "48px 48px repeat(24, 20px)",
                                            gridTemplateRows: `48px repeat(${DAYS.length}, 20px)`,
                                        }}
                                    >
                                        <div style={{ gridColumn: 1, gridRow: 1 }} />
                                        <div style={{ gridColumn: 2, gridRow: 1 }} />
                                        {HOURS.map((hour) => (
                                            <div
                                                key={`hour-${hour}`}
                                                className="flex items-center justify-center text-xs text-muted-foreground"
                                                style={{
                                                    gridColumn: hour + 3,
                                                    gridRow: 1,
                                                    transform: "rotate(-90deg)",
                                                    transformOrigin: "center",
                                                }}
                                            >
                                                {formatHour(hour)}
                                            </div>
                                        ))}

                                        {DAYS.map((dayName, dayIndex) => (
                                            <Fragment key={`${dayName}`}>
                                                {/* Offset column */}
                                                <div key={`${dayName}-offset`} style={{ gridColumn: 1, gridRow: dayIndex + 2 }} />

                                                {/* Day label */}
                                                <div
                                                    key={`${dayName}-label`}
                                                    className="text-sm text-muted-foreground text-right font-medium flex items-center justify-end pr-2"
                                                    style={{ gridColumn: 2, gridRow: dayIndex + 2 }}
                                                >
                                                    {dayName}
                                                </div>

                                                {/* Activity squares for this day */}
                                                {HOURS.map((hour) => {
                                                    const count = getActivityCount(dayIndex, hour)
                                                    const level = getActivityLevel(count)
                                                    const slotActivities = getActivitiesForSlot(dayIndex, hour)

                                                    return (
                                                        <Tooltip key={`${dayIndex}-${hour}`}>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className="size-5 rounded-sm border border-border cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all"
                                                                    style={{
                                                                        backgroundColor: `var(--activity-level-${level})`,
                                                                        gridColumn: hour + 3,
                                                                        gridRow: dayIndex + 2,
                                                                    }}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">
                                                                        {dayName}, {formatHour(hour)}
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        {count === 0
                                                                            ? "No activities"
                                                                            : `${count} ${count === 1 ? "activity" : "activities"}`}
                                                                    </div>
                                                                    {slotActivities.length > 0 && (
                                                                        <div className="space-y-1 mt-2">
                                                                            {slotActivities.map((activity) => (
                                                                                <div key={activity.id} className="text-xs bg-muted px-2 py-1 rounded">
                                                                                    {activity.name}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                })}
                                            </Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Activity Form */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Add Activity</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="activity-name">Activity Name</Label>
                                    <Input
                                        id="activity-name"
                                        ref={nameRef}
                                        type="text"
                                        placeholder="Enter activity name"
                                        disabled={isAddingActivity}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date & Time (dd/mm/yyyy HH:mm)</Label>
                                    <DateTimePicker24h
                                        defaultValue={timestamp}
                                        onChange={setTimestamp}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {data?.user ?
                                        <Button type="submit" className="flex-1" disabled={isAddingActivity}>
                                            {isAddingActivity ? "Adding..." : "Add Activity"}
                                        </Button> :
                                        <Button type="button" asChild><Link href="/login">Log In</Link></Button>}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleUseCurrentDateTime}
                                        disabled={isAddingActivity}
                                        className="whitespace-nowrap bg-transparent"
                                    >
                                        Use Now
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

export function ActivityList({
    selectedActivity,
    onActivityClick,
}: {
    selectedActivity: string | null
    onActivityClick: (activityName: string) => void
}) {
    const { data: activities } = useActivities()

    const getUniqueActivities = () => {
        const activityCounts = activities?.reduce(
            (acc, activity) => {
                acc[activity.name] = (acc[activity.name] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        ) ?? []

        return Object.entries(activityCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }))
    }

    return (
        <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Activities</h3>
            <div className="space-y-2">
                {getUniqueActivities().map(({ name, count }) => (
                    <div
                        key={name}
                        onClick={() => onActivityClick(name)}
                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${selectedActivity === name ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                            }`}
                    >
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
