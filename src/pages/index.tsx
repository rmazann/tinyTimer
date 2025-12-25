import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { navigate } from 'gatsby'
import { useTimer, SessionData } from '../hooks/useTimer'
import { useDarkMode } from '../hooks/useDarkMode'
import { useBreakTimer } from '../hooks/useBreakTimer'
import { useAuth } from '../hooks/useAuth'
import { useSessions } from '../hooks/useSessions'
import { Timer } from '../components/Timer'
import { BreakTimer } from '../components/BreakTimer'
import { SessionTracker } from '../components/SessionTracker'
import { Controls } from '../components/Controls'
import { SessionsPanel } from '../components/SessionsPanel'
import { playCompletionSound } from '../utils/soundUtils'
import '../styles/global.css'

interface CompletedSession {
  sessionNumber: number
  sessionData: {
    activeTime: number
    pauseTime: number
    extraTime: number
    totalTime: number
  }
}

const IndexPage: React.FC = () => {
  const { timeRemaining, isRunning, hasStarted, sessionCount, sessionData, lastCompletedSession, start, pause, reset, setTimeRemaining, addExtraTime, startNewSession } = useTimer()
  const { isDark, toggleDarkMode } = useDarkMode()
  const { isAuthenticated, isLoading: authLoading, email, logout, user } = useAuth()
  const { sessions: supabaseSessions, saveSession, updateSessionName, isLoading: sessionsLoading, getNextSessionNumber } = useSessions(user)
  const {
    timeRemaining: breakTimeRemaining,
    isRunning: isBreakRunning,
    hasStarted: hasBreakStarted,
    breakType,
    isCompleted: isBreakCompleted,
    startBreak,
    pause: pauseBreak,
    resume: resumeBreak,
    reset: resetBreak,
    skip: skipBreak
  } = useBreakTimer()
  const isCompleted = timeRemaining === 0 && hasStarted
  const [showExtraTimeOptions, setShowExtraTimeOptions] = useState(false)
  const [showSessionsPanel, setShowSessionsPanel] = useState(false)
  const [isClosingSessionsPanel, setIsClosingSessionsPanel] = useState(false)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [sessionNames, setSessionNames] = useState<Record<number, string>>({})
  const lastProcessedCompletedSessionRef = useRef<number | null>(null)
  const hasPlayedSoundRef = useRef<boolean>(false)
  const hasShownBreakSuggestionRef = useRef<boolean>(false)

  // Convert Supabase sessions to CompletedSession format
  const allCompletedSessions = useMemo((): CompletedSession[] => {
    return supabaseSessions.map(session => ({
      sessionNumber: session.session_number,
      sessionData: {
        activeTime: session.active_time,
        pauseTime: session.pause_time,
        extraTime: session.extra_time,
        totalTime: session.total_time,
      }
    })).sort((a, b) => a.sessionNumber - b.sessionNumber)
  }, [supabaseSessions])

  // Build session names from Supabase sessions
  useEffect(() => {
    const names: Record<number, string> = {}
    supabaseSessions.forEach(session => {
      if (session.session_name) {
        names[session.session_number] = session.session_name
      }
    })
    setSessionNames(prev => ({ ...names, ...prev }))
  }, [supabaseSessions])

  // Auth check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated])

  // Track when a new completed session is available from useTimer and save to Supabase
  useEffect(() => {
    console.log('useEffect triggered - lastCompletedSession:', lastCompletedSession, 'lastProcessedRef:', lastProcessedCompletedSessionRef.current)
    if (lastCompletedSession && lastCompletedSession.sessionNumber !== lastProcessedCompletedSessionRef.current) {
      console.log('Saving session:', lastCompletedSession.sessionNumber)
      lastProcessedCompletedSessionRef.current = lastCompletedSession.sessionNumber

      // Save to Supabase (it will appear in allCompletedSessions via real-time subscription)
      if (user) {
        const sessionToSave = {
          session_number: lastCompletedSession.sessionNumber,
          session_name: sessionNames[lastCompletedSession.sessionNumber] || null,
          active_time: Math.round(lastCompletedSession.sessionData.activeTime),
          pause_time: Math.round(lastCompletedSession.sessionData.pauseTime),
          extra_time: Math.round(lastCompletedSession.sessionData.extraTime),
          total_time: Math.round(lastCompletedSession.sessionData.totalTime),
        }
        console.log('Calling saveSession with:', sessionToSave)
        saveSession(sessionToSave).then((result) => {
          console.log('saveSession result:', result)
        })
      }
    }
  }, [lastCompletedSession, user, saveSession, sessionNames])

  // Play sound when timer completes
  useEffect(() => {
    if (isCompleted && !hasPlayedSoundRef.current) {
      playCompletionSound()
      hasPlayedSoundRef.current = true
      // Show break suggestion when session completes
      if (!hasBreakStarted && !hasShownBreakSuggestionRef.current) {
        setShowBreakSuggestion(true)
        hasShownBreakSuggestionRef.current = true
      }
    } else if (!isCompleted) {
      // Reset sound flag when timer is no longer completed (e.g., after reset or new session)
      hasPlayedSoundRef.current = false
      hasShownBreakSuggestionRef.current = false
      setShowBreakSuggestion(false)
    }
  }, [isCompleted, hasBreakStarted])

  // Hide break suggestion when break starts
  useEffect(() => {
    if (hasBreakStarted) {
      setShowBreakSuggestion(false)
    }
  }, [hasBreakStarted])

  // Handle break completion
  useEffect(() => {
    if (isBreakCompleted) {
      playCompletionSound()
    }
  }, [isBreakCompleted])

  const handleSessionNameChange = async (sessionNumber: number, newName: string) => {
    setSessionNames((prev) => ({
      ...prev,
      [sessionNumber]: newName
    }))

    // Update in Supabase if session exists
    const existingSession = supabaseSessions.find(s => s.session_number === sessionNumber)
    if (existingSession) {
      await updateSessionName(existingSession.id, newName)
    }
  }

  const handleExtra = () => {
    setShowExtraTimeOptions(true)
  }

  const handleSelectExtraTime = (seconds: number) => {
    // Add extra time to current remaining time
    addExtraTime(seconds)
    setShowExtraTimeOptions(false)
  }

  const handleCloseExtraTime = () => {
    setShowExtraTimeOptions(false)
  }

  const handleStartBreak = (type: 'short' | 'long') => {
    startBreak(type)
    setShowBreakSuggestion(false)
  }

  const handleSkipBreak = () => {
    skipBreak()
    setShowBreakSuggestion(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Don't trigger if modifier keys are pressed (to avoid conflicts with browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space - Play/Pause toggle
          e.preventDefault()
          if (hasBreakStarted) {
            // Break timer controls
            if (isBreakRunning) {
              pauseBreak()
            } else if (hasBreakStarted && breakTimeRemaining > 0) {
              resumeBreak()
            }
          } else {
            // Normal timer controls
            if (isRunning) {
              pause()
            } else if (hasStarted || timeRemaining > 0) {
              start()
            }
          }
          break

        case 'r': // R - Reset
          e.preventDefault()
          if (hasBreakStarted) {
            // Break timer reset - restart the break
            if (breakType) {
              startBreak(breakType)
            } else {
              resetBreak()
            }
          } else {
            // Normal timer reset
            reset()
          }
          break

        case 'e': // E - Extra time menu toggle (only when break is not active)
          e.preventDefault()
          if (!hasBreakStarted) {
            if (showExtraTimeOptions) {
              setShowExtraTimeOptions(false)
            } else if (isCompleted) {
              setShowExtraTimeOptions(true)
            }
          }
          break

        case 'x': // X - Skip break (only when break is active)
          e.preventDefault()
          if (hasBreakStarted) {
            skipBreak()
          }
          break

        case 's': // S - Sessions panel toggle
          e.preventDefault()
          if (showSessionsPanel && !isClosingSessionsPanel) {
            // Start closing animation
            setIsClosingSessionsPanel(true)
          } else if (!showSessionsPanel) {
            // Open panel
            setShowSessionsPanel(true)
            setIsClosingSessionsPanel(false)
          }
          break

        case 'escape': // Esc - Close open menus
          e.preventDefault()
          if (showExtraTimeOptions) {
            setShowExtraTimeOptions(false)
          }
          if (showSessionsPanel && !isClosingSessionsPanel) {
            // Start closing animation
            setIsClosingSessionsPanel(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRunning, hasStarted, timeRemaining, showExtraTimeOptions, showSessionsPanel, isClosingSessionsPanel, start, pause, reset, isCompleted, hasBreakStarted, isBreakRunning, breakTimeRemaining, breakType, pauseBreak, resumeBreak, startBreak, resetBreak, skipBreak])

  // Handle sessions panel close after animation
  const handleSessionsPanelHide = useCallback(() => {
    setShowSessionsPanel(false)
    setIsClosingSessionsPanel(false)
  }, [])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0e121b] transition-colors duration-200">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 bg-white dark:bg-[#0e121b] relative overflow-x-hidden transition-colors duration-200">
      {/* Logout Button - Top Left */}
      <button
        onClick={logout}
        className="absolute top-6 md:top-8 left-6 md:left-8 bg-white dark:bg-[#1a1f2e] flex items-center justify-center gap-2 px-3 h-10 rounded-lg border border-[#f3f4f6] dark:border-[#2a2f3e] shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b] z-50"
        aria-label="Çıkış yap"
        title={email ? `${email} olarak giriş yapıldı` : 'Çıkış yap'}
      >
        <i className="ri-logout-box-r-line text-[18px] text-[#525866] dark:text-[#e5e7eb]"></i>
        <span className="text-sm text-[#525866] dark:text-[#e5e7eb] hidden sm:inline" style={{ fontFamily: "'Inter', sans-serif" }}>Çıkış</span>
      </button>

      {/* Dark Mode Toggle Button - Top Right */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 md:top-8 right-6 md:right-8 bg-white dark:bg-[#1a1f2e] flex items-center justify-center w-10 h-10 rounded-lg border border-[#f3f4f6] dark:border-[#2a2f3e] shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b] z-50"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <i className="ri-sun-line text-[20px] text-[#525866] dark:text-[#e5e7eb]"></i>
        ) : (
          <i className="ri-moon-line text-[20px] text-[#525866]"></i>
        )}
      </button>
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        {/* Show break timer if break is active, otherwise show normal timer */}
        {hasBreakStarted ? (
          <>
            {/* Break Timer */}
            <div className="w-full flex justify-center">
              <BreakTimer
                timeRemaining={breakTimeRemaining}
                isRunning={isBreakRunning}
                hasStarted={hasBreakStarted}
                breakType={breakType}
                isCompleted={isBreakCompleted}
                onStartBreak={handleStartBreak}
                onPause={pauseBreak}
                onResume={resumeBreak}
                onReset={resetBreak}
                onSkip={handleSkipBreak}
              />
            </div>
          </>
        ) : (
          <>
            {/* Session Tracker */}
            <div className="w-full flex justify-center">
              <SessionTracker
                sessionCount={sessionCount}
                isRunning={isRunning}
                hasStarted={hasStarted}
                isCompleted={isCompleted}
              />
            </div>

            {/* Timer Display - 32px gap from Session Tracker */}
            <div className="w-full flex justify-center mt-8">
              <Timer timeRemaining={timeRemaining} isRunning={isRunning} hasStarted={hasStarted} onTimeChange={setTimeRemaining} />
            </div>

            {/* Controls - 32px gap from Timer */}
            <div className="w-full flex justify-center mt-8">
              <Controls
                isRunning={isRunning}
                isCompleted={isCompleted}
                showExtraTimeOptions={showExtraTimeOptions}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onExtra={handleExtra}
                onSelectExtraTime={handleSelectExtraTime}
                onCloseExtraTime={handleCloseExtraTime}
              />
            </div>

            {/* Break Suggestion - Show when session completes */}
            {showBreakSuggestion && isCompleted && (
              <div className="w-full flex justify-center mt-8">
                <BreakTimer
                  timeRemaining={breakTimeRemaining}
                  isRunning={isBreakRunning}
                  hasStarted={hasBreakStarted}
                  breakType={breakType}
                  isCompleted={isBreakCompleted}
                  onStartBreak={handleStartBreak}
                  onPause={pauseBreak}
                  onResume={resumeBreak}
                  onReset={resetBreak}
                  onSkip={handleSkipBreak}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sessions Button - Bottom of page */}
      {!showSessionsPanel && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in-up">
          <button
            onClick={() => {
              setShowSessionsPanel(true)
              setIsClosingSessionsPanel(false)
            }}
            className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center px-[10px] py-[6px] rounded-lg border border-[#f3f4f6] dark:border-[#2a2f3e] shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
            aria-label="View sessions"
          >
            <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sessions
            </span>
          </button>
        </div>
      )}

      {/* Sessions Panel */}
      {showSessionsPanel && (
        <SessionsPanel
          sessionCount={sessionCount}
          sessionData={sessionData}
          isRunning={isRunning}
          hasStarted={hasStarted}
          isCompleted={isCompleted}
          completedSessions={allCompletedSessions}
          sessionNames={sessionNames}
          onSessionNameChange={handleSessionNameChange}
          onHide={handleSessionsPanelHide}
          onAddNew={() => {
            startNewSession()
          }}
          isClosing={isClosingSessionsPanel}
        />
      )}
    </main>
  )
}

export default IndexPage

export const Head: React.FC = () => (
  <>
    <title>Tiny Timer</title>
    <meta name="description" content="A minimalistic 25-minute Pomodoro timer" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
  </>
)

