"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Hash,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaptionPanelProps {
  caption?: string;
  hashtags?: string[];
  alternativeTitles?: string[];
}

export function CaptionPanel({
  caption,
  hashtags,
  alternativeTitles,
}: CaptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);

  const hasContent =
    (caption && caption.trim()) ||
    (hashtags && hashtags.length > 0) ||
    (alternativeTitles && alternativeTitles.length > 0);

  if (!hasContent) return null;

  const handleCopy = async (
    text: string,
    type: "caption" | "hashtags" | "title",
    index?: number
  ) => {
    await navigator.clipboard.writeText(text);
    if (type === "caption") {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else if (type === "hashtags") {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } else if (type === "title" && index !== undefined) {
      setCopiedTitleIndex(index);
      setTimeout(() => setCopiedTitleIndex(null), 2000);
    }
  };

  const titleBadges = [
    { label: "🎯 Curiosité", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { label: "⚡ Erreur / Déclic", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "🚀 Résultat / Action", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  return (
    <div className="border-t border-border bg-surface">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-accent" />
          <span className="font-semibold text-foreground">
            Légende, Titres Viraux & Anti-Shadowban
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-2.5 w-2.5" />
            Optimisé SEO
          </span>
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 max-h-[380px] overflow-y-auto">
          {/* Anti-Shadowban checklist banner */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Garantie Anti-Shadowban 2026</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                4-5 tags max (aucun spam)
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                Accroche &lt; 125 car.
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                Trigger de sauvegarde 🔖
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                Zéro lien externe
              </span>
            </div>
          </div>

          {/* Suggestions de Titres Viraux (A/B testing) */}
          {alternativeTitles && alternativeTitles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-accent" />
                <span className="text-[11px] font-semibold text-foreground">
                  3 Suggestions de Titres Viraux (Tests A/B)
                </span>
              </div>
              <div className="space-y-1.5">
                {alternativeTitles.map((title, idx) => {
                  const badge = titleBadges[idx] || titleBadges[0];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 bg-muted/60 border border-border/80 rounded-lg p-2 text-xs hover:border-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className="font-medium text-foreground truncate">
                          {title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] gap-1 px-2 shrink-0 hover:bg-muted"
                        onClick={() => handleCopy(title, "title", idx)}
                      >
                        {copiedTitleIndex === idx ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedTitleIndex === idx ? "Copié !" : "Copier"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description / Caption */}
          {caption && caption.trim() && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-foreground">
                    Description / Légende Instagram & LinkedIn
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({caption.length} car.)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] gap-1 px-2.5 hover:bg-muted font-medium"
                  onClick={() => handleCopy(caption, "caption")}
                >
                  {copiedCaption ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedCaption ? "Copié !" : "Copier la description"}
                </Button>
              </div>
              <p className="text-xs text-foreground bg-muted/70 border border-border/70 rounded-lg p-3 whitespace-pre-wrap leading-relaxed font-mono">
                {caption}
              </p>
            </div>
          )}

          {/* Hashtags Anti-Shadowban */}
          {hashtags && hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3 text-accent" />
                  Hashtags Ciblés Anti-Shadowban ({hashtags.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] gap-1 px-2.5 hover:bg-muted font-medium"
                  onClick={() =>
                    handleCopy(
                      hashtags.map((h) => `#${h}`).join(" "),
                      "hashtags"
                    )
                  }
                >
                  {copiedHashtags ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedHashtags ? "Copié !" : "Copier les hashtags"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-accent/10 border border-accent/20 text-accent rounded-lg px-2.5 py-1 font-mono font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
