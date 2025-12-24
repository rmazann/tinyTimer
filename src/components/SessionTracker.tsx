import React, { useMemo } from 'react'

interface SessionTrackerProps {
  sessionCount: number
  isRunning: boolean
  hasStarted: boolean
  isCompleted: boolean
}

export const SessionTracker: React.FC<SessionTrackerProps> = ({ sessionCount, isRunning, hasStarted, isCompleted }) => {
  // Determine status color based on timer state
  const statusColor = useMemo(() => {
    if (isCompleted) return '#1fc36b' // completed - green
    if (isRunning) return '#47c2ff' // in-progress - blue
    if (hasStarted) return '#ff8447' // paused - orange
    return '#47c2ff' // default to in-progress color
  }, [isCompleted, isRunning, hasStarted])

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-[#1a1f2e] border border-gray-300/50 dark:border-[#2a2f3e]">
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }}></div>
      <span className="text-xs font-normal text-gray-600 dark:text-[#e5e7eb]">Session {sessionCount}</span>
    </div>
  )
}

