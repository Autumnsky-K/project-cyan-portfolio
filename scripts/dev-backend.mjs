import { spawn } from "node:child_process";
import { platform } from "node:os";

const isWindows = platform() === "win32";
const command = isWindows ? "gradlew.bat" : "./gradlew";

const child = spawn(command, ["bootRun"], {
  cwd: "backend",
  stdio: "inherit",
  shell: isWindows,
});

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
