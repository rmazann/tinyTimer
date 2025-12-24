import React from 'react'

interface ControlsProps {
  isRunning: boolean
  isCompleted: boolean
  showExtraTimeOptions: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onExtra: () => void
  onSelectExtraTime: (seconds: number) => void
  onCloseExtraTime: () => void
}

export const Controls: React.FC<ControlsProps> = ({ 
  isRunning, 
  isCompleted, 
  showExtraTimeOptions,
  onStart, 
  onPause, 
  onReset, 
  onExtra,
  onSelectExtraTime,
  onCloseExtraTime
}) => {
  const timeOptions = [3, 5, 10, 15, 25]

  const handleTimeSelect = (minutes: number) => {
    onSelectExtraTime(minutes * 60) // Convert to seconds
    onCloseExtraTime()
  }

  // Show extra time options instead of regular buttons
  if (showExtraTimeOptions) {
    return (
      <div className="flex items-center justify-center gap-[12px]">
        <span className="text-[14px] font-normal text-[#0e121b] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          Extra time:
        </span>
        
        {timeOptions.map((minutes) => (
          <button
            key={minutes}
            onClick={() => handleTimeSelect(minutes)}
            className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          >
            <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              {minutes} min
            </span>
          </button>
        ))}
        
        <button
          onClick={onCloseExtraTime}
          className="bg-[#0e121b] dark:bg-[#1a1f2e] flex items-center justify-center px-[10px] py-[6px] rounded-lg border border-[rgba(255,255,255,0.12)] dark:border-[#2a2f3e] shadow-[0px_1px_2px_0px_rgba(27,28,29,0.48)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
        >
          <i className="ri-close-fill text-[20px] text-white dark:text-[#e5e7eb] leading-none"></i>
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center gap-[12px]">
      {/* Reset Button */}
      <button
        onClick={(e) => {
          e.currentTarget.blur()
          onReset()
        }}
        className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
        aria-label="Reset timer"
      >
        <i className="ri-restart-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
        <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          Reset
        </span>
      </button>
      
      {/* Play Button - Show when timer is not running */}
      {!isRunning && (
        <button
          onClick={(e) => {
            e.currentTarget.blur()
            onStart()
          }}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Start timer"
        >
          <i className="ri-play-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Play
          </span>
        </button>
      )}
      
      {/* Pause Button - Show when timer is running */}
      {isRunning && (
        <button
          onClick={(e) => {
            e.currentTarget.blur()
            onPause()
          }}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Pause timer"
        >
          <i className="ri-pause-circle-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Pause
          </span>
        </button>
      )}
      
      {/* Extra Button - Show only when timer is completed */}
      {isCompleted && (
        <button
          onClick={(e) => {
            e.currentTarget.blur()
            onExtra()
          }}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-[4px] px-[10px] py-[6px] rounded-lg shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] border border-[#f3f4f6] dark:border-[#2a2f3e] w-[90px] h-[32px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Extra"
        >
          <i className="ri-add-circle-line text-[20px] text-[#525866] dark:text-[#e5e7eb] leading-none"></i>
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Extra
          </span>
        </button>
      )}
    </div>
  )
}

