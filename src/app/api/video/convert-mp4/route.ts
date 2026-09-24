import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { getFfmpegPath } from "@/lib/ffmpeg-path";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  let inTempFile: string | null = null;
  let outTempFile: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Fichier vidéo manquant" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const ffmpegPath = getFfmpegPath();
    if (!ffmpegPath) {
      console.warn("FFmpeg not found on host, returning original stream");
      return new NextResponse(inputBuffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": 'attachment; filename="reel.mp4"',
        },
      });
    }

    const uniqueId = `reel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tempDir = os.tmpdir();
    inTempFile = path.join(tempDir, `${uniqueId}-input.webm`);
    outTempFile = path.join(tempDir, `${uniqueId}-output.mp4`);

    await fs.promises.writeFile(inTempFile, inputBuffer);

    // Convert into standard H.264 (avc1) + AAC (mp4a) with +faststart
    const args = [
      "-y",
      "-i",
      inTempFile,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      outTempFile,
    ];

    await execFileAsync(ffmpegPath, args, { timeout: 60000 });

    const outputBuffer = await fs.promises.readFile(outTempFile);

    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="reel.mp4"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("FFmpeg conversion error:", error);
    const message = error instanceof Error ? error.message : "Erreur de conversion vidéo";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (inTempFile && fs.existsSync(inTempFile)) {
      try { await fs.promises.unlink(inTempFile); } catch {}
    }
    if (outTempFile && fs.existsSync(outTempFile)) {
      try { await fs.promises.unlink(outTempFile); } catch {}
    }
  }
}
