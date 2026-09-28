import fs from "fs";
import path from "path";
import { execSync, execFileSync } from "child_process";

let cachedFfmpegPath: string | null = null;

function isExecutableFfmpeg(candidatePath: string): boolean {
  try {
    if (!candidatePath || !fs.existsSync(candidatePath)) return false;
    // Verify that the executable can actually launch and not crash with missing DLLs (e.g. status 3236495362)
    execFileSync(candidatePath, ["-version"], { timeout: 2000, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Automatically locate a verified, working FFmpeg binary on Windows, macOS, or Linux.
 */
export function getFfmpegPath(): string | null {
  if (cachedFfmpegPath && isExecutableFfmpeg(cachedFfmpegPath)) {
    return cachedFfmpegPath;
  }

  // 1. Explicit environment variable
  if (process.env.FFMPEG_PATH && isExecutableFfmpeg(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }

  // 2. System PATH (which / where)
  try {
    const cmd = process.platform === "win32" ? "where ffmpeg" : "which ffmpeg";
    const out = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const candidate of lines) {
      if (isExecutableFfmpeg(candidate)) {
        cachedFfmpegPath = candidate;
        return cachedFfmpegPath;
      }
    }
  } catch {}

  // 3. Windows WinGet package directory
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "";
    if (localAppData) {
      const wingetDir = path.join(localAppData, "Microsoft", "WinGet", "Packages");
      if (fs.existsSync(wingetDir)) {
        try {
          const dirs = fs.readdirSync(wingetDir);
          // Prioritize Essentials build over Shared build
          const sortedDirs = dirs.sort((a, b) => {
            if (a.toLowerCase().includes("essentials") && !b.toLowerCase().includes("essentials")) return -1;
            if (!a.toLowerCase().includes("essentials") && b.toLowerCase().includes("essentials")) return 1;
            return 0;
          });

          for (const d of sortedDirs) {
            if (d.toLowerCase().includes("ffmpeg")) {
              const base = path.join(wingetDir, d);
              const findExe = (dir: string, depth = 0): string | null => {
                if (depth > 4) return null;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const e of entries) {
                  const full = path.join(dir, e.name);
                  if (e.isDirectory()) {
                    const sub = findExe(full, depth + 1);
                    if (sub) return sub;
                  } else if (e.name.toLowerCase() === "ffmpeg.exe") {
                    if (isExecutableFfmpeg(full)) return full;
                  }
                }
                return null;
              };
              const found = findExe(base);
              if (found) {
                cachedFfmpegPath = found;
                return cachedFfmpegPath;
              }
            }
          }
        } catch {}
      }
    }

    // Common Windows directories
    const commonPaths = [
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe",
    ];
    for (const p of commonPaths) {
      if (isExecutableFfmpeg(p)) {
        cachedFfmpegPath = p;
        return cachedFfmpegPath;
      }
    }
  }

  return null;
}
