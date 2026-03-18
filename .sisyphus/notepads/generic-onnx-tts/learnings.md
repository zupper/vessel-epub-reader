# Learnings - Generic ONNX TTS

## Session Start: 2026-01-24T20:12:01.050Z

### Context

Adding generic ONNX TTS provider alongside existing Supertonic implementation.

- Supertonic: Hardcoded model, voice embeddings
- Generic ONNX: User-provided model URL, text-only

### Tasks

0. GenericONNXSource
1. GenericONNXFactory
2. GenericONNXSettingsView
3. Bootstrap registration

## Implementation Complete

### Tasks Completed
- [x] Task 0: GenericONNXSource.ts (75 lines) - text-only ONNX TTS
- [x] Task 1: GenericONNXFactory.ts (48 lines) - factory with modelUrl config
- [x] Task 2: GenericONNXSettingsView.tsx (113 lines) - model URL input UI
- [x] Task 3: Bootstrap in src/index.ts - registered after Supertonic

### Key Implementation Details
- Package: @huggingface/transformers@3.8.1 (NOT @xenova/transformers)
- Model URL: User-provided (e.g., "username/model-name")
- Voice system: None (text-only, no speaker_embeddings)
- Speed control: 0.5-2.0 (same as Supertonic)
- Reuses: AudioConverter, HowlerPlayer from Supertonic

### Build Status
- Build: SUCCESS (webpack 5.89.0 compiled with 1 warning)
- TypeScript: No errors
- Total code: 236 lines (3 new files + 1 modified)

### TTS Providers Now Available
1. WebSpeech (browser native)
2. OpenTTS (HTTP API)
3. Supertonic (Supertonic-specific ONNX with voice embeddings)
4. Generic ONNX (any HuggingFace ONNX TTS model, text-only)
