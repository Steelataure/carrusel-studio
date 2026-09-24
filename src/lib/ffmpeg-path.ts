import fs from "fs";
import path from "path";
import { execSync } from "child_process";

let cachedFfmpegPath: string | null = null;

/**
 * Automatically locate FFmpeg on Windows, macOS, or Linux.
 */
export function getFfmpegPath(): string | null {
  if (cachedFfmpegPath && fs.existsSync(cachedFfmpegPath)) {
    return cachedFfmpegPath;
  }

  // 1. Explicit environment variable
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }

  // 2. System PATH (which / where)
  try {
    const cmd = process.platform === "win32" ? "where ffmpeg" : "which ffmpeg";
    const out = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
      .trim()
      .split("\n")[0]
      .trim();
    if (out && fs.existsSync(out)) {
      cachedFfmpegPath = out;
      return cachedFfmpegPath;
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
          for (const d of dirs) {
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
                    return full;
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
      if (fs.existsSync(p)) {
        cachedFfmpegPath = p;
        return cachedFfmpegPath;
      }
    }
  }

  return null;
}
