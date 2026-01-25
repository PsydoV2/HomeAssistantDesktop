# 🏠 Home Assistant Desktop

A sleek, lightweight cross-platform desktop client for **Home Assistant**, built with **Tauri**, **Rust**, and **TypeScript**.

## 📥 Installation

You can find the latest version in the **[Releases](https://github.com/PsydoV2/home-assistant-desktop/releases)** section. We provide three different formats to suit your needs:

| File Type            | Extension     | Best for...                                                                                                                |
| :------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Standard Setup**   | `.exe` (NSIS) | **Recommended.** Most users should pick this. It installs the app, adds it to the Start Menu, and sets up icons correctly. |
| **MSI Installer**    | `.msi`        | Best for corporate environments or automated deployments via IT tools.                                                     |
| **Portable Version** | `.exe`        | Users who want to run the app without installing it. _Note: Might not show the app icon correctly in Windows Explorer._    |

### 🚀 Quick Start

1. Download your preferred file above.
2. Run the file and enter your **Home Assistant URL** (e.g., `http://homeassistant.local:8123`).
3. The app will automatically remember your instance.
4. To close, use the **X** – the app will stay active in your **System Tray** (near the clock).

## 🛠 For Developers (Source Code)

If you want to modify the app or build it yourself, follow the instructions below.

### Prerequisites

- **Rust:** [Install Rust](https://www.rust-lang.org/tools/install)
- **Node.js & npm:** [Install Node.js](https://nodejs.org/)
- **Tauri v2:** Ensure all [system dependencies](https://v2.tauri.app/start/prerequisites/) are met.

### Installation & Development

1. **Clone the repository:**

```bash
git clone https://github.com/PsydoV2/home-assistant-desktop.git
cd home-assistant-desktop

```

2. **Install dependencies:**

```bash
npm install

```

3. **Run in Dev Mode:**

```bash
npm run tauri dev

```

### Building the Executable

To create your own optimized build:

```bash
npm run tauri build

```

## ✨ Features

- **🌍 Multi-language Support:** Setup screen with 12+ languages and flag icons.
- **⚡ Ultra Lightweight:** Minimal RAM usage compared to browser tabs or Electron.
- **📥 Native Integration:** Hide-to-tray logic and native system menus.
- **🔄 Deep Reset:** Completely clear stored instance data via the tray menu to switch servers.

## 📂 Project Structure

- `src/` - Frontend: TypeScript (Logic), CSS (Styling), HTML (Structure).
- `src-tauri/` - Backend: Rust logic, Window & Tray management.
- `src-tauri/tauri.conf.json` - Core configuration (App ID, Windows, Icons).

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch.
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
