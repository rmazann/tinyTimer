import { useState, useEffect, useRef, useCallback } from 'react'

export type BreakType = 'short' | 'long' | null

const SHORT_BREAK_DURATION = 5 * 60 // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60 // 15 minutes in seconds

interface UseBreakTimerReturn {
  timeRemaining: number
  isRunning: boolean
  hasStarted: boolean
  breakType: BreakType
  isCompleted: boolean
  startBreak: (type: 'short' | 'long') => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
}

export function useBreakTimer(): UseBreakTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [breakType, setBreakType] = useState<BreakType>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number | null>(null)
  const isRunningRef = useRef<boolean>(false)

  // Sync ref with state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  // Update document title with remaining time
  useEffect(() => {
    if (typeof document !== 'undefined' && hasStarted && breakType && isRunning) {
      const minutes = Math.floor(timeRemaining / 60)
      const seconds = timeRemaining % 60
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      const breakLabel = breakType === 'short' ? 'Short Break' : 'Long Break'
      document.title = `${timeString} - ${breakLabel} - Vingt-Cinq`
    } else if (typeof document !== 'undefined' && hasStarted && breakType && !isRunning) {
      const breakLabel = breakType === 'short' ? 'Short Break' : 'Long Break'
      document.title = `${breakLabel} - Vingt-Cinq`
    }
  }, [timeRemaining, hasStarted, breakType, isRunning])

  const syncRemainingTime = useCallback(() => {
    if (!endTimeRef.current || !isRunningRef.current) return

    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setTimeRemaining(remaining)

    if (remaining <= 0) {
      setIsRunning(false)
      isRunningRef.current = false
      setIsCompleted(true)
      endTimeRef.current = null
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const startBreak = useCallback((type: 'short' | 'long') => {
    const duration = type === 'short' ? SHORT_BREAK_DURATION : LONG_BREAK_DURATION
    
    setBreakType(type)
    setTimeRemaining(duration)
    setIsRunning(false)
    isRunningRef.current = false
    setHasStarted(true)
    setIsCompleted(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    endTimeRef.current = null
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    isRunningRef.current = false
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resume = useCallback(() => {
    if (!hasStarted || timeRemaining <= 0) return

    setIsRunning(true)
    isRunningRef.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const now = Date.now()
    endTimeRef.current = now + timeRemaining * 1000

    intervalRef.current = setInterval(() => {
      syncRemainingTime()
    }, 100)

    syncRemainingTime()
  }, [hasStarted, timeRemaining, syncRemainingTime])

  const reset = useCallback(() => {
    setIsRunning(false)
    isRunningRef.current = false
    setHasStarted(false)
    setBreakType(null)
    setIsCompleted(false)
    setTimeRemaining(0)
    endTimeRef.current = null

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (typeof document !== 'undefined') {
      document.title = 'Vingt-Cinq'
    }
  }, [])

  const skip = useCallback(() => {
    reset()
  }, [reset])

  // Keep the timer accurate when returning to the tab
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncRemainingTime()
      }
    }

    const handleFocus = () => syncRemainingTime()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [syncRemainingTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    timeRemaining,
    isRunning,
    hasStarted,
    breakType,
    isCompleted,
    startBreak,
    pause,
    resume,
    reset,
    skip,
  }
}

