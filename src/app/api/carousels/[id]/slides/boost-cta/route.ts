import { NextResponse } from "next/server";
import { getCarousel, addSlide, updateSlide } from "@/lib/carousels";
import { generateBoostCtaSlideHtml } from "@/lib/caption-generator";
import type { CommentStrategyType } from "@/lib/caption-generator";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const carousel = await getCarousel(id);
    if (!carousel) {
      return NextResponse.json({ error: "Carousel not found" }, { status: 404 });
    }

    let strategyId: CommentStrategyType = "lead_magnet";
    let keyword: string | undefined;
    let mode: "append" | "replace_last" = "append";

    try {
      const body = await request.json();
      if (body) {
        if (body.strategyId) strategyId = body.strategyId;
        if (body.keyword) keyword = body.keyword;
        if (body.mode) mode = body.mode;
      }
    } catch {
      // Empty or non-JSON body is acceptable (will use defaults)
    }

    const html = generateBoostCtaSlideHtml(carousel, strategyId, keyword);
    const notes = `Slide CTA Boost Algorithme (${strategyId})`;

    if (mode === "replace_last" && carousel.slides.length > 0) {
      const lastSlide = carousel.slides[carousel.slides.length - 1];
      await updateSlide(id, lastSlide.id, { html, notes });
    } else {
      const added = await addSlide(id, html, notes);
      if (!added) {
        return NextResponse.json(
          { error: "Could not add slide (max slides reached?)" },
          { status: 400 }
        );
      }
    }

    const updated = await getCarousel(id);
    return NextResponse.json({
      success: true,
      carousel: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to insert boost CTA slide:", err);
    return NextResponse.json({ error: message || "Internal server error" }, { status: 500 });
  }
}
