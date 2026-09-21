"use client";

import type { AspectRatio } from "@/types/carousel";
import { DIMENSIONS } from "@/types/carousel";

interface SafeZoneOverlayProps {
  aspectRatio: AspectRatio;
  visible: boolean;
}

export function SafeZoneOverlay({ aspectRatio, visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  const { width, height } = DIMENSIONS[aspectRatio];
  const isPortrait = height > width;
  const is916 = aspectRatio === "9:16";

  // Grid crop zones
  // For 9:16, 1:1 square is center 1080x1080 -> 21.875% top & bottom
  // For 4:5, 1:1 square is center 1080x1080 -> 10% top & bottom
  const gridCropTop = is916
    ? 21.875
    : isPortrait
    ? ((height - width) / 2 / height) * 100
    : 0;
  const gridCropBottom = gridCropTop;

  // UI overlay zones:
  // 9:16 Stories/Reels: top ~10% (progress bar + handle), bottom ~18% (caption, music, reply)
  // 4:5 Feed: bottom ~14% (action buttons)
  const topUiPercent = is916 ? 10 : 0;
  const bottomUiPercent = is916 ? 18 : isPortrait ? 14 : 8;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top UI zone for 9:16 Stories/Reels */}
      {topUiPercent > 0 && (
        <div
          className="absolute left-0 right-0 top-0 bg-blue-500/10 border-b border-dashed border-blue-400/50"
          style={{ height: `${topUiPercent}%` }}
        >
          <span className="absolute top-1 left-2 text-[9px] text-blue-400 font-mono font-medium">
            Story / Reel UI
          </span>
        </div>
      )}

      {/* Grid crop zone — top */}
      {isPortrait && (
        <div
          className="absolute left-0 right-0 top-0 bg-red-500/10 border-b border-dashed border-red-400/50"
          style={{ height: `${gridCropTop}%` }}
        >
          <span className="absolute bottom-1 left-2 text-[8px] text-red-400 font-mono font-medium">
            {is916 ? "Feed 1:1 crop" : "Grid crop"}
          </span>
        </div>
      )}

      {/* Grid crop zone — bottom */}
      {isPortrait && (
        <div
          className="absolute left-0 right-0 bottom-0 bg-red-500/10 border-t border-dashed border-red-400/50"
          style={{ height: `${gridCropBottom}%` }}
        >
          <span className="absolute top-1 left-2 text-[8px] text-red-400 font-mono font-medium">
            {is916 ? "Feed 1:1 crop" : "Grid crop"}
          </span>
        </div>
      )}

      {/* Bottom UI overlay zone */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-blue-500/10 border-t border-dashed border-blue-400/50"
        style={{ height: `${bottomUiPercent}%` }}
      >
        <span className="absolute bottom-1 right-2 text-[9px] text-blue-400 font-mono font-medium">
          {is916 ? "Reels Actions / Reply" : "Instagram UI"}
        </span>
      </div>

      {/* Safe zone border — central safe area */}
      <div
        className="absolute border border-dashed border-green-400/50 rounded-sm"
        style={{
          left: "8%",
          right: "8%",
          top: `${Math.max(8, topUiPercent + 2)}%`,
          bottom: `${Math.max(8, bottomUiPercent + 2)}%`,
        }}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-green-400 font-mono font-medium bg-background/90 px-1.5 py-0.5 rounded border border-green-400/30">
          Safe zone {aspectRatio}
        </span>
      </div>
    </div>
  );
}
