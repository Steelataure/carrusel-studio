<div align="center">

# ⚡ Carrusel Studio

### Design viral Instagram carousels & animated reels with AI. Export pixel-perfect PNGs & 9:16 videos.

**Local-first. Open source. Built by Steelataure.**

[![License: MIT](https://img.shields.io/badge/license-MIT-1a1a2e.svg?style=flat-square)](./LICENSE)
[![Built with Claude](https://img.shields.io/badge/built%20with-Claude-e94560.svg?style=flat-square)](https://claude.ai)
[![Author: Steelataure](https://img.shields.io/badge/author-Steelataure-22d3ee.svg?style=flat-square)](https://github.com/Steelataure)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000.svg?style=flat-square)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca.svg?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=flat-square)](https://tailwindcss.com)

![Dashboard](./docs/screenshots/dashboard.png)

</div>

---

## 📑 Table of Contents

- [Why Carrusel Studio?](#-why-carrusel-studio)
- [Key Features](#-key-features)
- [Interface Overview](#-interface-overview)
- [Quickstart (60 seconds)](#-quickstart-60-seconds)
- [How the AI Works](#-how-the-ai-works)
- [Slash Commands](#-slash-commands)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [About the Author](#-about-the-author)
- [License](#-license)

---

## ✨ Why Carrusel Studio?

Designing high-converting Instagram carousels and video reels eats hours every week. Creators usually face three frustrating bottlenecks:

- 💸 **Paying $20–60/month** for closed-source SaaS tools that restrict customization.
- 🥱 **Wrestling generic Canva templates** that everyone else on social media already uses.
- ⏳ **Losing weekends in Figma** nudging text boxes and manual alignments for every single slide.

**Carrusel Studio changes the paradigm.** Built for developers, creators, and personal brands who want complete leverage:

1. **Intelligent Generation**: Chat with AI to construct unique, modern slides built in real HTML/CSS.
2. **Quick Edit Mode**: Double-click any slide to modify headlines, body copy, or code blocks in seconds without waiting on AI.
3. **Viral A/B Titles & Anti-Shadowban**: Generate 3 high-CTR title variations (Curiosity, Error, Action angles), engaging captions, and algorithm-compliant hashtags.
4. **30-Day Visual Planning**: Schedule your cadence with a full monthly publication calendar and 1-click sequential auto-scheduling.
5. **Multi-Format Export**: Export razor-sharp PNG archives or transform your slides into **animated 9:16 vertical videos** with smooth transitions and ambient soundscapes for TikTok, Instagram Reels, and YouTube Shorts.
6. **100% Local-First**: Your designs, fonts, and data stay on your machine. No accounts, no subscriptions, no vendor lock-in.

---

## 🧰 Key Features

- 🔍 **Instant Search & Topic Filters**: Find any carousel in real-time with the `/` keyboard shortcut and filter by topic pills (*Git, Docker, Python, Architecture, TypeScript, SQL, Terminal, Career*).
- 📅 **30-Day Publication Calendar**: Monthly visual planning calendar with drag-and-drop status scheduling and an **"Auto-Schedule (1/day)"** sequential scheduler.
- ✏️ **Quick Edit Slide Modal**: Double-click any slide in the preview to edit text, code snippets, and markup directly with a real-time live preview.
- 🎯 **Viral Titles & Anti-Shadowban Captions**:
  - 3 A/B testable hook variations with a 1-click **"Apply Title"** button
  - Hook-optimized captions (< 125 chars before fold) with save-triggers 🔖
  - 4–5 targeted hashtags (free from banned/flagged tags)
- 🎬 **Animated 9:16 Reel/Video Export**: Turn slides into high-definition vertical videos with customizable slide timing (2s, 3s, 4s), transitions (*Crossfade, Push Slide, Ken Burns Zoom*), and integrated audio.
- 🎵 **Procedural Ambient Soundscapes**: Built-in Web Audio engine featuring *Cyberpunk Neon Synthwave*, *Midnight Lofi Code*, and *Dark Terminal Ambient*.
- 📐 **Multiple Aspect Ratios**: Native support for 1:1 (1080×1080), 4:5 (1080×1350), and 9:16 (1080×1920).
- 🛡️ **Instagram Safe-Zone Overlay**: Verify that headlines and essential elements aren't covered by Instagram Stories or Reels UI overlays.
- 🎨 **Brand Identity System**: Customize colors, Google Fonts, and styling keywords that automatically seed every AI prompt.
- 💾 **Clean ZIP Filenames**: Exported ZIP files automatically match your carousel title for easy file management.

---

## 🎬 Interface Overview

**Dashboard** — real-time search, topic filters, publication status tabs, and 30-day calendar toggle:

![Dashboard](./docs/screenshots/dashboard.png)

**Editor** — AI assistant chat (left), live interactive preview (center), reorderable filmstrip (bottom), viral titles panel, and video export:

![Editor](./docs/screenshots/editor.png)

---

## 🚀 Quickstart (60 seconds)

### Installation

```bash
# Clone the repository
git clone https://github.com/Steelataure/-carrusel-studio.git
cd -carrusel-studio

# Install dependencies and seed local data
npm run setup

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using with Claude Code (Optional)

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code):

```bash
claude
/start
```

---

## 💬 How the AI Works

The in-app agent invokes the **Claude CLI** as a subprocess through `/api/chat`. Messages stream to the browser via Server-Sent Events (SSE).

When generating slides:

1. The agent parses your brand configuration (`brand.json`) and active carousel state.
2. It generates each slide as clean, self-contained HTML/CSS.
3. It persists the slide via the local `/api/carousels/[id]/slides` endpoint.
4. The slide renders immediately inside the sandboxed preview and filmstrip.

### How Slides Become PNGs and Reels

- **PNG Export**: [Puppeteer](https://pptr.dev) captures each slide at exact Instagram pixel dimensions with font inlining and zero compression artifacts.
- **Reel Video Export**: A client-side Canvas compositor animates transitions across slides and merges the video stream with the Web Audio procedural synthesizer to produce a publication-ready vertical video.

---

## 🛠 Slash Commands

If running inside Claude Code CLI:

| Command         | Description                                                                              |
|-----------------|------------------------------------------------------------------------------------------|
| `/start [port]` | Installs dependencies, seeds data, starts dev server, and launches the browser.          |
| `/stop [port]`  | Terminates the running development server (default `:3000`).                             |
| `/reset`        | Clears local carousel and template caches and re-seeds default data.                     |
| `/doctor`       | Runs system diagnostics: Node version, CLI path, dependencies, and port availability.    |

Standard npm commands:

```bash
npm run setup     # install dependencies and initialize data files
npm run dev       # start dev server
npm run build     # production Next.js build
npm run lint      # run ESLint and TypeScript checks
npm run doctor    # run environment diagnostics
```

---

## 🏗 Architecture & Tech Stack

```
carrusel-studio/
├── data/                    # Local storage (carousels.json, brand.json, templates.json)
├── src/
│   ├── app/                 # Next.js App Router (Dashboard, Editor, API routes)
│   ├── components/
│   │   ├── brand/           # Brand style setup modal
│   │   ├── chat/            # AI chat panel & reference images
│   │   ├── dashboard/       # 30-Day publication calendar & dashboard controls
│   │   ├── editor/          # Preview, Quick Edit, CaptionModal, ReelExport, Audio
│   │   ├── layout/          # TopBar & header navigation
│   │   ├── templates/       # Template gallery & card components
│   │   └── ui/              # Radix UI primitives & design tokens
│   ├── lib/                 # Slide compilation, audio-engine, caption-generator, exports
│   └── types/               # TypeScript domain interfaces
```

- **Framework**: Next.js 16 (Turbopack) + React 19
- **Language**: TypeScript 5
- **Styling**: Vanilla CSS + Tailwind CSS v4 design utilities
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Rendering & Video**: Puppeteer + Sharp + Web Audio API + MediaRecorder

---

## 👤 About the Author

**Carrusel Studio** is developed and maintained by **[Steelataure](https://github.com/Steelataure)**.

Designed to streamline high-volume technical content creation, educational carousels, and vertical video publishing across Instagram, TikTok, LinkedIn, and YouTube Shorts.

If you find this project valuable:
- ⭐ **Star this repository**: [Steelataure/-carrusel-studio](https://github.com/Steelataure/-carrusel-studio.git)
- 🚀 **Share your feedback and feature suggestions**

---

## 📄 License

Distributed under the [MIT License](./LICENSE) — free to use, customize, and extend.

<div align="center">

**Built with ❤️ by [Steelataure](https://github.com/Steelataure).**

*Engineered to take your content and audience to the next level.*

</div>
