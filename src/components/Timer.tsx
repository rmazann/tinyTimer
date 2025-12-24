import React, { useState, useEffect, useRef } from 'react'
import { formatTime, parseTimeToSeconds } from '../utils/timeUtils'

interface TimerProps {
  timeRemaining: number
  isRunning: boolean
  hasStarted: boolean
  onTimeChange: (seconds: number) => void
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, isRunning, hasStarted, onTimeChange }) => {
  const isCompleted = timeRemaining === 0 && hasStarted
  const [inputValue, setInputValue] = useState<string>(formatTime(timeRemaining))
  const inputRef = useRef<HTMLInputElement>(null)

  // Update input value when timeRemaining changes (but only if timer is running or not focused)
  useEffect(() => {
    if (!inputRef.current || document.activeElement !== inputRef.current) {
      setInputValue(formatTime(timeRemaining))
    }
  }, [timeRemaining])

  // Format time with labels for display
  const formatTimeForDisplay = (seconds: number): JSX.Element => {
    const totalMinutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    // If 60 minutes or more, use hour format
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return (
        <>
          {hours}h:{minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
        </>
      )
    }
    
    // Otherwise use MM:SS format
    const minutes = totalMinutes
    return (
      <>
        {minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
      </>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasStarted) return // Don't allow changes once timer has started
    
    const value = e.target.value
    setInputValue(value)
  }

  const handleBlur = () => {
    // Parse the input value and update the timer
    const seconds = parseTimeToSeconds(inputValue)
    const validSeconds = Math.max(0, seconds) // No upper limit
    onTimeChange(validSeconds)
    setInputValue(formatTime(validSeconds))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasStarted) {
      e.preventDefault()
      return
    }
    
    // Handle Enter key - blur to save the value
    if (e.keyCode === 13) {
      inputRef.current?.blur()
      return
    }
    
    // Allow: backspace, delete, tab, escape, arrow keys, numbers, colon, and 'h' for hour format
    if (
      [8, 9, 27, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow numbers (0-9)
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      // Allow colon key (Shift+; or numpad)
      (e.keyCode === 186) || (e.keyCode === 59) ||
      // Allow 'h', 'H', 'm', 'M', 's', 'S' for hour format
      (e.keyCode === 72) || (e.keyCode === 104) || // h, H
      (e.keyCode === 77) || (e.keyCode === 109) || // m, M
      (e.keyCode === 83) || (e.keyCode === 115) || // s, S
      // Allow space
      (e.keyCode === 32)
    ) {
      return
    }
    e.preventDefault()
  }

  return (
    <div className="flex items-center justify-center">
      {hasStarted ? (
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
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="font-normal text-black dark:text-white tracking-tight bg-transparent border-none outline-none text-center focus:outline-none focus:ring-0 cursor-text placeholder:text-gray-400 dark:placeholder:text-gray-600"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '104px',
            lineHeight: '112px',
            caretColor: 'currentColor',
            minWidth: '289px',
            width: 'auto',
          }}
          inputMode="numeric"
          placeholder="00:00"
        />
      )}
    </div>
  )
}

