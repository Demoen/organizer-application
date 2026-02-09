# Desktop Organizer

AI-assisted desktop file organizer built with **Tauri + React + Rust**. Scans a target directory, detects projects, categorizes loose files, and generates a safe “plan” of moves you can review before applying.

![Desktop Organizer Overview](screenshots/overview.png)

## Features

* **AI-assisted organization**: project detection (50+ markers), optional AI project renaming, and file categorization (Images, Videos, Documents, Archives, etc.)
* **Safe scanning**: recursive scan with ignore patterns (e.g., `node_modules`, `.git`), safety heuristics for system/software folders and Obsidian vaults, and live progress stats
* **Plan-first operations**: preview move operations with reasons, remove individual operations, and handle collisions via smart renaming
* **Undo & history**: batch undo, session history, and transactional execution (all-or-nothing)
* **Configurable**: persistent settings, custom rules, ignore patterns, and custom project markers
* **Modern UI**: glassmorphism dark theme with animated background and responsive interactions

## Screenshots

### Overview Dashboard

![Overview](screenshots/overview.png)

### Planned Operations

![Operations](screenshots/operations.png)

### Settings & Configuration

![Settings](screenshots/settings.png)

## Installation

### Prerequisites

* Node.js **18+**
* Rust (latest stable)
* npm or yarn

### Build from source

```bash
git clone <repository-url>
cd organizer-application
npm install
npm run tauri dev
```

Production build:

```bash
npm run tauri build
```

Artifacts:

* **Windows**: `src-tauri/target/release/bundle/nsis/desktop-organizer_0.1.0_x64-setup.exe`
* **macOS**: `src-tauri/target/release/bundle/dmg/`
* **Linux**: `src-tauri/target/release/bundle/appimage/`

## Tech Stack

* React 18 + TypeScript + Vite
* Rust + Tauri 2.0
* TailwindCSS + Framer Motion
* Lucide React
* OpenAI API (gpt-4o-mini) for optional naming

## Usage

1. Select a target directory
2. Run a scan
3. Review planned operations
4. Apply changes (or remove individual operations)
5. Undo via History if needed

## Configuration

Config path:

* **Windows**: `%APPDATA%\com.deskorganizer.app\config.json`
* **macOS**: `~/Library/Application Support/com.deskorganizer.app/config.json`
* **Linux**: `~/.config/com.deskorganizer.app/config.json`

Includes default file-type rules, ignore patterns, and 50+ project markers (JS/TS, Python, Rust, Go, Docker, Unity, etc.).

## License

MIT
