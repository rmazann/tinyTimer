# Icon Files

This directory contains the PWA icon files.

## Current Status

- `icon.svg` - SVG source file (ready to use)
- `icon.png`, `icon-192.png`, `icon-512.png` - Placeholder files (need to be generated)

## Generating PNG Icons

Before building the project, you need to convert the SVG to PNG formats:

### Option 1: Using ImageMagick (if installed)
```bash
convert -background none -resize 512x512 src/images/icon.svg src/images/icon.png
convert -background none -resize 192x192 src/images/icon.svg src/images/icon-192.png
convert -background none -resize 512x512 src/images/icon.svg src/images/icon-512.png
```

### Option 2: Using Online Tools
1. Use an online SVG to PNG converter (e.g., CloudConvert, Convertio)
2. Upload `icon.svg`
3. Generate:
   - 512x512 PNG → save as `icon.png` and `icon-512.png`
   - 192x192 PNG → save as `icon-192.png`

### Option 3: Using Node.js (sharp)
If you have `sharp` installed:
```bash
npx sharp -i src/images/icon.svg -o src/images/icon.png resize 512
npx sharp -i src/images/icon.svg -o src/images/icon-192.png resize 192
npx sharp -i src/images/icon.svg -o src/images/icon-512.png resize 512
```

The icons are required for PWA functionality. The build will fail if these PNG files don't exist.

