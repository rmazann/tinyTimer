# Vingt-Cinq - Pomodoro Timer

A minimalistic 25-minute Pomodoro timer web application, inspired by [vingtcinq.vercel.app](https://vingtcinq.vercel.app/).

## Features

- **25-Minute Countdown Timer** - Precise countdown from 25:00 to 00:00
- **Session Tracking** - Automatically tracks and displays session numbers
- **Play/Pause Control** - Toggle timer state
- **Reset Control** - Reset timer to 25:00
- **Current Date/Time Display** - Shows UTC+1 timezone with date
- **Minimalistic UI** - Clean, distraction-free design
- **PWA Support** - Works offline and can be installed as an app
- **Page Visibility Handling** - Automatically pauses when tab becomes inactive

## Technology Stack

- **Framework**: Gatsby 5.x (React-based Static Site Generator)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **PWA**: Workbox (via gatsby-plugin-manifest, gatsby-plugin-offline)
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate PWA icons (optional but recommended):
   - Convert `src/images/icon.svg` to PNG formats:
     - `src/images/icon.png` (512x512)
     - `src/images/icon-192.png` (192x192)
     - `src/images/icon-512.png` (512x512)
   - You can use online tools or ImageMagick:
     ```bash
     # Example with ImageMagick (if installed)
     convert -background none -resize 512x512 src/images/icon.svg src/images/icon.png
     convert -background none -resize 192x192 src/images/icon.svg src/images/icon-192.png
     convert -background none -resize 512x512 src/images/icon.svg src/images/icon-512.png
     ```

### Development

Start the development server:
```bash
npm run develop
```

The site will be available at `http://localhost:8000`

### Build

Build for production:
```bash
npm run build
```

Serve the production build locally:
```bash
npm run serve
```

### Clean

Remove cache and public directories:
```bash
npm run clean
```

## Project Structure

```
tinyTimer/
├── src/
│   ├── components/       # React components
│   │   ├── Timer.tsx     # Main timer countdown display
│   │   ├── Clock.tsx     # Current date/time display
│   │   ├── Controls.tsx  # Play/Pause/Reset buttons
│   │   └── SessionTracker.tsx  # Session counter
│   ├── hooks/
│   │   └── useTimer.ts   # Timer logic hook
│   ├── pages/
│   │   └── index.tsx     # Main page
│   ├── styles/
│   │   └── global.css    # Global styles + Tailwind
│   ├── utils/
│   │   └── timeUtils.ts  # Time formatting utilities
│   └── images/           # PWA icons
├── gatsby-config.ts      # Gatsby configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Gatsby and deploy

The site will be available at `https://your-project.vercel.app`

## Features Implementation Details

### Timer Precision
- Uses `Date.now()` to track elapsed time accurately
- Updates every 100ms for smooth display
- Avoids setInterval drift by calculating remaining time from target end time

### State Persistence
- Session count is stored in `localStorage`
- Persists across page refreshes
- Timer state resets on page reload (by design)

### Page Visibility
- Automatically pauses timer when browser tab becomes inactive
- Prevents timer from running in background

### Browser Tab Title
- Updates document title with remaining time
- Shows format: "MM:SS - Vingt-Cinq"

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- PWA features require HTTPS (or localhost for development)

## License

MIT

