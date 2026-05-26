const { contextBridge, ipcRenderer } = require("electron");

console.log("[Local Navbar][Preload] preload loaded");

const on = (channel, callback) => {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
};

contextBridge.exposeInMainWorld("localNavbar", {
  submit: (prompt) => {
    console.log("[Local Navbar][Preload] submit triggered", { promptLength: String(prompt || "").trim().length });
    return ipcRenderer.invoke("command:submit", { prompt });
  },
  hide: () => ipcRenderer.invoke("window:hide"),
  onWindowShown: (callback) => on("window:shown", callback),
  onWindowHidden: (callback) => on("window:hidden", callback)
});
