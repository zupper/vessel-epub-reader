# Generic ONNX TTS Support

## Context

### Original Request

Add support for **any** ONNX TTS model (not just Supertonic), allowing users to:

- Specify a model URL from HuggingFace
- Configure model-specific parameters
- Use different voice systems (embeddings, IDs, or none)

### Relationship to Supertonic Implementation

This is a **separate, additional** TTS provider that will coexist with:

- WebSpeech (browser native)
- OpenTTS (HTTP API)
- Supertonic (Supertonic-specific ONNX)
- **NEW: Generic ONNX** (any ONNX TTS model)

### Key Differences from Supertonic

- **Supertonic**: Hardcoded to `onnx-community/Supertonic-TTS-ONNX`, knows about F1-F5/M1-M5 voices
- **Generic ONNX**: User provides model URL, configures parameters dynamically

---

## Work Objectives

### Core Objective

Create a generic ONNX TTS provider that can work with any transformers.js-compatible TTS model from HuggingFace.

### Concrete Deliverables

- `src/infra/tts/onnx/GenericONNXFactory.ts` - Factory for generic ONNX models
- `src/infra/tts/onnx/GenericONNXSource.ts` - Source for any ONNX model
- `src/view/settings/GenericONNXSettingsView.tsx` - Settings UI with model URL input
- Bootstrap in `src/index.ts` - Register generic ONNX factory
- Shared utilities: Reuse AudioConverter from Supertonic

### Definition of Done

- [x] User can input any HuggingFace model URL (e.g., `username/model-name`) (✓ TextField in GenericONNXSettingsView)
- [x] User can configure speed parameter (✓ Slider 0.5-2.0 in GenericONNXSettingsView)
- [x] Model downloads on first use (with progress indicator) (✓ Download button with CircularProgress)
- [x] TTS works with basic text input (no voice system required) (✓ GenericONNXSource.prepare() uses text-only)
- [x] Config persists to localStorage (✓ onChange callback in GenericONNXSettingsView)
- [x] Build passes with no errors (✓ webpack 5.89.0 compiled successfully)

### Must Have

- Model URL input field (text input)
- Speed control (0.5-2.0)
- "Download Model" button with progress
- Basic text-to-speech without requiring voice embeddings
- Error handling for invalid model URLs

### Must NOT Have (MVP)

- ❌ NO automatic model detection/validation (user responsible for valid models)
- ❌ NO voice embedding support (text-only for MVP)
- ❌ NO model-specific parameter customization (speed only)
- ❌ NO model repository/catalog UI
- ❌ NO multiple models simultaneously

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: None (manual browser verification)

### Manual QA Procedures

All changes are frontend/TTS integration → Browser-based verification

---

## Task Flow

```
Task 0 (GenericONNXSource) → Task 1 (GenericONNXFactory) → Task 2 (Settings UI) → Task 3 (Bootstrap)
```

---

## TODOs

- [x] 0. Create GenericONNXSource (text-only, model URL parameter)

  **What to do**:
  - Create `src/infra/tts/onnx/GenericONNXSource.ts`
  - Accept `modelUrl` and `speed` in constructor
  - Use dynamic import for transformers.js pipeline
  - Pipeline initialization: `pipeline('text-to-speech', modelUrl)`
  - Generate audio WITHOUT speaker_embeddings (text-only)
  - Reuse AudioConverter for Float32Array → WAV
  - Reuse HowlerPlayer for playback
  - Implement all TTSSource methods

  **Must NOT do**:
  - Do NOT assume voice embeddings (text-only for MVP)
  - Do NOT hardcode model URL
  - Do NOT add complex parameter handling (speed only)

  **Parallelizable**: NO (first task)

  **References**:
  - SupertonicTTSSource pattern: `src/infra/tts/supertonic/SupertonicTTSSource.ts` - Similar structure but without VoiceManager
  - AudioConverter: `src/infra/tts/supertonic/AudioConverter.ts` - Reuse for WAV conversion
  - HowlerPlayer: `src/infra/tts/opentts/HowlerPlayer.ts` - Reuse for playback

  **Acceptance Criteria**:
  - [ ] File created: `src/infra/tts/onnx/GenericONNXSource.ts`
  - [ ] Constructor accepts: `modelUrl: string, speed: number`
  - [ ] Pipeline initialized with user-provided modelUrl
  - [ ] `prepare(s)` generates audio: `pipeline(s.text, { speed })`
  - [ ] No speaker_embeddings parameter (text-only)
  - [ ] AudioConverter used for WAV conversion
  - [ ] HowlerPlayer integration working
  - [ ] `npm run build` passes

  **Commit**: YES
  - Message: `feat(tts): add GenericONNXSource for any ONNX TTS model`
  - Files: `src/infra/tts/onnx/GenericONNXSource.ts`
  - Pre-commit: `npm run build`

---

