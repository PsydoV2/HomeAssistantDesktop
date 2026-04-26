# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A lightweight Tauri v2 desktop client for Home Assistant. The app presents a one-time setup screen where the user enters their HA URL; after that, the Tauri window navigates directly to the HA instance. A system-tray icon lets users show/hide the window, reset the URL, or quit.

## Development Commands

```bash
npm install              # Install Node dependencies (first time only)
npm run tauri dev        # Run app in dev mode (Rust + Vite hot reload)
npm run tauri build      # Build production installer/executable
npm run build            # Frontend-only build (tsc + vite) — rarely needed alone
```

There are no lint or test scripts configured in this project.

## Architecture

The project has two distinct layers bridged by Tauri IPC:

**Frontend (`src/`)** — TypeScript + plain HTML/CSS, bundled by Vite.
- `src/translations.ts` — all i18n strings (12 languages). Import from here; do not put translations in `main.ts`.
- `src/main.ts` — all UI logic: instance list, URL input/validation, zoom controls, update checker, language picker, localStorage persistence.
- `index.html` / `src/styles.css` — setup screen markup and dark-theme styling.
- After the user connects to an instance, `window.location.replace(url)` navigates the Tauri webview to HA. The setup screen is not shown again until `ha_url` is cleared.

**Multiple instances** are stored as `HaInstance[]` JSON in `localStorage["ha_instances"]`. `localStorage["ha_url"]` holds the last active URL for fast redirect on next startup. Legacy single-URL configs are auto-migrated on first launch.

**Backend (`src-tauri/src/`)** — Rust, Tauri v2.
- `lib.rs` — app entry, tray menu (Show / Switch Instance / Enable|Disable Autostart / Quit), global shortcut `Ctrl+Shift+H`, window hide/show lifecycle, single-instance guard, `set_zoom` IPC command.
- `main.rs` — thin entry point that calls `lib::run()`.
- The "Switch Instance" tray action clears `ha_url` via `window.eval` and navigates back to the app index. The frontend then renders the instance list if any exist.
- `rebuild_tray_menu` refreshes the autostart label dynamically after toggling.

**Plugins used (Rust)**
| Plugin | Purpose |
|---|---|
| `tauri-plugin-single-instance` | Prevent duplicate windows |
| `tauri-plugin-opener` | Open help link in system browser |
| `tauri-plugin-autostart` | System boot launch toggle via tray |
| `tauri-plugin-window-state` | Persist window size and position |
| `tauri-plugin-global-shortcut` | `Ctrl+Shift+H` focuses the window |

**Configuration**
- `src-tauri/tauri.conf.json` — app ID (`com.sebfalter.home-assistant-desktop`), window size (1000×800 min 800×600), bundle targets, CSP null.
- `vite.config.ts` — dev server fixed to port 1420; HMR on port 1421.

## Prerequisites

- Rust toolchain (via [rustup](https://rustup.rs))
- Node.js + npm
- Platform-specific Tauri dependencies: MSVC build tools on Windows, Xcode CLI on macOS, GTK3 + webkit2gtk on Linux — see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/).

## Key Constraints

- **No backend API.** All communication with Home Assistant happens directly from the webview to the user's HA instance. Rust code only manages the native shell (tray, window, single-instance).
- **localStorage for persistence.** The HA URL is stored in the browser's localStorage — no database, no files.
- **Single webview.** There is exactly one window labeled `"main"`. Avoid architectures that require multiple windows.
- **CSP is null.** Do not add CSP restrictions without testing against real HA instances; HA loads many external subresources.
