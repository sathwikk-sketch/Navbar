const { app, globalShortcut, ipcMain, Menu, nativeImage, Notification, Tray } = require("electron");
const { GLOBAL_SHORTCUT } = require("./config");
const { focusOrOpenChatGPT } = require("./services/chatgptDesktop");
const { createCommandWindow, hideWindow, showWindow, toggleWindow } = require("./services/windowManager");

let mainWindow;
let tray;
let isQuitting = false;

function createTrayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect x="7" y="7" width="50" height="50" rx="17" fill="#090909" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2"/>
      <path d="M22 39V25h5.8l4.5 8.1 4.5-8.1H42v14h-4.2v-7.7l-3.7 6.5h-3.6l-3.7-6.5V39H22Z" fill="#fff"/>
    </svg>`;

  return nativeImage
    .createFromDataURL(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
    .resize({ width: 18, height: 18 });
}

function setupTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip("Local Navbar");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show Local Navbar",
        click: () => showWindow(mainWindow)
      },
      {
        label: "Hide",
        click: () => hideWindow(mainWindow)
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ])
  );
  tray.on("click", () => toggleWindow(mainWindow));
}

function registerShortcut() {
  const registered = globalShortcut.register(GLOBAL_SHORTCUT, () => toggleWindow(mainWindow));

  if (registered) {
    console.log(`[Local Navbar] Global shortcut registered: ${GLOBAL_SHORTCUT}`);
    return;
  }

  const message = `Unable to register shortcut: ${GLOBAL_SHORTCUT}`;
  console.error(`[Local Navbar] ${message}`);
  if (Notification.isSupported()) {
    new Notification({ title: "Local Navbar", body: message }).show();
  }
}

function registerIpcHandlers() {
  ipcMain.handle("window:hide", async () => {
    await hideWindow(mainWindow);
    return { ok: true };
  });

  ipcMain.handle("command:submit", async (_event, { prompt } = {}) => {
    const text = String(prompt || "").trim();
    console.log("[Local Navbar][IPC] ipc received", { promptLength: text.length });

    if (!text) {
      console.warn("[Local Navbar][IPC] Ignoring empty prompt.");
      return { ok: false, error: "Prompt is empty." };
    }

    try {
      await hideWindow(mainWindow);
      await focusOrOpenChatGPT(text);
      console.log("[Local Navbar][IPC] Submission completed.");
      return { ok: true };
    } catch (error) {
      console.error(`[Local Navbar][IPC] Submission failed\n${error?.stack || error}`);
      const message = error?.message || "Could not submit to ChatGPT.";
      if (Notification.isSupported()) {
        new Notification({ title: "Local Navbar submission failed", body: message }).show();
      }
      showWindow(mainWindow);
      return { ok: false, error: message };
    }
  });
}

app.setAppUserModelId("com.localnavbar.commandwidget");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

app.whenReady().then(() => {
  mainWindow = createCommandWindow();

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      hideWindow(mainWindow);
    }
  });

  registerIpcHandlers();
  setupTray();
  registerShortcut();
});

app.on("activate", () => {
  if (!mainWindow) {
    mainWindow = createCommandWindow();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    return;
  }
});
