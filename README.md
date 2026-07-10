# Arcanum Audio 🎲

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Almantask_rpg-audio-mixer&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Almantask_rpg-audio-mixer)
[![Unit Test Coverage](https://sonarcloud.io/api/project_badges/measure?project=Almantask_rpg-audio-mixer&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Almantask_rpg-audio-mixer)
[![Mutation Score](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Almantask/86821e2fbcd0e4d114e67bc5de331722/raw/mutation-score-badge.json)](https://github.com/Almantask/rpg-audio-mixer/actions/workflows/mutation-testing.yml)
[![Unit Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/Almantask/86821e2fbcd0e4d114e67bc5de331722/raw/unit-tests-badge.json)](https://github.com/Almantask/rpg-audio-mixer/actions/workflows/ci.yml)
[![Acceptance Tests](https://img.shields.io/badge/Acceptance%20Tests-12%20passed-success)](app/src/androidTest/assets/features/)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Almantask_rpg-audio-mixer&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Almantask_rpg-audio-mixer)
[![Current Iteration](https://img.shields.io/badge/Iteration-1%20Completed-blue)](plans/plan.md)
[![Views](https://komarev.com/ghpvc/?username=Almantask&repo=rpg-audio-mixer&color=green&style=flat-square)](https://github.com/Almantask/rpg-audio-mixer)

**Arcanum Audio** is a premium RPG ambience and sound-mixing application designed specifically for Dungeon Masters and tabletop storytellers. It enables GMs to bring their worlds to life through a sophisticated audio engine capable of layering loopable soundscapes with low-latency soundboard effects.

## Core Features
- **Layered Soundscapes:** Compose complex atmospheres by mixing multiple loopable audio categories (Weather, Interior, Monsters, etc.).
- **Dynamic Intensity:** Seamlessly transition between three levels of intensity (I, II, III) for any soundscape category with automatic 2-second crossfades.
- **Low-Latency Soundboard:** Trigger one-shot sound effects (FX) that overlap perfectly with background ambience.
- **Smart Mixing:** Real-time control over Master Atmosphere and per-category MIX volumes using a cubic power curve for natural-sounding fades.
- **Campaign Management:** Organize your sessions into Campaigns and Sessions with full support for soft-deletion and recovery via the "Vault of Echoes."
- **Home Dashboard:** Quickly resume your last session or scene with one tap from a personalized landing page.

## Technical Foundation
- **Modern Android Stack:** Built with 100% Kotlin and Jetpack Compose.
- **Audio Engine:** Powered by Media3 (ExoPlayer) for soundscapes and SoundPool for high-performance FX triggers.
- **Architecture:** Clean Architecture with MVVM, Hilt for Dependency Injection, and Coroutines/Flow for reactive state.
- **Persistence:** Local storage managed by Room with automated cleanup and soft-delete recovery logic.
- **QA Rigor:** Comprehensive BDD coverage using Cucumber and Espresso, verified on real audio hardware in CI.

---

## Contributing
Curious how to contribute? Refer to the [implementation plan](plans/plan.md) - the next non-completed iteration is the best place to start.

---

## Developer Guide

The Arcanum Audio repository uses an AI-augmented team of specialized "Agents" (or Skills) to enforce architecture, quality, and Behavior-Driven Development (BDD). Whether you are developing manually or orchestrating the AI Agents, here is how to work with the project.

### Running Locally

Requirements: 
- JDK 17
- Android Studio Ladybug or later
- KVM / Hardware acceleration enabled (for local emulator testing)

```bash
# Build the application
./gradlew assembleDebug

# Run static analysis (Detekt)
./gradlew detekt

# Run all Unit Tests with Coverage
./gradlew testDebugUnitTest createDebugUnitTestCoverageReport
```

### Testing (BDD Automation)

We use Cucumber for Android to power our acceptance tests. The tests run against the real production stack (Room, Hilt, Compose) with only external dependencies faked.

```bash
# Run all Acceptance Tests
./gradlew connectedDebugAndroidTest

# Run a specific Acceptance Test (Feature)
# Replace [feature_name] with a file from app/src/androidTest/assets/features/
./gradlew connectedDebugAndroidTest -PcucumberFeatures="features/[feature_name].feature"
```
**Note:** Make sure an Android Emulator is running and unlocked before executing connected tests.

### CI Acceptance Tests (manual trigger)

To run the acceptance-tests-only GitHub Actions pipeline from any branch:
1. Navigate to **Actions → Acceptance Tests (Manual) → Run workflow**.
2. Select your target branch, optionally set `cucumber_tags` (defaults to `@iter0 or @iter1`) or `cucumber_features` (e.g., `features/navigation_shell.feature`).
3. Click **Run workflow**. The job spins up an emulator, executes the suite, and publishes results plus artifacts.

CLI alternative (requires `gh`):
```bash
gh workflow run acceptance-tests.yml --ref <branch> -f cucumber_tags="@iter0 or @iter1" -f cucumber_features="features/navigation_shell.feature"
```

### Agentic Development Workflow

Arcanum uses a 4-step orchestration process implemented by distinct AI "personas." You can utilize these personas via either **GitHub Copilot CLI/Agents** or the **Gemini Assistant**.

The available roles are located in:
- `.github/agents/` (for GitHub Copilot)
- `.agents/skills/` (for Gemini Assistant)

#### Available Agents

1. **`product-owner`**: Gatekeeper of User Experience. Defines Acceptance Criteria (AC) and feature boundaries.
2. **`product-designer`**: Shapes UX flows, material components, and screen layouts.
3. **`android-developer`**: Implements production code via strict **Red → Green → Refactor** TDD.
4. **`qa-tester`**: Generates Gherkin `.feature` specs and implement Compose/Espresso steps.
5. **`android-reviewer`**: Audits production architecture, performance, and Android deprecations.
6. **`qa-reviewer`**: Audits test architecture, BDD semantics, and coverage gaps.
7. **`audio-specialist`**: Dedicated engineer for ExoPlayer/SoundPool engine tuning.
8. **`devops-engineer`**: Owns Gradle config, CI/CD, and release engineering.
9. **`principal-po`**: Peer reviews specs, designs, and plans focusing on outcomes and strategic value.
10. **`principal-qa`**: Reviews feature files and asks the human questions about ambiguity and test optimization.
11. **`principal-engineer`**: Reviews implementation plans and asks the human strategic technical questions.

#### Orchestrating via Gemini (IDE Extension)

**The Preferred Way (Automated Workflow)**
Use orchestration **skills** via slash commands — they delegate to specialist subagents; specialists do not reference each other.

| Skill | Command | Purpose |
|---|---|---|
| `plan-feature` | `/plan-feature` | Requirements → design → Gherkin → iteration plans |
| `refine-feature` | `/refine-feature` | Update existing specs, designs, and plans |
| `new-feature` | `/new-feature` | Implementation → validation → review → fixes |

**1. New Feature Delivery (`/new-feature`)**
Executes the 4-phase sequence: Implementation → Validation → Review Council → Fixes.
> `/new-feature Implement the new Master Volume slider defined in our project plan`

Consult `ai/skills/new-feature/SKILL.md` for phase details and subagent delegation.

**2. Plan Feature (`/plan-feature`)**
Moves a feature from high-level request to a detailed implementation plan with full technical and behavioral alignment.
> `/plan-feature Plan a new feature: Master Volume slider`

Consult `ai/skills/plan-feature/SKILL.md` for phase details and subagent delegation.

**3. Refine Feature (`/refine-feature`)**
Refines existing specs, designs, and implementation plans.
> `/refine-feature Refine the Master Volume slider UI to include a mute toggle`

Consult `ai/skills/refine-feature/SKILL.md` for phase details and subagent delegation.

---

## Assets & Branding (Not Open Source)

The Apache License 2.0 applies **only** to the source code contained in this repository.

The following are **not** licensed under Apache 2.0 and are **not open source**:

- Audio files and sound packs
- Preset mixes and curated content
- Icons, logos, artwork, and UI graphics
- Application name, branding, and store listing assets

These materials are proprietary and may not be redistributed, resold, or included in derivative works without explicit permission. Forks and derivative works must supply their own audio assets and branding.
