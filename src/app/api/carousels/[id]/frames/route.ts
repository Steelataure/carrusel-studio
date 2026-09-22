import { NextResponse } from "next/server";
import { getCarousel } from "@/lib/carousels";
import { exportAllSlides } from "@/lib/export-slides";
import type { AspectRatio, Slide } from "@/types/carousel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let slides: Slide[] = [];
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

  if (slides.length === 0) {
    const carousel = await getCarousel(id);
    if (!carousel) {
      return NextResponse.json({ error: "Carousel not found" }, { status: 404 });
    }
    slides = carousel.slides;
  }

  if (!slides || slides.length === 0) {
    return NextResponse.json({ error: "No slides to export" }, { status: 400 });
  }

  try {
    // Render all slides to PNG buffers at exact dimensions
    const pngBuffers = await exportAllSlides(slides, ratio);

    // Convert to base64 data URLs
    const frames = pngBuffers.map((p, idx) => ({
      index: idx,
      dataUrl: `data:image/png;base64,${p.buffer.toString("base64")}`,
    }));

    return NextResponse.json({ frames });
  } catch (error) {
    console.error("Frame export error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
