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
  providedRatio?: AspectRatio | "auto"
) {
  let slides: Slide[] = providedSlides || [];
  const carousel = await getCarousel(id);

  if (slides.length === 0) {
    if (!carousel) {
      return NextResponse.json({ error: "Carousel non trouvé" }, { status: 404 });
    }
    slides = carousel.slides;
  }

  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: "Aucune slide à exporter" }, { status: 400 });
  }

  // Detect the true intended aspect ratio to avoid stretching or distorting slides
  let ratio: AspectRatio = "4:5";
  const firstSlideHtml = slides[0]?.html || "";
  if (firstSlideHtml.includes("height:1350px") || firstSlideHtml.includes("height: 1350px")) {
    ratio = "4:5";
  } else if (firstSlideHtml.includes("height:1080px") || firstSlideHtml.includes("height: 1080px")) {
    ratio = "1:1";
  } else if (firstSlideHtml.includes("height:1920px") || firstSlideHtml.includes("height: 1920px")) {
    ratio = "9:16";
  } else if (providedRatio && providedRatio !== "auto") {
    ratio = providedRatio;
  } else if (carousel?.aspectRatio) {
    ratio = carousel.aspectRatio;
  }

  try {
    // Render all slides to PNG buffers at native crisp dimensions
    const pngBuffers = await exportAllSlides(slides, ratio);

    // Convert to base64 data URLs
    const frames = pngBuffers.map((p, idx) => ({
      index: idx,
      dataUrl: `data:image/png;base64,${p.buffer.toString("base64")}`,
    }));
    const dataUrls = frames.map((f) => f.dataUrl);

    return NextResponse.json({ frames, dataUrls, ratio });
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
  const ratioParam = url.searchParams.get("ratio") as AspectRatio | "auto" | null;
  return processFrameExport(id, undefined, ratioParam || undefined);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let slides: Slide[] | undefined;
  let ratioParam: AspectRatio | "auto" | undefined;

  try {
    const body = await request.json();
    if (body.ratio) ratioParam = body.ratio;
    if (Array.isArray(body.slides) && body.slides.length > 0) {
      slides = body.slides;
    }
  } catch {
    // ignore
  }

  return processFrameExport(id, slides, ratioParam);
}
