import { NextResponse } from "next/server";
import { getCarousel, updateCarousel } from "@/lib/carousels";
import { generateViralCaption } from "@/lib/caption-generator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    caption: carousel.caption || "",
    hashtags: carousel.hashtags || [],
    alternativeTitles: carousel.alternativeTitles || [],
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

    return NextResponse.json({
      caption: updated.caption || "",
      hashtags: updated.hashtags || [],
      alternativeTitles: updated.alternativeTitles || [],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// POST: generate/regenerate viral titles, caption, and hashtags
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const carousel = await getCarousel(id);
  if (!carousel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const generated = generateViralCaption(carousel);
  const updated = await updateCarousel(id, {
    caption: generated.caption,
    hashtags: generated.hashtags,
    alternativeTitles: generated.alternativeTitles,
  });

  return NextResponse.json({
    caption: updated?.caption || generated.caption,
    hashtags: updated?.hashtags || generated.hashtags,
    alternativeTitles: updated?.alternativeTitles || generated.alternativeTitles,
  });
}
