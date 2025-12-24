import React from 'react'

interface ErrorWarningIconProps {
  className?: string
}

export const ErrorWarningIcon: React.FC<ErrorWarningIconProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" stroke="#fb3748" strokeWidth="1.5" fill="none"/>
        <path 
          d="M8 5V8" 
          stroke="#fb3748" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <circle cx="8" cy="10.5" r="0.75" fill="#fb3748"/>
      </svg>
    </div>
  )
}

