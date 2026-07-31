import { execFileSync } from "node:child_process";

/**
 * Kills leftover Turbopack dev workers whose parent is already gone.
 *
 * `next dev` spawns one worker process per compile and never reaps them. On
 * Windows those workers are not bound to the parent by a Job Object, so any
 * teardown that is not a clean Ctrl-C (a closed terminal, a killed background
 * shell, an agent session ending) leaves the entire pool running forever at
 * roughly 16 MB each. Several hundred of them will eat every spare GB on the
 * machine, and nothing ever cleans them up.
 *
 * Runs automatically before `npm run dev` via the `predev` hook.
 */

if (process.platform !== "win32") process.exit(0);

const ps = (script) =>
  execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();

try {
  const alive = new Set(
    ps(`Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }`)
      .split(/\s+/)
      .filter(Boolean),
  );

  const rows = ps(
    `Get-CimInstance Win32_Process -Filter "Name='node.exe'" |` +
      ` Where-Object { $_.CommandLine -like '*.next\\dev\\build*' } |` +
      ` ForEach-Object { "$($_.ProcessId) $($_.ParentProcessId)" }`,
  );

  const orphans = rows
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.trim().split(/\s+/))
    .filter(([, parent]) => !alive.has(parent))
    .map(([pid]) => pid);

  if (!orphans.length) process.exit(0);

  // /T takes the whole tree, /F because a wedged worker will not exit politely.
  for (const pid of orphans) {
    try {
      execFileSync("taskkill.exe", ["/PID", pid, "/T", "/F"], { stdio: "ignore" });
    } catch {
      // Already gone between listing and killing. Nothing to do.
    }
  }

  console.log(`Reaped ${orphans.length} orphaned dev worker(s) before starting.`);
} catch {
  // Never block the dev server on cleanup failing.
}
