import React, { useRef, useEffect, useState } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 4, 
  value, 
  onChange, 
  disabled = false,
  hasError = false
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0] && value.length === 0) {
      inputRefs.current[0]?.focus()
    }
  }, [])

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/\D/g, '').slice(0, 1)
    
    if (digit) {
      const newCode = value.split('')
      newCode[index] = digit
      const updatedCode = newCode.join('').slice(0, length)
      onChange(updatedCode)
      
      // Move to next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
      }
    } else {
      // Handle backspace
      const newCode = value.split('')
      newCode[index] = ''
      onChange(newCode.join(''))
      
      // Move to previous input
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      // Focus the last filled input or the last input
      const focusIndex = Math.min(pastedData.length - 1, length - 1)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  return (
    <div className="flex items-start justify-center w-full" style={{ gap: '10px' }}>
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className={`flex-1 bg-white border rounded-[10px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] flex items-center justify-center ${
            hasError
              ? 'border-[#fb3748]'
              : focusedIndex === index 
                ? 'border-[#0e121b]' 
                : 'border-[#e1e4ea]'
          }`}
          style={{ padding: '16px 8px' }}
        >
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none text-center font-medium text-[#0e121b] focus:outline-none"
            style={{ 
              fontFamily: "'Inter Display', 'Inter', sans-serif",
              fontSize: '24px',
              lineHeight: '32px'
            }}
          />
        </div>
      ))}
    </div>
  )
}

