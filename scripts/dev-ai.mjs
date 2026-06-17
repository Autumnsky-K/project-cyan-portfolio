import { spawn } from "node:child_process";
import { platform } from "node:os";

const isWindows = platform() === "win32";
const command = isWindows ? "uv.cmd" : "uv";

const child = spawn(
  command,
  [
    "run",
    "fastapi",
    "dev",
    "src/project_cyan_ai/main.py",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
  ],
  {
    cwd: "ai",
    env: {
      ...process.env,
      UV_CACHE_DIR: ".uv-cache",
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8",
    },
    stdio: "inherit",
    shell: isWindows,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
