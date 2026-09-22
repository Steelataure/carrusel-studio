import { NextResponse } from "next/server";
import { getCarousel } from "@/lib/carousels";
import { exportAllSlides } from "@/lib/export-slides";
import type { AspectRatio, Slide } from "@/types/carousel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function processFrameExport(
  id: string,
  providedSlides?: Slide[],
  providedRatio?: AspectRatio
) {
  let slides: Slide[] = providedSlides || [];
  const ratio: AspectRatio = providedRatio || "9:16";

  if (slides.length === 0) {
    const carousel = await getCarousel(id);
    if (!carousel) {
      return NextResponse.json({ error: "Carousel non trouvé" }, { status: 404 });
    }
    slides = carousel.slides;
  }

  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: "Aucune slide à exporter" }, { status: 400 });
  }

  try {
    // Render all slides to PNG buffers at exact dimensions (1080x1920 for 9:16)
    const pngBuffers = await exportAllSlides(slides, ratio);

    // Convert to base64 data URLs
    const frames = pngBuffers.map((p, idx) => ({
      index: idx,
      dataUrl: `data:image/png;base64,${p.buffer.toString("base64")}`,
    }));
    const dataUrls = frames.map((f) => f.dataUrl);

    return NextResponse.json({ frames, dataUrls });
  } catch (error) {
    console.error("Frame export error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const ratio = (url.searchParams.get("ratio") as AspectRatio) || "9:16";
  return processFrameExport(id, undefined, ratio);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let slides: Slide[] | undefined;
  let ratio: AspectRatio = "9:16";

  try {
    const body = await request.json();
    if (body.ratio) ratio = body.ratio;
    if (Array.isArray(body.slides) && body.slides.length > 0) {
      slides = body.slides;
    }
  } catch {
    // ignore
  }

  return processFrameExport(id, slides, ratio);
}
