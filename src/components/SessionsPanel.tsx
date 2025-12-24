import React, { useMemo, useEffect, useState, useRef } from 'react'
import { SessionData } from '../hooks/useTimer'
import { SessionCard } from './SessionCard'

interface CompletedSession {
  sessionNumber: number
  sessionData: SessionData
}

interface SessionsPanelProps {
  sessionCount: number
  sessionData: SessionData
  isRunning: boolean
  hasStarted: boolean
  isCompleted: boolean
  completedSessions: CompletedSession[]
  sessionNames?: Record<number, string>
  onSessionNameChange?: (sessionNumber: number, newName: string) => void
  onHide: () => void
  onAddNew: () => void
  isClosing?: boolean
}

export const SessionsPanel: React.FC<SessionsPanelProps> = ({ sessionCount, sessionData, isRunning, hasStarted, isCompleted, completedSessions, sessionNames, onSessionNameChange, onHide, onAddNew, isClosing = false }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0 })
  
  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Handle external close request (e.g., from keyboard shortcut)
  useEffect(() => {
    if (isClosing) {
      setIsDragging(false) // Stop dragging if active
      setIsVisible(false)
      const timer = setTimeout(() => onHide(), 300) // Wait for animation to complete
      return () => clearTimeout(timer)
    }
  }, [isClosing, onHide])
  
  useEffect(() => {
    if (!isDragging) return
    
    // Global mouse event handlers for smooth dragging
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) {
        setIsDragging(false)
        return
      }
      e.preventDefault()
      const walk = (e.pageX - dragStartRef.current.startX) * 2 // Scroll speed multiplier
      scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk
    }
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      if (document.body) {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging])
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging on left mouse button and if not clicking on interactive elements
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button, input, a')) return
    
    if (scrollContainerRef.current) {
      dragStartRef.current = {
        startX: e.pageX,
        scrollLeft: scrollContainerRef.current.scrollLeft
      }
      setIsDragging(true)
    }
  }
  
  const handleMouseLeave = () => {
    // Don't stop dragging on mouse leave, let global handlers handle it
  }

  const handleHide = () => {
    setIsDragging(false) // Stop dragging if active
    setIsVisible(false)
    setTimeout(() => onHide(), 300) // Wait for animation to complete
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsDragging(false)
      if (document.body) {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [])

  // Determine current session status
  const currentSessionStatus = useMemo(() => {
    if (isCompleted) return 'completed'
    if (isRunning) return 'in-progress'
    if (hasStarted) return 'paused'
    return 'paused'
  }, [isCompleted, isRunning, hasStarted])
  
  return (
    <>
      {/* Hide Button - Fixed position above cards */}
      <div 
        className={`absolute left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-out bottom-[calc(1.5rem+9.5rem+1.5rem)] md:bottom-[calc(2rem+9.5rem+1.5rem)] ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          onClick={handleHide}
          className="bg-white dark:bg-[#1a1f2e] flex items-center justify-center px-[10px] py-[6px] rounded-lg border border-[#f3f4f6] dark:border-[#2a2f3e] shadow-[0px_1px_3px_0px_rgba(14,18,27,0.12)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-[#0e121b]"
          aria-label="Hide sessions"
        >
          <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px] whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
            Hide
          </span>
        </button>
      </div>

      {/* Sessions Cards Container */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        className={`absolute bottom-6 md:bottom-8 left-0 right-0 px-6 md:px-8 overflow-x-auto overflow-y-visible hide-scrollbar transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <div className="flex gap-4 justify-start items-end min-w-max">
        {/* Completed Sessions */}
        {completedSessions.map((completedSession, index) => (
          <div
            key={completedSession.sessionNumber}
            className={`transition-all duration-300 ease-out ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{
              transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
            }}
          >
            <SessionCard
              sessionNumber={completedSession.sessionNumber}
              sessionData={completedSession.sessionData}
              status="completed"
              sessionName={sessionNames?.[completedSession.sessionNumber]}
              onNameChange={onSessionNameChange}
            />
          </div>
        ))}
        
        {/* Current Session */}
        {hasStarted && (
          <div
            className={`transition-all duration-300 ease-out ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{
              transitionDelay: isVisible ? `${completedSessions.length * 50}ms` : '0ms'
            }}
          >
            <SessionCard
              sessionNumber={sessionCount}
              sessionData={sessionData}
              status={currentSessionStatus}
              sessionName={sessionNames?.[sessionCount]}
              onNameChange={onSessionNameChange}
            />
          </div>
        )}

        {/* Add New Session Card */}
        <div 
          className={`bg-[#f8fafb] dark:bg-[#1a1f2e] border border-[#e1e4ea] dark:border-[#2a2f3e] rounded-2xl shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)] p-[4px] w-[99px] transition-all duration-300 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: isVisible ? `${(completedSessions.length + (hasStarted ? 1 : 0)) * 50}ms` : '0ms'
          }}
        >
          {/* Header */}
          <div className="pl-[6px] pr-[10px] py-[4px]">
            <div className="flex gap-[4px] items-center">
              <i className="ri-time-line text-[16px] text-[#525866] dark:text-[#e5e7eb]"></i>
              <span className="text-[12px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[16px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Session
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white dark:bg-[#0e121b] border-[0.75px] border-[#e1e4ea] dark:border-[#2a2f3e] rounded-xl shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)] p-[12px] flex flex-col items-center justify-center gap-2 h-[94px]">
            <button
              onClick={onAddNew}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              aria-label="Add new session"
            >
              <i className="ri-add-circle-line text-[20px] text-[#525866] dark:text-[#e5e7eb]"></i>
                <span className="text-[14px] font-medium text-[#525866] dark:text-[#e5e7eb] leading-[20px] tracking-[-0.084px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Add new
              </span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
