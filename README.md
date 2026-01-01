# Terra Media Player 🎵🎬

A premium offline media player for Android built with React Native and Expo.

## Features

### Audio Player
- 🎵 Full audio playback with background support
- 🔀 Shuffle & repeat modes (off, all, one)
- ⏩ Variable playback speed (0.5x - 2.0x)
- 📱 Mini player with quick controls
- ❤️ Favorites system
- 📋 Playlist management
- 📊 Play history tracking

### Video Player
- 🎬 Native video playback with expo-video
- 🖥️ Fullscreen support
- ⏪⏩ Gesture controls (seek, volume)
- 📍 Resume from last position
- 🔖 Favorites and watch history

### Library Management
- 📂 Automatic media scanning
- 🔍 Search across all media
- 📁 Folder-based browsing
- 🏷️ Filter by albums, artists, genres
- ↕️ Multiple sort options

### Design
- 🌙 Premium dark theme
- 💎 Material Design inspired UI
- ⚡ Smooth animations
- 📱 Optimized for Android

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **State Management**: Redux Toolkit
- **Database**: expo-sqlite (SQLite)
- **Audio**: expo-av with background support
- **Video**: expo-video
- **Navigation**: React Navigation 7
- **Language**: TypeScript

## Project Structure

```
Terra/
├── App.tsx                 # Main entry point
├── src/
│   ├── components/        # UI components
│   │   ├── AudioPlayer/   # Audio player components
│   │   ├── Library/       # Library list items
│   │   ├── Modals/        # Modal components
│   │   └── UI/            # Common UI components
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   ├── services/          # Business logic services
│   ├── store/             # Redux store and slices
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- EAS CLI (for building)

### Installation

1. Install dependencies:
```bash
cd Terra
npm install
```

2. Start development server:
```bash
npx expo start
```

3. Run on Android device/emulator:
```bash
npx expo run:android
```

### Building for Production

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to Expo:
```bash
eas login
```

3. Build APK:
```bash
eas build -p android --profile preview
```

4. Build AAB for Play Store:
```bash
eas build -p android --profile production
```

## Configuration

### Permissions

The app requires the following Android permissions:
- `READ_EXTERNAL_STORAGE` - Access media files
- `READ_MEDIA_AUDIO` - Android 13+ audio access
- `READ_MEDIA_VIDEO` - Android 13+ video access
- `WAKE_LOCK` - Background playback

### Settings

Access settings through the Settings tab:
- **Library**: Auto-scan, hidden files, sort options
- **Audio**: Resume playback, gapless, album art
- **Video**: Auto-rotate, gestures, resume
- **Appearance**: Theme, mini player, animations

## Screens

1. **Audio Library** - Browse and play music
2. **Video Library** - Browse and watch videos
3. **Now Playing** - Full audio player with controls
4. **Favorites** - View favorite songs and videos
5. **Settings** - App configuration

## License

MIT License - See LICENSE file for details.

## Credits

Built with ❤️ using:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Navigation](https://reactnavigation.org)
