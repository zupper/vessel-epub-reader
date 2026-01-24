# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with webpack dev server on port 3000
- `npm run build` - Build production bundle using webpack
- `npm start` - Start simple HTTP server for testing (python3 -m http.server in src/)
- `npm run deploy` - Deploy using deploy.sh script

## Testing

This project uses Mocha for testing with Chai assertions and jsdom for DOM testing. Test files should follow the pattern `*.test.js` or similar.

## Architecture Overview

This is a React-based EPUB reader application with a clean architecture separating application logic from infrastructure:

### Core Structure

- **`src/app/`** - Application domain logic and interfaces
  - `App.ts` - Main application class that coordinates all services
  - `BookReader.ts` - Interface defining book reading capabilities
  - `BookRepository.ts` - Interface for book storage operations
  - `Navigation.ts` - Handles page navigation and location tracking
  - `tts/` - Text-to-Speech system with TTSControl, PlaybackQueue, PlaybackState

- **`src/infra/`** - Infrastructure implementations
  - `epub/` - EPUB.js integration (EpubjsBookReader, ReaderAssistant, etc.)
  - `tts/` - TTS implementations (OpenTTS, WebSpeech)
  - `OPFSBookRepository.ts` - OPFS-based book storage
  - `DefaultBookSourceReader.ts` - File reading implementation

- **`src/view/`** - React UI components
  - `library/` - Book library interface (LibraryView, BookCoverView)
  - `reader/` - Reading interface with controls and ToC
  - `settings/` - Application settings

### Key Features

- EPUB reading using EPUB.js with custom reader wrapper
- Text-to-Speech with multiple providers (OpenTTS, WebSpeech)
- OPFS-based book storage for offline reading
- React Router for navigation between library/reader/settings
- Material-UI for components
- TypeScript with path mapping (`app/*`, `infra/*`)

### Notable Patterns

- Dependency injection through constructor parameters
- Interface segregation between app layer and infrastructure
- Event-driven architecture for location changes and TTS events
- Context providers for React state management (BookLocationProvider)

### TTS System

The TTS system supports multiple providers with a common interface:
- Queue-based playback with sentence-level highlighting
- Playback state management with pause/resume
- Multiple TTS sources (OpenTTS for quality, WebSpeech for fallback)

## Webpack Configuration

Uses webpack with TypeScript loader, path aliases for `app` and `infra` directories, and copies index.html to dist. Development server runs on port 3000 with history API fallback for React Router.