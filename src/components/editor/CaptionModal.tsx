"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Hash,
  MessageSquare,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carouselId: string;
  carouselName: string;
  caption?: string;
  hashtags?: string[];
  alternativeTitles?: string[];
  onApplyTitle?: (newTitle: string) => Promise<void>;
  onUpdateCaptionData?: (data: {
    caption: string;
    hashtags: string[];
    alternativeTitles: string[];
  }) => void;
}

export function CaptionModal({
  open,
  onOpenChange,
  carouselId,
  carouselName,
  caption = "",
  hashtags = [],
  alternativeTitles = [],
  onApplyTitle,
  onUpdateCaptionData,
}: CaptionModalProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [appliedTitleIndex, setAppliedTitleIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleApplyTitle = async (title: string, index: number) => {
    if (onApplyTitle) {
      await onApplyTitle(title);
      setAppliedTitleIndex(index);
      setTimeout(() => setAppliedTitleIndex(null), 2500);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/carousels/${carouselId}/caption`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateCaptionData?.(data);
      }
    } catch (err) {
      console.error("Regenerate error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const titleBadges = [
    { label: "🎯 Angle Curiosité", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { label: "⚡ Angle Erreur / Déclic", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "🚀 Angle Résultat / Action", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm oc-fade">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span>Suggestions de Titres Viraux & Légende Optimisée</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  Garantie Anti-Shadowban
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Titres à fort taux de clic (A/B testing) et description prête à copier-coller.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="text-xs gap-1.5 h-8"
              title="Générer de nouvelles variantes avec l'IA"
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin text-accent" : ""}`} />
              <span>{isGenerating ? "Génération..." : "Régénérer"}</span>
            </Button>

            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Anti-Shadowban Checklist Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Conformité Algorithme Instagram / TikTok 2026</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                4-5 hashtags max
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Hook &lt; 125 car.
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Call-to-action enregistrement 🔖
              </span>
            </div>
          </div>

          {/* 3 Viral Titles Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>3 Suggestions de Titres Viraux (Tests A/B)</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                Titre actuel : <strong>{carouselName}</strong>
              </span>
            </div>

            {alternativeTitles.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Aucun titre suggéré pour le moment. Cliquez sur &quot;Régénérer&quot; pour les créer.
              </div>
            ) : (
              <div className="space-y-2.5">
                {alternativeTitles.map((title, idx) => {
                  const badge = titleBadges[idx] || titleBadges[0];
                  const isCurrent = carouselName === title;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? "border-accent bg-accent/10 shadow-xs"
                          : "border-border bg-muted/20 hover:border-accent/40"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-accent font-medium font-mono">
                              (Titre actuel du carrousel)
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onApplyTitle && !isCurrent && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="h-8 text-xs gap-1.5 font-medium shadow-xs"
                            onClick={() => handleApplyTitle(title, idx)}
                          >
                            {appliedTitleIndex === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Appliqué !</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>Appliquer ce titre</span>
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleCopy(title, "title", idx)}
                        >
                          {copiedTitleIndex === idx ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedTitleIndex === idx ? "Copié !" : "Copier"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caption / Description Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                <span>Description / Légende Instagram & LinkedIn</span>
                {caption && (
                  <span className="text-xs text-muted-foreground font-mono">
                    ({caption.length} caractères)
                  </span>
                )}
              </h3>

              {caption && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => handleCopy(caption, "caption")}
                >
                  {copiedCaption ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedCaption ? "Copié !" : "Copier la description"}</span>
                </Button>
              )}
            </div>

            {caption ? (
              <div className="relative">
                <pre className="p-4 rounded-xl border border-border bg-muted/30 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {caption}
                </pre>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Aucune description générée pour l&apos;instant.
              </div>
            )}
          </div>

          {/* Hashtags Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4 text-accent" />
                <span>Hashtags Ciblés Anti-Shadowban ({hashtags.length})</span>
              </h3>

              {hashtags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() =>
                    handleCopy(
                      hashtags.map((h) => `#${h}`).join(" "),
                      "hashtags"
                    )
                  }
                >
                  {copiedHashtags ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedHashtags ? "Copiés !" : "Copier tous les hashtags"}</span>
                </Button>
              )}
            </div>

            {hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleCopy(`#${tag}`, "hashtags")}
                    className="cursor-pointer text-xs bg-accent/10 border border-accent/20 text-accent rounded-lg px-3 py-1.5 font-mono font-medium hover:bg-accent/20 transition-colors flex items-center gap-1"
                    title="Cliquer pour copier ce hashtag"
                  >
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Aucun hashtag disponible.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Formatez vos publications Instagram / TikTok en 1 clic
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
