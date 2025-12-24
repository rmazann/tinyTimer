/**
 * Format seconds into MM:SS or Xh MM:SS format
 * If 60 minutes or more, shows as "Xh MM:SS"
 * Otherwise shows as "MM:SS"
 */
export function formatTime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  // If 60 minutes or more, use hour format
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Otherwise use MM:SS format
  return `${totalMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Parse time string to seconds
 * Supports:
 * - MM:SS format (e.g., "25:00")
 * - Xh MMm SSs format (e.g., "1h 01m 59s")
 * - Raw digits (e.g., "2500" -> 25:00)
 */
export function parseTimeToSeconds(timeString: string): number {
  if (!timeString) return 0
  
  // Check if format includes "h" (hour format) - supports h, m, s labels
  // Match pattern like "1h 01m 59s" or "1h 01 59"
  const hourMatch = timeString.match(/(\d+)\s*h\s*(\d+)\s*[m]?\s*(\d+)\s*[s]?/i)
  if (hourMatch) {
    const hours = parseInt(hourMatch[1] || '0', 10) || 0
    const minutes = parseInt(hourMatch[2] || '0', 10) || 0
    const seconds = parseInt(hourMatch[3] || '0', 10) || 0
    return hours * 3600 + minutes * 60 + seconds
  }
  
  // Remove all non-digit characters except colon for MM:SS format
  const cleaned = timeString.replace(/[^\d:]/g, '')
  
  // If no colon, try to parse as MMMSS format (e.g., "2500" -> 25:00)
  if (!cleaned.includes(':')) {
    const digits = cleaned.slice(-4).padStart(4, '0') // Take last 4 digits, pad with zeros
    const minutes = parseInt(digits.slice(0, 2), 10) || 0
    const seconds = parseInt(digits.slice(2, 4), 10) || 0
    return minutes * 60 + seconds
  }
  
  // Parse MM:SS format
  const parts = cleaned.split(':')
  const minutes = parseInt(parts[0] || '0', 10) || 0
  const seconds = parseInt(parts[1] || '0', 10) || 0
  
  return minutes * 60 + seconds
}

/**
 * Get current date and time in UTC+1 timezone
 */
export function getCurrentDateTime(): string {
  const now = new Date()
  // Convert to UTC+1 (CET/CEST)
  const utc1 = new Date(now.getTime() + (1 * 60 * 60 * 1000))
  
  const date = utc1.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  
  const time = utc1.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  
  return `${date}\n${time}\nUTC+1`
}

