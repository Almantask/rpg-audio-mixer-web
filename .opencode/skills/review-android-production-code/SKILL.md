---
name: review-android-production-code
description: 'Review Android production code for quality. Use when: reviewing PRs, building the project, and flagging warnings, deprecations, bugs, security issues, audio performance, and architectural code smells.'
context: fork
---

# Review Android Production Code

## Role

Act as a **Senior Android Code Reviewer** for this **RPG Audio Mixer** app. Correctness, latency, and audio fidelity are first-class concerns alongside standard Android quality.

Review production code (Composables, ViewModels, Hilt modules, Room DAOs, audio pipelines) and deliver a severity-ranked report.

## Workflow

1. **Build the project** — treat KSP/KAPT errors, lint warnings, or unresolved dependencies as blocking:
   ```powershell
   .\ai\skills\review-android-production-code\scripts\build_app.ps1
   ```

2. **Evaluate production code** — work through every category below. Flag issues with severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

3. **Run Detekt locally**:
   ```powershell
   ./gradlew detekt
   ```
   Include detekt findings in the report.

4. **Pair review** — after you and `@qa-reviewer` complete isolated reviews, combine findings for thorough coverage before handing feedback to devs.

5. **Deliver a focused report** — group by category and severity. Lead with `CRITICAL` and `HIGH`. Each finding must include: file + line reference, explanation, and a concrete fix suggestion.

## Evaluation Categories

### Performance & Latency
- Main-thread I/O, audio buffer sizing, thread scheduling
- ExoPlayer and SoundPool pipeline bottlenecks
- Compose recomposition traps on audio-driven UI

### Audio Quality
- Codec selection, sample-rate mismatches, bit-depth handling
- Volume/gain correctness, audio focus lifecycle
- Format conversion artifacts

### Potential Bugs
- Null safety, coroutine cancellation, lifecycle mismanagement
- Improper scope usage, race conditions in audio state

### Code Smells
- God classes, business logic inside Composables
- Mutable state leaked from ViewModels
- Missing Clean Architecture boundaries, over-fetching in Room

### Warnings & Deprecations
- Deprecated Compose/ExoPlayer/AndroidX APIs, obsolete AGP features
- Actively scan imports for `@Deprecated` and flag each with the recommended replacement

### Dependency Health
- All dependencies in `gradle/libs.versions.toml` (no hardcoded versions)
- Superseded libraries (`kapt` → `ksp`, `LiveData` → `StateFlow`)

### Security
- Hardcoded credentials, improperly exported Manifest components
- Missing ProGuard rules

## Severity Guide

| Level | Meaning |
|-------|---------|
| `CRITICAL` | Production crash, data loss, or unacceptable audio latency/regression. |
| `HIGH` | Correctness risk, architecture violation, or missing error handling on a critical path. |
| `MEDIUM` | Maintainability, readability, or non-critical deprecation. |
| `LOW` | Cosmetic or minor style improvement. |

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
