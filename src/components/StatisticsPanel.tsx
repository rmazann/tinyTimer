import React, { useMemo } from 'react'

interface CompletedSession {
  sessionNumber: number
  sessionData: {
    activeTime: number
    pauseTime: number
    extraTime: number
    totalTime: number
  }
}

interface StatisticsPanelProps {
  completedSessions: CompletedSession[]
  dailyGoal: number
  onDailyGoalChange: (hours: number) => void
  todayTotalTime: number
  onHide: () => void
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ completedSessions, dailyGoal, onDailyGoalChange, todayTotalTime, onHide }) => {
  const statistics = useMemo(() => {
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageTime: 0,
        totalActiveTime: 0,
        totalPauseTime: 0,
        totalExtraTime: 0,
      }
    }

    const totalTime = completedSessions.reduce((sum, session) => sum + session.sessionData.totalTime, 0)
    const totalActiveTime = completedSessions.reduce((sum, session) => sum + session.sessionData.activeTime, 0)
    const totalPauseTime = completedSessions.reduce((sum, session) => sum + session.sessionData.pauseTime, 0)
    const totalExtraTime = completedSessions.reduce((sum, session) => sum + session.sessionData.extraTime, 0)
    const averageTime = totalTime / completedSessions.length

    return {
      totalSessions: completedSessions.length,
      totalTime,
      averageTime,
      totalActiveTime,
      totalPauseTime,
      totalExtraTime,
    }
  }, [completedSessions])

  const formatTime = (seconds: number): { hours: number; minutes: number; secs: number } => {
    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return { hours, minutes, secs }
  }

  const totalTimeFormatted = formatTime(statistics.totalTime)
  const averageTimeFormatted = formatTime(statistics.averageTime)
  const activeTimeFormatted = formatTime(statistics.totalActiveTime)
  const pauseTimeFormatted = formatTime(statistics.totalPauseTime)
  const extraTimeFormatted = formatTime(statistics.totalExtraTime)

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      statistics,
      sessions: completedSessions.map(session => ({
        sessionNumber: session.sessionNumber,
        sessionData: session.sessionData,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vingtcinq-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const headers = ['Session Number', 'Active Time (s)', 'Pause Time (s)', 'Extra Time (s)', 'Total Time (s)']
    const rows = completedSessions.map(session => [
      session.sessionNumber,
      session.sessionData.activeTime.toFixed(2),
      session.sessionData.pauseTime.toFixed(2),
      session.sessionData.extraTime.toFixed(2),
      session.sessionData.totalTime.toFixed(2),
    ])
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vingtcinq-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 md:p-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-[0px_12px_24px_0px_rgba(14,18,27,0.12),0px_1px_2px_0px_rgba(14,18,27,0.03)] border border-[#e1e4ea] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e1e4ea]">
          <div className="flex gap-2 items-center">
            <i className="ri-bar-chart-line text-[20px] text-[#525866]"></i>
            <span className="text-[18px] font-medium text-[#0e121b] leading-[24px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Statistics
            </span>
          </div>
          <button
            onClick={onHide}
            className="bg-white flex items-center justify-center w-8 h-8 rounded-lg border border-[#f3f4f6] shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            aria-label="Close statistics"
          >
            <i className="ri-close-line text-[20px] text-[#525866]"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total Sessions */}
          <div className="bg-[#f8fafb] border border-[#e1e4ea] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-time-line text-[16px] text-[#525866]"></i>
              <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Total Sessions
              </span>
            </div>
            <p className="text-[24px] font-medium text-[#0e121b] leading-[32px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {statistics.totalSessions}
            </p>
          </div>

          {/* Total Time */}
          <div className="bg-[#f8fafb] border border-[#e1e4ea] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-timer-line text-[16px] text-[#525866]"></i>
              <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Total Time
              </span>
            </div>
            <p className="text-[24px] font-medium text-[#0e121b] leading-[32px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {totalTimeFormatted.hours}h {totalTimeFormatted.minutes}m {totalTimeFormatted.secs}s
            </p>
          </div>

          {/* Average Time */}
          {statistics.totalSessions > 0 && (
            <div className="bg-[#f8fafb] border border-[#e1e4ea] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-line-chart-line text-[16px] text-[#525866]"></i>
                <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Average Session
                </span>
              </div>
              <p className="text-[24px] font-medium text-[#0e121b] leading-[32px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                {averageTimeFormatted.hours}h {averageTimeFormatted.minutes}m {averageTimeFormatted.secs}s
              </p>
            </div>
          )}

          {/* Breakdown */}
          {statistics.totalSessions > 0 && (
            <div className="bg-[#f8fafb] border border-[#e1e4ea] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-pie-chart-line text-[16px] text-[#525866]"></i>
                <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Time Breakdown
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#47c2ff] border border-white shrink-0"></div>
                    <span className="text-[14px] font-normal text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Active
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {activeTimeFormatted.hours}h {activeTimeFormatted.minutes}m {activeTimeFormatted.secs}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#f6b51e] border border-white shrink-0"></div>
                    <span className="text-[14px] font-normal text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Pause
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {pauseTimeFormatted.hours}h {pauseTimeFormatted.minutes}m {pauseTimeFormatted.secs}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#7d52f4] border border-white shrink-0"></div>
                    <span className="text-[14px] font-normal text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Extra
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-[#0e121b] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {extraTimeFormatted.hours}h {extraTimeFormatted.minutes}m {extraTimeFormatted.secs}s
                  </span>
                </div>
              </div>
            </div>
          )}

          {statistics.totalSessions === 0 && (
            <div className="text-center py-8">
              <i className="ri-bar-chart-line text-[48px] text-[#9ca3af] mb-4"></i>
              <p className="text-[14px] font-normal text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                No completed sessions yet
              </p>
            </div>
          )}

          {/* Daily Goal */}
          <div className="bg-[#f8fafb] border border-[#e1e4ea] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className="ri-target-line text-[16px] text-[#525866]"></i>
                <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Daily Goal
                </span>
              </div>
              <div className="flex gap-1">
                {[2, 4, 6, 8].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => onDailyGoalChange(hours)}
                    className={`px-2 py-1 rounded text-[12px] font-medium transition-all ${
                      dailyGoal === hours
                        ? 'bg-[#47c2ff] text-white'
                        : 'bg-white border border-[#e1e4ea] text-[#525866] hover:bg-[#f8fafb]'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {hours}h
                  </button>
                ))}
                <button
                  onClick={() => onDailyGoalChange(0)}
                  className={`px-2 py-1 rounded text-[12px] font-medium transition-all ${
                    dailyGoal === 0
                      ? 'bg-[#47c2ff] text-white'
                      : 'bg-white border border-[#e1e4ea] text-[#525866] hover:bg-[#f8fafb]'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Off
                </button>
              </div>
            </div>
            {dailyGoal > 0 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-normal text-[#525866] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Today: {Math.floor(todayTotalTime / 3600)}h {Math.floor((todayTotalTime % 3600) / 60)}m
                  </span>
                  <span className="text-[12px] font-medium text-[#0e121b] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {Math.min(Math.round((todayTotalTime / (dailyGoal * 3600)) * 100), 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#e1e4ea] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#47c2ff] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todayTotalTime / (dailyGoal * 3600)) * 100, 100)}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Export Buttons */}
          {statistics.totalSessions > 0 && (
            <div className="pt-4 border-t border-[#e1e4ea]">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-download-line text-[16px] text-[#525866]"></i>
                <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Export Data
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 bg-white border border-[#e1e4ea] rounded-lg px-4 py-2 hover:bg-[#f8fafb] active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  aria-label="Export as JSON"
                >
                  <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    JSON
                  </span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex-1 bg-white border border-[#e1e4ea] rounded-lg px-4 py-2 hover:bg-[#f8fafb] active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  aria-label="Export as CSV"
                >
                  <span className="text-[14px] font-medium text-[#525866] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    CSV
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

