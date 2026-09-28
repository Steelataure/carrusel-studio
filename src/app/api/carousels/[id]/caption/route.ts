import { NextResponse } from "next/server";
import { getCarousel, updateCarousel } from "@/lib/carousels";
import { generateViralCaption } from "@/lib/caption-generator";
import type { CommentStrategyType } from "@/lib/caption-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const generated = generateViralCaption(carousel);

  return NextResponse.json({
    caption: carousel.caption || generated.caption,
    hashtags: carousel.hashtags && carousel.hashtags.length > 0 ? carousel.hashtags : generated.hashtags,
    alternativeTitles: carousel.alternativeTitles && carousel.alternativeTitles.length > 0 ? carousel.alternativeTitles : generated.alternativeTitles,
    strategies: generated.strategies,
    keyword: generated.keyword,
    defaultStrategyId: generated.defaultStrategyId,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { caption, hashtags, alternativeTitles } = body as {
      caption?: string;
      hashtags?: string[];
      alternativeTitles?: string[];
    };

    const updated = await updateCarousel(id, { caption, hashtags, alternativeTitles });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const generated = generateViralCaption(updated);

    return NextResponse.json({
      caption: updated.caption || "",
      hashtags: updated.hashtags || [],
      alternativeTitles: updated.alternativeTitles || [],
      strategies: generated.strategies,
      keyword: generated.keyword,
      defaultStrategyId: generated.defaultStrategyId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST: generate/regenerate viral titles, caption, and hashtags with strategy support
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let strategyId: CommentStrategyType | undefined;
  let customKeyword: string | undefined;

  try {
    const body = await request.json();
    if (body) {
      strategyId = body.strategyId;
      customKeyword = body.keyword;
    }
  } catch {
    // Empty body is acceptable
  }

  const generated = generateViralCaption(carousel, {
    activeStrategyId: strategyId,
    customKeyword,
  });

  const updated = await updateCarousel(id, {
    caption: generated.caption,
    hashtags: generated.hashtags,
    alternativeTitles: generated.alternativeTitles,
  });

  return NextResponse.json({
    caption: updated?.caption || generated.caption,
    hashtags: updated?.hashtags || generated.hashtags,
    alternativeTitles: updated?.alternativeTitles || generated.alternativeTitles,
    strategies: generated.strategies,
    keyword: generated.keyword,
    defaultStrategyId: strategyId || generated.defaultStrategyId,
  });
}
