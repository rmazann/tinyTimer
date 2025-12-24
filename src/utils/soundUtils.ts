/**
 * Plays the notification sound when timer completes
 * Uses the notification-sound.mp3 file from static/app_sounds/
 */
export const playCompletionSound = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Use the MP3 file from static/app_sounds/
    // In Gatsby, static files are served from the root, so the path is /app_sounds/notification-sound.mp3
    const audio = new Audio('/app_sounds/notification-sound.mp3')
    
    // Set volume (0.0 to 1.0)
    audio.volume = 0.7
    
    // Play the sound
    const playPromise = audio.play()
    
    // Handle promise rejection (e.g., autoplay policy)
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Silently fail if audio cannot be played (e.g., user interaction required)
        console.debug('Could not play completion sound:', error)
      })
    }
  } catch (error) {
    // Silently fail if audio cannot be played
    console.debug('Could not play completion sound:', error)
  }
}

