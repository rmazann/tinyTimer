import React from 'react'

interface MailCheckIconProps {
  className?: string
}

export const MailCheckIcon: React.FC<MailCheckIconProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M4 7L12 12L20 7" 
          stroke="#525866" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M4 17H20V7H4V17Z" 
          stroke="#525866" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M16 13L18 15L22 11" 
          stroke="#525866" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

