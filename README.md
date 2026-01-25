# 🏠 Home Assistant Desktop

A sleek, lightweight cross-platform desktop client for **Home Assistant**, built with **Tauri**, **Rust**, and **TypeScript**.

---

## 📥 For Users (Quick Install)

If you just want to use the app without touching any code, follow these steps:

1. Go to the **[Releases](https://www.google.com/search?q=https://github.com/PsydoV2/home-assistant-desktop/releases)** page.
2. Download the latest `.exe` file (for Windows) or the appropriate installer for your OS.
3. Run the installer/executable.
4. **Initial Setup:** Enter the full URL of your Home Assistant instance (e.g., `http://homeassistant.local:8123`).
5. **Usage:** \* The app stays in your **System Tray** (bottom right) when closed.

- Right-click the Tray Icon to **Reset the URL** or **Quit** the app.

---

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

---

## ✨ Features

- **🌍 Multi-language Support:** Setup screen with 12+ languages and flag icons.
- **⚡ Ultra Lightweight:** Minimal RAM usage compared to browser tabs or Electron.
- **📥 Native Integration:** Hide-to-tray logic and native system menus.
- **🔄 Deep Reset:** Completely clear stored instance data via the tray menu to switch servers.

---

## 📂 Project Structure

- `src/` - Frontend: TypeScript (Logic), CSS (Styling), HTML (Structure).
- `src-tauri/` - Backend: Rust logic, Window & Tray management.
- `src-tauri/tauri.conf.json` - Core configuration (App ID, Windows, Icons).

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch.
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
