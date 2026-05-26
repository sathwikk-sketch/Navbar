import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const electronPath = require("electron");
const cwd = process.cwd();
const host = "127.0.0.1";
const viteEntry = path.join(cwd, "node_modules", "vite", "bin", "vite.js");

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ host, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(startingPort) {
  for (let port = startingPort; port < startingPort + 30; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error("No available development port found between 5173 and 5202.");
}

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const connect = () => {
      const socket = net.connect({ host, port });

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startedAt > 10000) {
          reject(new Error(`Vite did not become ready on port ${port}.`));
          return;
        }

        setTimeout(connect, 100);
      });
    };

    connect();
  });
}

const port = await findAvailablePort(5173);
const url = `http://${host}:${port}`;
console.log(`[Local Navbar] Development server selected: ${url}`);

const vite = spawn(process.execPath, [viteEntry, "--host", host, "--port", String(port), "--strictPort"], {
  cwd,
  env: process.env,
  stdio: "inherit"
});

try {
  await waitForServer(port);
} catch (error) {
  vite.kill();
  throw error;
}

const electron = spawn(electronPath, ["."], {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: "development",
    VITE_DEV_SERVER_URL: url
  },
  stdio: "inherit"
});

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) {
    return;
  }

  stopping = true;
  electron.kill();
  vite.kill();
  process.exitCode = exitCode;
}

vite.on("exit", (code) => {
  if (!stopping) {
    console.error(`[Local Navbar] Vite exited with code ${code ?? "unknown"}.`);
    stop(code || 1);
  }
});

electron.on("exit", (code) => {
  if (!stopping) {
    stop(code || 0);
  }
});

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
