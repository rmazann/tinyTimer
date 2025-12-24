import React, { useMemo, useState, useRef, useEffect } from 'react'
import { SessionData } from '../hooks/useTimer'

interface SessionCardProps {
  sessionNumber: number
  sessionData: SessionData
  status: 'completed' | 'in-progress' | 'paused'
  sessionName?: string
  onNameChange?: (sessionNumber: number, newName: string) => void
}

export const SessionCard: React.FC<SessionCardProps> = ({ sessionNumber, sessionData, status, sessionName, onNameChange }) => {
  const [hoveredBar, setHoveredBar] = useState<'pause' | 'active' | 'extra' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(sessionName || `Session ${sessionNumber}`)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setEditValue(sessionName || `Session ${sessionNumber}`)
  }, [sessionName, sessionNumber])
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  const handleClick = () => {
    if (onNameChange) {
      setIsEditing(true)
    }
  }
  
  const handleBlur = () => {
    setIsEditing(false)
    const trimmedValue = editValue.trim()
    const finalValue = trimmedValue || `Session ${sessionNumber}`
    if (onNameChange && finalValue !== (sessionName || `Session ${sessionNumber}`)) {
      onNameChange(sessionNumber, finalValue.slice(0, 16))
    }
    setEditValue(finalValue.slice(0, 16))
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setEditValue(sessionName || `Session ${sessionNumber}`)
      setIsEditing(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 16) {
      setEditValue(value)
    }
  }
  
  const displayName = sessionName || `Session ${sessionNumber}`
  
  // Format time for tooltip (e.g., "1h 2m 39s")
  const formatTimeForTooltip = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
    
    return parts.join(' ')
  }
  
  // Calculate total time in hours, minutes, and seconds
  const { totalHours, totalMinutes, totalSeconds } = useMemo(() => {
    const totalTimeSeconds = Math.floor(sessionData.totalTime)
    const hours = Math.floor(totalTimeSeconds / 3600)
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60)
    const seconds = totalTimeSeconds % 60
    return { totalHours: hours, totalMinutes: minutes, totalSeconds: seconds }
  }, [sessionData.totalTime])
  
  // Calculate progress bar widths
  const { pauseBarWidth, activeBarWidth, extraBarWidth } = useMemo(() => {
    const totalForBar = sessionData.activeTime + sessionData.pauseTime + sessionData.extraTime
    if (totalForBar === 0) {
      return { pauseBarWidth: 0, activeBarWidth: 0, extraBarWidth: 0 }
    }
    
    const barContainerWidth = 328
    const gapWidth = 5
    const numGaps = 2
    const availableWidth = barContainerWidth - (gapWidth * numGaps)
    
    const pausePercent = sessionData.pauseTime / totalForBar
    const activePercent = sessionData.activeTime / totalForBar
    const extraPercent = sessionData.extraTime / totalForBar
    
    return {
      pauseBarWidth: Math.round(Math.max(0, availableWidth * pausePercent)),
      activeBarWidth: Math.round(Math.max(0, availableWidth * activePercent)),
      extraBarWidth: Math.round(Math.max(0, availableWidth * extraPercent)),
    }
  }, [sessionData])

  return (
    <div className="bg-[#f8fafb] dark:bg-[#1a1f2e] border border-[#e1e4ea] dark:border-[#2a2f3e] rounded-2xl shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)] p-[4px] w-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between pl-[6px] pr-[10px] py-[4px]">
        <div className="flex gap-[4px] items-center flex-1 min-w-0">
          <i className="ri-time-line text-[16px] text-[#525866] dark:text-[#e5e7eb] shrink-0"></i>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px] bg-transparent border-none outline-none focus:outline-none flex-1 min-w-0 px-1 -ml-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
              maxLength={16}
            />
          ) : (
            <span 
              className={`text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px] truncate ${onNameChange ? 'cursor-text hover:text-[#0e121b] dark:hover:text-white transition-colors' : ''}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              onClick={handleClick}
              title={displayName}
            >
              {displayName}
            </span>
          )}
        </div>
        {(
          <div className="flex gap-1 items-center px-0 py-[4px] rounded-[6px]">
            {status === 'completed' ? (
              <>
                <div className="w-[6px] h-[6px] rounded-full bg-[#1fc36b] shrink-0"></div>
                <span className="text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Completed
                </span>
              </>
            ) : status === 'in-progress' ? (
              <>
                <div className="w-[6px] h-[6px] rounded-full bg-[#47c2ff] shrink-0"></div>
                <span className="text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  In Progress
                </span>
              </>
            ) : (
              <>
                <div className="w-[6px] h-[6px] rounded-full bg-[#ff8447] shrink-0"></div>
                <span className="text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Paused
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="bg-white dark:bg-[#0e121b] border-[0.75px] border-[#e1e4ea] dark:border-[#2a2f3e] rounded-xl shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)] p-[12px] flex flex-col gap-[10px]">
        {/* Total Time */}
        <div className="w-full">
          <p className="text-[14px] leading-[20px] tracking-[-0.084px]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="font-medium text-[#0e121b] dark:text-white">{totalHours} </span>
            <span className="font-normal text-[#525866] dark:text-[#9ca3af]">hours </span>
            <span className="font-medium text-[#0e121b] dark:text-white">{totalMinutes} </span>
            <span className="font-normal text-[#525866] dark:text-[#9ca3af]">minutes </span>
            <span className="font-medium text-[#0e121b] dark:text-white">{totalSeconds} </span>
            <span className="font-normal text-[#525866] dark:text-[#9ca3af]">seconds in total</span>
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-[5px] items-start w-full h-[10px] relative">
          {pauseBarWidth > 0 && (
            <div 
              className="bg-[#f6b51e] h-[10px] rounded-[2px] shrink-0 relative cursor-pointer"
              style={{ width: `${pauseBarWidth}px` }}
              onMouseEnter={() => setHoveredBar('pause')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {hoveredBar === 'pause' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-10 flex flex-col items-center">
                  <div className="bg-[#0e121b] text-white px-[6px] py-[2px] rounded-[4px] shadow-[0px_12px_24px_0px_rgba(14,18,27,0.06),0px_1px_2px_0px_rgba(14,18,27,0.03)] whitespace-nowrap">
                    <span className="text-[12px] font-normal leading-[14px] text-white block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatTimeForTooltip(sessionData.pauseTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-full mt-[-1px]">
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#0e121b]"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeBarWidth > 0 && (
            <div 
              className="bg-[#47c2ff] h-[10px] rounded-[2px] shrink-0 relative cursor-pointer"
              style={{ width: `${activeBarWidth}px` }}
              onMouseEnter={() => setHoveredBar('active')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {hoveredBar === 'active' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-10 flex flex-col items-center">
                  <div className="bg-[#0e121b] text-white px-[6px] py-[2px] rounded-[4px] shadow-[0px_12px_24px_0px_rgba(14,18,27,0.06),0px_1px_2px_0px_rgba(14,18,27,0.03)] whitespace-nowrap">
                    <span className="text-[12px] font-normal leading-[14px] text-white block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatTimeForTooltip(sessionData.activeTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-full mt-[-1px]">
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#0e121b]"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {extraBarWidth > 0 && (
            <div 
              className="bg-[#7d52f4] h-[10px] rounded-[2px] shrink-0 relative cursor-pointer"
              style={{ width: `${extraBarWidth}px` }}
              onMouseEnter={() => setHoveredBar('extra')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {hoveredBar === 'extra' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-10 flex flex-col items-center">
                  <div className="bg-[#0e121b] text-white px-[6px] py-[2px] rounded-[4px] shadow-[0px_12px_24px_0px_rgba(14,18,27,0.06),0px_1px_2px_0px_rgba(14,18,27,0.03)] whitespace-nowrap">
                    <span className="text-[12px] font-normal leading-[14px] text-white block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatTimeForTooltip(sessionData.extraTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-full mt-[-1px]">
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#0e121b]"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 items-start w-full">
          <div className="flex gap-[4px] items-center shrink-0">
            <div className="w-[8px] h-[8px] rounded-full bg-[#f6b51e] border border-white dark:border-[#0e121b] shrink-0"></div>
            <span className="text-[12px] font-normal text-[#0e121b] dark:text-[#e5e7eb] leading-[16px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Pause Time
            </span>
          </div>
          
          <div className="flex gap-[4px] items-center shrink-0">
            <div className="w-[8px] h-[8px] rounded-full bg-[#47c2ff] border border-white dark:border-[#0e121b] shrink-0"></div>
            <span className="text-[12px] font-normal text-[#0e121b] dark:text-[#e5e7eb] leading-[16px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Active Time
            </span>
          </div>
          
          <div className="flex gap-[4px] items-center shrink-0">
            <div className="w-[8px] h-[8px] rounded-full bg-[#7d52f4] border border-white dark:border-[#0e121b] shrink-0"></div>
            <span className="text-[12px] font-normal text-[#0e121b] dark:text-[#e5e7eb] leading-[16px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Extra Time
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

