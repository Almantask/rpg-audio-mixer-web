# Arcanum Audio — Release v0.1.0

> **Arcanum Audio** is a modern, responsive web RPG ambience and audio workstation built specifically for tabletop Game Masters, Dungeon Masters, and storytellers. Mix layered loopable soundscapes with dynamic intensity crossfading, fire off low-latency soundboard effects, organize prep into campaigns and sessions, and import tracks directly from local audio or YouTube.

---

## 🌟 Highlights of v0.1.0

- 🎛️ **Active Scene Mixing Desk**: Full multi-track ambience mixer with independent category faders, mute controls, cubic perceived loudness curves, and persistent mix states.
- 🌊 **3-Tier Dynamic Intensity System**: Seamless Web Audio crossfading (~2s transitions) between intensity tiers (**I · Calm**, **II · Tension**, **III · Climax**) without pops or audio stuttering.
- ⚡ **Low-Latency Soundboard**: Real-time overlapping audio effects triggering (sword clashes, spells, ambient creaks) with instant re-triggering and dedicated soundboard gain.
- 🌐 **YouTube & Playlist Import**: Live YouTube video and playlist URL importing with automatic metadata parsing, dynamic intensity assignment, and live Web Audio streaming playback.
- 📁 **Campaigns & Sessions Workflow**: Hierarchical organization of campaigns, sessions, and scenes with instant-resume from the Home hub.
- 🎭 **Scene Studio & Cloning**: Create reusable scenes, clone existing ones for quick variations, and link scenes directly to campaign sessions.
- 🛡️ **Trash & Recovery Engine**: Soft deletion across campaigns, sessions, and scenes with multi-select restoration and permanent purge controls.
- 🧪 **Enterprise BDD & Test Coverage**: 100% type-checked TypeScript, Vitest unit suite, and Cucumber Gherkin + Playwright acceptance suites spanning 10 domain feature areas.

---

## 🚀 Detailed Feature Breakdown

### 1. 🎛️ Active Scene Mixer Desk & Web Audio Engine
- **Multi-Track Simultaneous Mixing**: Layer multiple soundscape categories (e.g. *Dungeon Atmosphere*, *Rainfall*, *Tavern Chatter*, *Eerie Winds*) concurrently with independent volume sliders.
- **Dynamic Intensity Crossfading**: Switch between Intensity Level I, II, and III with smooth ~2s audio gain ramps powered by the Web Audio API.
- **Master Audio Console**: Global master volume fader with cubic volume curves matching human hearing perception, single-click master mute, and d20 random track trigger.
- **Live Session Scratchpad**: Built-in scene notes editor to jot down DM notes, battle reminders, and narrative triggers while mixing.
- **Mixer State Persistence**: Sound state and active selections persist smoothly across internal app navigation.

### 2. ⚡ Overlapping Soundboard
- **Instant Effect Triggering**: Play one-shot and short audio FX on top of running soundscapes without interruption.
- **Overlapping & Retriggering**: Rapidly fire repeated sounds (e.g. multiple sword strikes or spell casts) with independent playback voices.
- **Soundboard Management**: Dedicated soundboard master volume control, visual playing indicators, and custom drag-and-drop / manual reordering.

### 3. 🌐 Audio Library & YouTube Import Hub
- **Soundscape Category Composer**: Visual builder to organize audio files into categorized playlists mapped across Intensity levels I, II, and III.
- **Local Audio Support**: Import `.mp3`, `.wav`, `.ogg`, and `.flac` files directly into your sound library.
- **YouTube Video & Playlist Integration**:
  - Paste any YouTube video or playlist URL.
  - Automatic extraction and resolution of titles and tracks.
  - Multi-track intensity mapping and direct live audio streaming without needing local audio stubs.
- **FX Catalog**: Filter, search, tag, and audition soundboard effects before assigning them to scenes.

### 4. 🏰 Campaign, Session & Scene Management
- **Campaign Hierarchy**: Full CRUD operations for tabletop campaigns with quick-launch active status.
- **Session Tracking**: Break campaigns down into numbered or themed game sessions.
- **Reusable Scene Linking**: Build scenes independently and link, unlink, or import them across multiple sessions.
- **Scene Cloning**: One-click duplicate for scenes to quickly create night/day or combat/exploration variants.

### 5. 🛡️ Trash Bin & Soft-Delete Protection
- **Safe Deletion**: Deleting campaigns, sessions, scenes, or library items routes them to Trash instead of immediate data loss.
- **Bulk Recovery**: Filter and select individual or all items in Trash with instant restoration or permanent purging.

### 6. 🏠 Home Hub & Navigation
- **Active Campaign Hero**: Instant one-click resume of the currently active campaign and session.
- **Top Soundscapes & FX Stats**: At-a-glance stats and fast inline audio previewing directly from the dashboard.
- **Accessible Sidebar**: Dark-fantasy aesthetic with fluid responsive sidebar navigation and keyboard accessibility.

### 7. 📜 Credits, Attributions & Community
- **Attributions Directory**: Transparent attribution directory detailing all creative assets and CC audio licenses.
- **Support & Review Portals**: Direct integration for creator support (*Buy Me a Coffee*) and community review links.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Core Framework** | React 19, TypeScript 5.8, Vite 7, React Router 7 |
| **Styling & Design** | Tailwind CSS 4, Radix UI Slot primitives, Lucide Icons |
| **Audio Engine** | Web Audio API (GainNodes, AudioBufferSourceNodes, Cubic Curve scaling) |
| **Unit Testing** | Vitest 3, Testing Library (@testing-library/react, jest-dom) |
| **BDD & E2E Testing** | Cucumber Gherkin (`features/`), Playwright, playwright-bdd |
| **CI / CD** | GitHub Actions (Quality Gate, Vitest Coverage, Playwright BDD suite, GitHub Pages) |

---

## 📦 What's Next in Roadmap

- Cross-device cloud sync and campaign export/import bundles.
- Hotkey triggers / MIDI controller integration for physical soundboard pads.
- Ambient spatial panning and 3D sound positioning.
- Custom ambience timers and automated transition queues.

---

*Arcanum Audio — Crafted for immersive tabletop storytelling.*
