import React from 'react'

interface KeyIconProps {
  className?: string
}

export const KeyIcon: React.FC<KeyIconProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" 
          fill="currentColor"
        />
        <circle 
          cx="12" 
          cy="8" 
          r="2" 
          fill="white"
        />
        <path 
          d="M15.5 12.5L17.5 14.5L21 11L19 9L15.5 12.5Z" 
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

