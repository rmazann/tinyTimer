import React from 'react'
import { BreakType } from '../hooks/useBreakTimer'
import { formatTime } from '../utils/timeUtils'

interface BreakButtonProps {
  onClick: () => void
  label: string
  ariaLabel: string
}

const BreakButton: React.FC<BreakButtonProps> = ({ onClick, label, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
      aria-label={ariaLabel}
    >
      <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
    </button>
  )
}

interface BreakTimerProps {
  timeRemaining: number
  isRunning: boolean
  hasStarted: boolean
  breakType: BreakType
  isCompleted: boolean
  onStartBreak: (type: 'short' | 'long') => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
}

export const BreakTimer: React.FC<BreakTimerProps> = ({
  timeRemaining,
  isRunning,
  hasStarted,
  breakType,
  isCompleted,
  onStartBreak,
  onPause,
  onResume,
  onReset,
  onSkip,
}) => {
  // Format time with labels for display
  const formatTimeForDisplay = (seconds: number): JSX.Element => {
    const totalMinutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return (
        <>
          {hours}h:{minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
        </>
      )
    }
    
    const minutes = totalMinutes
    return (
      <>
        {minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
      </>
    )
  }

  // Show break suggestion if not started
  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-[14px] font-normal text-[#525866] dark:text-[#9ca3af] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Take a break
        </p>

        <div className="flex items-center justify-center gap-[12px]">
          <BreakButton
            onClick={() => onStartBreak('short')}
            label="5 min"
            ariaLabel="Start short break"
          />
          <BreakButton
            onClick={() => onStartBreak('long')}
            label="15 min"
            ariaLabel="Start long break"
          />
        </div>
      </div>
    )
  }

  // Show break timer
  const dotColor = isRunning ? '#1fc36b' : '#fbbf24' // Green when running, yellow when paused
  
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Break Label */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-[#1a1f2e] border border-gray-300/50 dark:border-[#2a2f3e]">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></div>
        <span className="text-xs font-normal text-gray-600 dark:text-[#e5e7eb]">
          {breakType === 'short' ? 'Short Break' : 'Long Break'}
        </span>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center">
        <div
          className={`font-normal tracking-tight text-center ${isCompleted ? 'text-gray-400 dark:text-gray-600' : 'text-black dark:text-white'}`}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '104px',
            lineHeight: '112px',
            minWidth: '289px',
          }}
        >
          {formatTimeForDisplay(timeRemaining)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-[12px]">
        <button
          onClick={(e) => {
            e.currentTarget.blur()
            if (breakType) {
              onStartBreak(breakType)
            } else {
              onReset()
            }
          }}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Reset break"
        >
          <i className="ri-restart-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Reset
          </span>
        </button>
        
        {!isRunning ? (
          <button
            onClick={(e) => {
              e.currentTarget.blur()
              onResume()
            }}
            className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
            aria-label="Resume break"
          >
            <i className="ri-play-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
            <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Play
            </span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.currentTarget.blur()
              onPause()
            }}
            className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
            aria-label="Pause break"
          >
            <i className="ri-pause-circle-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
            <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Pause
            </span>
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.currentTarget.blur()
            onSkip()
          }}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Skip break"
        >
          <i className="ri-close-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Skip
          </span>
        </button>
      </div>
    </div>
  )
}

