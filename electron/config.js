const path = require("node:path");

const DEFAULT_CHATGPT_EXE_PATH = path.join(
  process.env.LOCALAPPDATA || "",
  "Programs",
  "ChatGPT",
  "ChatGPT.exe"
);
const configuredPath = String(process.env.CHATGPT_EXE_PATH || "").trim();

module.exports = {
  CHATGPT_EXE_PATH: configuredPath || DEFAULT_CHATGPT_EXE_PATH,
  ALLOW_STORE_APP_FALLBACK: !configuredPath,
  GLOBAL_SHORTCUT: "CommandOrControl+Shift+Space"
};
