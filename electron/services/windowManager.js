const { BrowserWindow, app, screen } = require("electron");
const path = require("node:path");

const WINDOW_WIDTH = 728;
const WINDOW_HEIGHT = 86;
const WINDOW_MARGIN = 24;
const FADE_DURATION_MS = 110;
const FADE_STEPS = 7;
let animationTimer;
let hidePromise;

function clearFade() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = undefined;
  }
}

function fadeTo(win, targetOpacity) {
  return new Promise((resolve) => {
    clearFade();
    const startOpacity = win.getOpacity();
    const delta = targetOpacity - startOpacity;
    let step = 0;

    animationTimer = setInterval(() => {
      if (win.isDestroyed()) {
        clearFade();
        resolve();
        return;
      }

      step += 1;
      const progress = Math.min(step / FADE_STEPS, 1);
      win.setOpacity(startOpacity + delta * progress);

      if (progress === 1) {
        clearFade();
        resolve();
      }
    }, Math.round(FADE_DURATION_MS / FADE_STEPS));
  });
}

function positionWindow(win) {
  if (!win) {
    return;
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint) || screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;

  win.setBounds({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: Math.round(x + (width - WINDOW_WIDTH) / 2),
    y: Math.round(y + height - WINDOW_HEIGHT - WINDOW_MARGIN)
  });
}

function createCommandWindow() {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#00000000",
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setSkipTaskbar(true);
  positionWindow(win);

  win.webContents.on("preload-error", (_event, preloadPath, error) => {
    console.error(`[Local Navbar] Preload failed: ${preloadPath}\n${error?.stack || error}`);
  });

  win.webContents.on("did-fail-load", (_event, code, description) => {
    console.error(`[Local Navbar] Renderer failed to load (${code}): ${description}`);
  });

  win.webContents.on("console-message", (_event, ...args) => {
    const message = typeof args[0] === "object" ? args[0]?.message : args[1];

    if (String(message || "").includes("[Local Navbar]")) {
      console.log(`[Local Navbar][Renderer Console] ${message}`);
    }
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173");
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }

  return win;
}

function showWindow(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  if (hidePromise) {
    hidePromise.then(() => showWindow(win));
    return;
  }

  positionWindow(win);
  clearFade();
  win.setOpacity(0);
  win.show();
  win.focus();
  win.webContents.send("window:shown");
  fadeTo(win, 1);
}

async function hideWindow(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  if (hidePromise) {
    return hidePromise;
  }

  if (!win.isVisible()) {
    return;
  }

  hidePromise = (async () => {
    win.webContents.send("window:hidden");
    await fadeTo(win, 0);
    win.hide();
    win.setOpacity(1);
    hidePromise = undefined;
  })();

  return hidePromise;
}

async function toggleWindow(win) {
  if (!win || win.isDestroyed()) {
    return;
  }

  if (win.isVisible()) {
    await hideWindow(win);
  } else {
    showWindow(win);
  }
}

module.exports = {
  createCommandWindow,
  hideWindow,
  positionWindow,
  showWindow,
  toggleWindow
};