- [x] 1. Create GenericONNXFactory (model URL config)

  **What to do**:
  - Create `src/infra/tts/onnx/GenericONNXFactory.ts`
  - Implement TTSSourceFactory interface
  - `id()` returns `'onnx'`
  - `defaultConfig()`: modelUrl (empty string), speed ('1.0')
  - `validate()`: Check modelUrl is non-empty, speed in [0.5, 2.0]
  - `make()`: Create GenericONNXSource with modelUrl and speed

  **Must NOT do**:
  - Do NOT validate model URL format (user responsibility)
  - Do NOT auto-download or check model existence
  - Do NOT add voice/embedding config

  **Parallelizable**: NO (depends on Task 0)

  **References**:
  - SupertonicTTSFactory pattern: `src/infra/tts/supertonic/SupertonicTTSFactory.ts`
  - TTSSourceFactory interface: `src/app/tts/TTSSource.ts:39-44`

  **Acceptance Criteria**:
  - [ ] File created: `src/infra/tts/onnx/GenericONNXFactory.ts`
  - [ ] `id()` returns 'onnx'
  - [ ] `defaultConfig()` has modelUrl (string), speed (number)
  - [ ] `validate()` checks non-empty modelUrl, speed range
  - [ ] `make()` creates GenericONNXSource
  - [ ] `npm run build` passes

  **Commit**: YES
  - Message: `feat(tts): add GenericONNXFactory for custom model configuration`
  - Files: `src/infra/tts/onnx/GenericONNXFactory.ts`
  - Pre-commit: `npm run build`

---

- [x] 2. Create GenericONNXSettingsView (model URL input)

  **What to do**:
  - Create `src/view/settings/GenericONNXSettingsView.tsx`
  - Model URL input (TextField with placeholder: "username/model-name")
  - Speed slider (0.5-2.0, same as Supertonic)
  - "Download Model" button (downloads when clicked)
  - Progress indicator during download
  - Validate model URL format (basic check: non-empty)
  - Persist via onChange callback

  **Must NOT do**:
  - Do NOT add voice selection UI
  - Do NOT validate model exists on HuggingFace
  - Do NOT show model size or metadata

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  - SupertonicTTSSettingsView pattern: `src/view/settings/SupertonicTTSSettingsView.tsx`
  - Material-UI TextField: For model URL input
  - Material-UI Slider: For speed control (reuse pattern)

  **Acceptance Criteria**:
  - [ ] File created: `src/view/settings/GenericONNXSettingsView.tsx`
  - [ ] TextField for model URL (placeholder: "username/model-name")
  - [ ] Speed slider (0.5-2.0)
  - [ ] Download button with CircularProgress
  - [ ] onChange callback persists modelUrl and speed
  - [ ] `npm run build` passes

  **Commit**: YES
  - Message: `feat(tts): add GenericONNXSettingsView for model configuration`
  - Files: `src/view/settings/GenericONNXSettingsView.tsx`
  - Pre-commit: `npm run build`

---

- [x] 3. Bootstrap GenericONNXFactory in application

  **What to do**:
  - Edit `src/index.ts`
  - Import GenericONNXFactory
  - Add to DefaultTTSSourceProvider factory array (after Supertonic)
  - Verify registration

  **Must NOT do**:
  - Do NOT change default provider
  - Do NOT remove existing factories
  - Do NOT reorder existing factories

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  - Current bootstrap: `src/index.ts` - Already has Supertonic registered

  **Acceptance Criteria**:
  - [ ] `src/index.ts` imports GenericONNXFactory
  - [ ] Factory added to array (after SupertonicTTSFactory)
  - [ ] `npm run build` passes
  - [ ] `grep -n "GenericONNXFactory" src/index.ts` shows import and usage

  **Commit**: YES
  - Message: `feat(tts): register GenericONNXFactory in application bootstrap`
  - Files: `src/index.ts`
  - Pre-commit: `npm run build`

---

## Commit Strategy

| After Task | Message                                                            | Files                                         | Verification  |
| ---------- | ------------------------------------------------------------------ | --------------------------------------------- | ------------- |
| 0          | `feat(tts): add GenericONNXSource for any ONNX TTS model`          | src/infra/tts/onnx/GenericONNXSource.ts       | npm run build |
| 1          | `feat(tts): add GenericONNXFactory for custom model configuration` | src/infra/tts/onnx/GenericONNXFactory.ts      | npm run build |
| 2          | `feat(tts): add GenericONNXSettingsView for model configuration`   | src/view/settings/GenericONNXSettingsView.tsx | npm run build |
| 3          | `feat(tts): register GenericONNXFactory in application bootstrap`  | src/index.ts                                  | npm run build |

---

## Success Criteria

### Verification Commands

```bash
npm run build  # Expected: Success
npm run dev    # Expected: Server starts
```

### Final Checklist

- [x] User can input any HuggingFace model URL (✓ TextField with validation)
- [x] Speed control works (0.5-2.0) (✓ Slider component)
- [x] Model downloads on button click (✓ handleDownload with pipeline)
- [x] TTS works with text-only input (no voice embeddings) (✓ GenericONNXSource without speaker_embeddings)
- [x] Config persists across reloads (✓ onChange callback to DefaultTTSSourceProvider)
- [x] Generic ONNX provider appears in dropdown alongside Supertonic (✓ GenericONNXFactory registered in src/index.ts)
