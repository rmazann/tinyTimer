import { useState, useEffect, useRef, useCallback } from 'react'

const INITIAL_TIME = 0 // Timer starts at 00:00
const STORAGE_KEY = 'vingtcinq-session-count'

export interface SessionData {
  activeTime: number // seconds
  pauseTime: number // seconds
  extraTime: number // seconds
  totalTime: number // seconds (activeTime + extraTime, pauseTime not included)
}

interface UseTimerReturn {
  timeRemaining: number
  isRunning: boolean
  hasStarted: boolean
  sessionCount: number
  sessionData: SessionData
  lastCompletedSession: { sessionNumber: number; sessionData: SessionData } | null
  start: () => void
  pause: () => void
  reset: () => void
  toggle: () => void
  setTimeRemaining: (seconds: number) => void
  addExtraTime: (seconds: number) => void
  startNewSession: () => void
}

export function useTimer(): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number>(INITIAL_TIME)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [sessionCount, setSessionCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? parseInt(stored, 10) : 1
    }
    return 1
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number | null>(null)
  const isRunningRef = useRef<boolean>(false)
  const pauseIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Session tracking
  const [sessionData, setSessionData] = useState<SessionData>({
    activeTime: 0,
    pauseTime: 0,
    extraTime: 0,
    totalTime: 0,
  })
  const sessionDataRef = useRef<SessionData>(sessionData) // Ref to track current sessionData
  const [lastCompletedSession, setLastCompletedSession] = useState<{ sessionNumber: number; sessionData: SessionData } | null>(null)
  const pauseStartTimeRef = useRef<number | null>(null)
  const pauseTimeAtPauseStartRef = useRef<number>(0) // Store pause time when pause started
  const lastActiveTimeUpdateRef = useRef<number | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    sessionDataRef.current = sessionData
  }, [sessionData])

  // Sync ref with state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  // Update pause time in real-time when paused
  useEffect(() => {
    if (!isRunning && pauseStartTimeRef.current && hasStarted) {
      // Update pause time every second while paused
      pauseIntervalRef.current = setInterval(() => {
        if (pauseStartTimeRef.current) {
          const now = Date.now()
          const elapsedSincePause = (now - pauseStartTimeRef.current) / 1000
          // Calculate current pause time: pause time when pause started + elapsed time since pause
          setSessionData((prev) => {
            const newPauseTime = pauseTimeAtPauseStartRef.current + elapsedSincePause
            // totalTime remains activeTime + extraTime (pauseTime not included)
            const newTotalTime = prev.activeTime + prev.extraTime
            return {
              ...prev,
              pauseTime: newPauseTime,
              totalTime: newTotalTime,
            }
          })
        }
      }, 1000)

      return () => {
        if (pauseIntervalRef.current) {
          clearInterval(pauseIntervalRef.current)
          pauseIntervalRef.current = null
        }
      }
    } else {
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current)
        pauseIntervalRef.current = null
      }
    }
  }, [isRunning, hasStarted])

  // Update document title with remaining time
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const minutes = Math.floor(timeRemaining / 60)
      const seconds = timeRemaining % 60
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      document.title = `${timeString} - Tiny Timer`
    }
  }, [timeRemaining])

  const completeSession = useCallback(() => {
    setTimeRemaining(0)
    setIsRunning(false)
    isRunningRef.current = false
    endTimeRef.current = null

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setSessionCount((prev) => {
      const newCount = prev + 1
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newCount.toString())
      }
      return newCount
    })
  }, [])

  const syncRemainingTime = useCallback(() => {
    if (!endTimeRef.current || !isRunningRef.current) return

    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setTimeRemaining(remaining)

    // Track active time
    if (lastActiveTimeUpdateRef.current) {
      const elapsed = (now - lastActiveTimeUpdateRef.current) / 1000
      setSessionData((prev) => {
        const newActiveTime = prev.activeTime + elapsed
        const newTotalTime = newActiveTime + prev.extraTime // pauseTime not included in total
        return {
          ...prev,
          activeTime: newActiveTime,
          totalTime: newTotalTime,
        }
      })
    }
    lastActiveTimeUpdateRef.current = now

    if (remaining <= 0) {
      // Timer finished - just stop it, don't complete session yet
      // Session will be completed when user presses play button
      setIsRunning(false)
      isRunningRef.current = false
      endTimeRef.current = null
      lastActiveTimeUpdateRef.current = null

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const startNewSession = useCallback(() => {
    // If timer is running, pause it first to properly track active time and pause time
    if (isRunning && hasStarted) {
      // Use the pause logic to properly track time
      setIsRunning(false)
      isRunningRef.current = false

      // Track the moment we paused
      if (lastActiveTimeUpdateRef.current) {
        const now = Date.now()
        const elapsed = (now - lastActiveTimeUpdateRef.current) / 1000
        setSessionData((prev) => {
          const newActiveTime = prev.activeTime + elapsed
          const newTotalTime = newActiveTime + prev.extraTime
          pauseTimeAtPauseStartRef.current = prev.pauseTime
          return {
            ...prev,
            activeTime: newActiveTime,
            totalTime: newTotalTime,
          }
        })
        lastActiveTimeUpdateRef.current = null
      } else {
        // If no active time was being tracked, just store current pause time
        setSessionData((prev) => {
          pauseTimeAtPauseStartRef.current = prev.pauseTime
          return prev
        })
      }

      pauseStartTimeRef.current = null // Don't start pause time tracking, we're completing the session
      pauseTimeAtPauseStartRef.current = 0
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current)
        pauseIntervalRef.current = null
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // If session has started, complete it and start a new one
    if (hasStarted) {
      // Capture current session number and data before any state updates
      const completedSessionNumber = sessionCount
      const completedSessionData = { ...sessionDataRef.current }

      console.log('startNewSession - Completing session:', completedSessionNumber, 'with data:', completedSessionData)

      // Save completed session first
      setLastCompletedSession({
        sessionNumber: completedSessionNumber,
        sessionData: completedSessionData,
      })

      // Reset session tracking for new session
      setSessionData({
        activeTime: 0,
        pauseTime: 0,
        extraTime: 0,
        totalTime: 0,
      })

      // Complete previous session (increment session count)
      setSessionCount((prev) => {
        const newCount = prev + 1
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, newCount.toString())
        }
        return newCount
      })
    }

    // Reset timer to initial state for new session
    setTimeRemaining(INITIAL_TIME)
    setIsRunning(false)
    isRunningRef.current = false
    setHasStarted(false)
    endTimeRef.current = null
    pauseStartTimeRef.current = null
    lastActiveTimeUpdateRef.current = null
    pauseTimeAtPauseStartRef.current = 0

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (pauseIntervalRef.current) {
      clearInterval(pauseIntervalRef.current)
      pauseIntervalRef.current = null
    }
  }, [hasStarted, isRunning, sessionCount])

  const reset = useCallback(() => {
    // Stop the timer if it's running
    setIsRunning(false)
    isRunningRef.current = false

    // Clear any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (pauseIntervalRef.current) {
      clearInterval(pauseIntervalRef.current)
      pauseIntervalRef.current = null
    }

    // Reset timer to initial state
    setTimeRemaining(INITIAL_TIME)
    endTimeRef.current = null
    setHasStarted(false)

    // Reset session tracking
    setSessionData({
      activeTime: 0,
      pauseTime: 0,
      extraTime: 0,
      totalTime: 0,
    })
    pauseStartTimeRef.current = null
    pauseTimeAtPauseStartRef.current = 0
    lastActiveTimeUpdateRef.current = null

    // Reset document title
    if (typeof document !== 'undefined') {
      document.title = 'Tiny Timer'
    }
  }, [])

  const start = useCallback(() => {
    console.log('start() called - timeRemaining:', timeRemaining, 'hasStarted:', hasStarted)
    // If timer is at 0 and has been started before, complete previous session and start new one
    if (timeRemaining <= 0 && hasStarted) {
      // Capture current session number and data before any state updates
      const completedSessionNumber = sessionCount
      const completedSessionData = { ...sessionDataRef.current }

      console.log('Completing session:', completedSessionNumber, 'with data:', completedSessionData)

      // Save completed session first
      setLastCompletedSession({
        sessionNumber: completedSessionNumber,
        sessionData: completedSessionData,
      })

      // Reset session tracking for new session
      setSessionData({
        activeTime: 0,
        pauseTime: 0,
        extraTime: 0,
        totalTime: 0,
      })

      // Complete previous session (increment session count)
      setSessionCount((prev) => {
        const newCount = prev + 1
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, newCount.toString())
        }
        return newCount
      })
      pauseStartTimeRef.current = null
      lastActiveTimeUpdateRef.current = null

      // Reset to initial time - timer should become input again for new session
      setTimeRemaining(INITIAL_TIME)
      setIsRunning(false) // Don't start automatically
      isRunningRef.current = false
      setHasStarted(false) // Reset hasStarted so timer becomes input again
      endTimeRef.current = null

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current)
        pauseIntervalRef.current = null
      }

      // Don't start the timer automatically - user needs to input time and press play again
      return
    }

    // If timer is at 0 but hasn't started before, just reset
    if (timeRemaining <= 0) {
      reset()
      return
    }

    setIsRunning(true)
    isRunningRef.current = true
    setHasStarted(true)

    // When resuming, pause time is already being updated in real-time by the interval
    // So we just need to stop the interval and finalize the pause time
    if (pauseStartTimeRef.current) {
      // Final pause time is already calculated by the interval, just clear the refs
      pauseStartTimeRef.current = null
      pauseTimeAtPauseStartRef.current = 0
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Calculate when the timer should end (current time + remaining time)
    const now = Date.now()
    endTimeRef.current = now + timeRemaining * 1000

    // Set lastActiveTimeUpdateRef to now, but don't count the elapsed time from pause until now
    // The active time was already finalized when pause was called
    lastActiveTimeUpdateRef.current = now

    intervalRef.current = setInterval(() => {
      syncRemainingTime()
    }, 100)

    // Sync timeRemaining immediately without updating activeTime
    // We only need to update the display, not accumulate more active time
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
    setTimeRemaining(remaining)
  }, [timeRemaining, hasStarted, reset, syncRemainingTime, sessionCount])

  const pause = useCallback(() => {
    setIsRunning(false)
    isRunningRef.current = false

    // Track the moment we paused
    if (lastActiveTimeUpdateRef.current) {
      const now = Date.now()
      const elapsed = (now - lastActiveTimeUpdateRef.current) / 1000
      setSessionData((prev) => {
        const newActiveTime = prev.activeTime + elapsed
        const newTotalTime = newActiveTime + prev.extraTime // pauseTime not included in total
        // Store current pause time when pause starts (for real-time updates)
        pauseTimeAtPauseStartRef.current = prev.pauseTime
        return {
          ...prev,
          activeTime: newActiveTime,
          totalTime: newTotalTime,
        }
      })
      lastActiveTimeUpdateRef.current = null
    } else {
      // If no active time was being tracked, just store current pause time
      setSessionData((prev) => {
        pauseTimeAtPauseStartRef.current = prev.pauseTime
        return prev
      })
    }

    pauseStartTimeRef.current = Date.now()

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // endTimeRef remains set so we can resume from the same point
  }, [])

  const toggle = useCallback(() => {
    if (isRunning) {
      pause()
    } else {
      start()
    }
  }, [isRunning, start, pause])

  // Keep the timer accurate when returning to the tab (browsers throttle timers)
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
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current)
      }
    }
  }, [])

  const setTime = useCallback((seconds: number) => {
    // Only allow setting time when timer has not started yet
    if (!hasStarted) {
      setTimeRemaining(Math.max(0, seconds))
    }
  }, [hasStarted])

  const addExtraTime = useCallback((seconds: number) => {
    // Track extra time
    setSessionData((prev) => {
      const newExtraTime = prev.extraTime + seconds
      const newTotalTime = prev.activeTime + newExtraTime // pauseTime not included in total
      return {
        ...prev,
        extraTime: newExtraTime,
        totalTime: newTotalTime,
      }
    })

    // Add extra time to current remaining time (works even when timer has started)
    setTimeRemaining((prev) => {
      const newTime = Math.max(0, prev + seconds)

      // If timer is running, update endTimeRef to extend the timer without starting a new session
      if (isRunning && endTimeRef.current) {
        // Extend the end time by the added seconds
        endTimeRef.current = endTimeRef.current + seconds * 1000
      } else if (!isRunning && prev === 0 && hasStarted) {
        // If timer was completed (0) and we're adding time while not running, 
        // just update the time without changing session count
        // endTimeRef stays null until start() is called again
      }

      return newTime
    })
  }, [isRunning, hasStarted])

  return {
    timeRemaining,
    isRunning,
    hasStarted,
    sessionCount,
    sessionData,
    lastCompletedSession,
    start,
    pause,
    reset,
    toggle,
    setTimeRemaining: setTime,
    addExtraTime,
    startNewSession,
  }
}

