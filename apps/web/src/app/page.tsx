"use client"

import { useState } from "react"
import { ActivityTracker, ActivityList } from "@/components/activity-tracker"
import { useAddActivity } from "@/hooks/use-activities"

export default function Home() {
	const addActivityMutation = useAddActivity()

	const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

	const addActivity = (name: string, timestamp: Date) => {
		addActivityMutation.mutate({ name, timestamp })
	}

	const handleActivityClick = (activityName: string) => {
		setSelectedActivity(selectedActivity === activityName ? null : activityName)
	}

	return (
		<div className={`min-h-screen bg-background transition-colors duration-200 dark:dark`}>
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">Activity Tracker</h1>
						<p className="text-muted-foreground">Track your daily activities with a GitHub-style contribution graph</p>
					</div>
					<div className="flex items-center gap-4">
						{/* Activity Legend */}
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Less</span>
							<div className="flex gap-1">
								{[0, 1, 2, 3, 4].map((level) => (
									<div
										key={level}
										className="size-3 rounded-sm border border-border"
										style={{
											backgroundColor: `var(--activity-level-${level})`,
										}}
									/>
								))}
							</div>
							<span className="text-sm text-muted-foreground">More</span>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<ActivityTracker
						selectedActivity={selectedActivity}
						onAddActivity={addActivity}
						isAddingActivity={addActivityMutation.isPending}
					/>

					<ActivityList
						selectedActivity={selectedActivity}
						onActivityClick={handleActivityClick}
					/>
				</div>
			</div>
		</div>
	)
}
