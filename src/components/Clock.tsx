import React, { useState, useEffect } from 'react'
import { getCurrentDateTime } from '../utils/timeUtils'

export const Clock: React.FC = () => {
  const [dateTime, setDateTime] = useState<string>(getCurrentDateTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(getCurrentDateTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-xs md:text-sm text-gray-600 font-mono whitespace-pre-line text-center">
      {dateTime}
    </div>
  )
}

