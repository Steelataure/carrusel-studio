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
    // -vf fps=fps=30:round=near enforces a strictly monotonic CFR 30.000 fps timeline without PTS gaps
    // -g 30 and -keyint_min 30 force an IDR keyframe every 1.0s, eliminating player freezes/hiccups
    // -profile:v high and -level 4.1 ensure universal hardware acceleration in Windows Media Player & iOS
    // -af aresample=async=1000 ensures audio and video streams remain perfectly synchronized
    const args = [
      "-y",
      "-fflags",
      "+genpts",
      "-avoid_negative_ts",
      "make_zero",
      "-i",
      inTempFile,
      "-vf",
      "fps=fps=30:round=near,format=yuv420p",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "20",
      "-profile:v",
      "high",
      "-level",
      "4.1",
      "-g",
      "30",
      "-keyint_min",
      "30",
      "-sc_threshold",
      "0",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "44100",
      "-af",
      "aresample=async=1000",
      "-movflags",
      "+faststart",
      outTempFile,
    ];

    await execFileAsync(ffmpegPath, args, { timeout: 120000 });

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
