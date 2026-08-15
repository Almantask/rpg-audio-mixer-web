# Changelog

All notable changes to the **Arcanum Audio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-15

### Added

- **Active Scene Mixing Desk**:
  - Multi-track ambience mixing with independent category faders and real-time gain adjustment.
  - Per-category mute toggles and track playback status indicators.
  - Master controls featuring cubic perceived loudness curves, single-click global master mute, and d20 random track trigger.
  - In-session scene notes scratchpad and persistent audio state across page navigation.

- **3-Tier Dynamic Intensity System**:
  - Seamless Web Audio crossfading (~2s transitions) between intensity tiers (**I · Calm**, **II · Tension**, **III · Climax**) without clicks, pops, or stutter.
  - Automatic voice handoffs and gain curves across intensity pools.

- **Low-Latency Soundboard**:
  - Overlapping one-shot and short audio FX playback.
  - Rapid retriggering with polyphonic audio voice instances.
  - Soundboard master volume control and drag-and-drop / manual tile reordering.

- **Audio Library & Import Hub**:
  - Category Composer for assembling layered soundscape categories mapped across intensity levels I–III.
  - Local audio file importing (`.mp3`, `.wav`, `.ogg`, `.flac`).
  - Direct **YouTube & YouTube Playlist import** with automatic metadata extraction, intensity tier assignment, and live Web Audio streaming playback.
  - FX library with search, filtering, and inline audition previews.

- **Campaign & Session Workflow**:
  - Campaign management with CRUD operations and active campaign designation.
  - Session management for organizing game prep and linking scenes.
  - Scene catalog with custom scene builder, tagging, and one-click scene cloning.
  - Direct scene launch into the live Active Scene mixer desk.

- **Safety & Trash Recovery**:
  - Soft-delete protection for campaigns, sessions, scenes, and library items.
  - Trash bin with search, multi-selection, one-click restoration, and permanent purge options.

- **Home Hub & Shell**:
  - Active campaign hero card for instant session resume.
  - Top soundscapes and top FX stat previews.
  - Responsive dark-fantasy UI with fluid sidebar navigation.

- **Attributions & Legal**:
  - Attributions directory for public domain and Creative Commons audio credits.
  - Creator support links (*Buy Me a Coffee*) and community review portals.
  - App version (v0.1.0) and copyright footer.

- **Testing & Quality Infrastructure**:
  - Cucumber Gherkin feature specifications across 10 functional domains.
  - Playwright BDD acceptance test suite (`playwright-bdd`).
  - Vitest unit & component test suite with Testing Library.
  - GitHub Actions CI/CD workflows for Quality Gate, automated test execution, and GitHub Pages deployment.
