# Local Navbar

A Windows 11 floating prompt bar for the installed ChatGPT desktop app. Local Navbar is a native overlay only: it opens or focuses ChatGPT, pastes your prompt, presses Enter, and disappears.

It does not call OpenAI APIs, use API keys, fetch AI responses, or display chat output.

## Architecture

```text
Local Navbar/
  electron/
    config.js                 # Shortcut and configurable ChatGPT executable path
    main.js                   # Tray, global shortcut, and the single submit IPC handler
    preload.js                # Restricted renderer-to-main bridge
    services/
      chatgptDesktop.js       # Launch, focus, clipboard, paste, and Enter automation
      windowManager.js        # Transparent bottom-center overlay window
  scripts/
    dev.mjs                   # Chooses a free Vite port and launches Electron
  src/
    App.jsx                   # Minimal submit flow
    main.jsx
    styles.css
    components/
      CommandShell.jsx        # Single monochrome glass navbar
  package.json
  tailwind.config.js
  vite.config.mjs
```

## Requirements

- Windows 11
- Installed and signed-in ChatGPT desktop app
- Node.js 20 or newer

## Configure ChatGPT Path

By default, Local Navbar launches:

```text
%LOCALAPPDATA%\Programs\ChatGPT\ChatGPT.exe
```

When that path does not exist and no explicit override is provided, it also checks Windows Start Apps registration for the Microsoft Store version of ChatGPT.

If ChatGPT is installed elsewhere, set `CHATGPT_EXE_PATH` before starting the app:

```powershell
$env:CHATGPT_EXE_PATH = "C:\Path\To\ChatGPT.exe"
```

The shortcut is fixed to `CommandOrControl+Shift+Space`, which is `Ctrl+Shift+Space` on Windows.

## Install And Run

```powershell
npm install
npm run dev
```

If PowerShell blocks `npm.ps1` due to your execution policy, use the equivalent Windows commands:

```powershell
npm.cmd install
npm.cmd run dev
```

The development launcher automatically selects an open local port, so it remains usable when another project is already using Vite's default port.

## Usage

1. Press `Ctrl+Shift+Space`.
2. Type a prompt.
3. Press Enter.
4. Local Navbar fades out, launches or activates ChatGPT desktop, pastes the prompt, and presses Enter.

The main-process console logs these checkpoints for troubleshooting:

```text
[Local Navbar][IPC] ipc received
[Local Navbar][ChatGPT] ChatGPT launch started
[Local Navbar][ChatGPT] ChatGPT focused
[Local Navbar][ChatGPT] Clipboard success
[Local Navbar][ChatGPT] Paste success
[Local Navbar][ChatGPT] Enter success
```

Errors print full stack traces and display a native Windows notification.

## Dependencies

- `@nut-tree-fork/nut-js`: keyboard paste and Enter automation
- `clipboardy`: clipboard write and restoration
- `electron`, `react`, `tailwindcss`, `framer-motion`: overlay application and UI

No `node-window-manager`, native window enumeration module, classifier service, routing service, or AI API dependency is used.

## Package

```powershell
npm run dist
```

The installer output is generated in `release/`.
