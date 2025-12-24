import React from 'react'

interface ContentDividerProps {
  className?: string
  editText?: string
  type?: 'Line' | 'Line Spacing' | 'Text & Line Divider' | 'Text Divider' | 'Solid Text Divider' | 'Icon Button' | 'Icon Button Group' | 'Text Button' | 'Text Button Group'
}

export const ContentDivider: React.FC<ContentDividerProps> = ({ 
  className = '', 
  editText = 'OR', 
  type = 'Line' 
}) => {
  if (type === 'Text & Line Divider') {
    return (
      <div className={`flex items-center justify-center gap-2.5 w-full ${className}`}>
        <div className="flex-1 h-px bg-[#e1e4ea]"></div>
        <p className="font-medium text-[11px] leading-[12px] text-[#99a0ae] uppercase tracking-[0.22px] whitespace-nowrap shrink-0">
          {editText}
        </p>
        <div className="flex-1 h-px bg-[#e1e4ea]"></div>
      </div>
    )
  }
  
  if (type === 'Line Spacing') {
    return (
      <div className={`flex-1 h-px bg-[#e1e4ea] ${className}`}></div>
    )
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-px bg-[#e1e4ea]"></div>
    </div>
  )
}

