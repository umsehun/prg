# 🎯 Pin Rhythm Game (PRG)

A modern desktop rhythm game built with Electron + Next.js that imports osu! beatmaps (.osz files) and plays them in a unique Knife Hit style gameplay.

## 🎮 Features

- **OSZ Import System**: Automatically imports and converts .osz files from osu!
- **Video Support**: Automatic video conversion to MP4 for consistent playback
- **Knife Hit Gameplay**: Unique pin-throwing mechanics with osu!-style timing
- **Modern UI**: Cyberpunk-themed interface with neon effects
- **Audio Engine**: Precise Web Audio API timing for rhythm accuracy
- **Chart Library**: Automatic chart discovery and management

## 🏗️ Architecture

- **Frontend**: Next.js + React + Tailwind CSS
- **Backend**: Electron Main Process + Node.js
- **State Management**: Zustand
- **Audio**: Web Audio API with precise timing
- **Video**: FFmpeg conversion pipeline
- **Chart Parsing**: osu-parsers for .osu file processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- FFmpeg (for video conversion)

### Installation

```bash
# Install dependencies
pnpm install

# Build the main process
pnpm build:main

# Start development server
pnpm dev
```

### Adding Charts

1. Place .osz files in `public/assets/[folder-name]/`
2. The app will automatically import them on startup
3. Charts appear in the Select Scene

### Controls

- **Space**: Throw pin during gameplay
- **S**: Alternative throw key
- **Escape**: Pause/unpause game

## 📁 Project Structure

```
src/
├── main/           # Electron main process
│   ├── core/       # App initialization, window management
│   ├── game/       # Game logic, controllers
│   └── services/   # Chart import, video conversion
├── renderer/       # Next.js frontend
│   ├── app/        # Next.js app router
│   ├── components/ # React components
│   ├── lib/        # Audio service, utilities
│   └── store/      # Zustand state management
├── shared/         # Shared types and utilities
└── preload/        # IPC bridge (security layer)
```

## 🎵 Supported Formats

- **Charts**: .osz (osu! beatmaps)
- **Audio**: .mp3, .ogg
- **Video**: .mp4, .avi, .flv, .mov, .webm (auto-converted to MP4)
- **Images**: .png, .jpg (banners/backgrounds)

## 🔧 Development

```bash
# Build main process
pnpm build:main

# Build renderer (Next.js)
pnpm build

# Start development with hot reload
pnpm dev

# Package for distribution
pnpm build && electron .
```

## 🎯 Game Mechanics

- **Timing Windows**: KOOL (50ms), COOL (100ms), GOOD (200ms), MISS (300ms)
- **Scoring**: KOOL (1000pts), COOL (500pts), GOOD (200pts), MISS (0pts)
- **Combo System**: Multiplier increases every 10 combo
- **Visual Feedback**: osu!-style approach circles with knife physics

## 🛠️ Technical Details

- **IPC Security**: Contextual isolation with preload script
- **Video Processing**: FFmpeg pipeline for format standardization
- **Chart Caching**: Persistent library with duplicate detection
- **Audio Precision**: Web Audio API for sub-millisecond timing
- **Memory Management**: Efficient asset loading and cleanup

## 📝 License

This project is for educational purposes. osu! is a trademark of ppy Pty Ltd.
# prg
