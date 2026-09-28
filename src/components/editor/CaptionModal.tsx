"use client";

import { useState, useEffect } from "react";
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
  Gift,
  Swords,
  Brain,
  Flame,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommentStrategy, CommentStrategyType } from "@/lib/caption-generator";

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
  onRefreshCarousel?: () => Promise<void> | void;
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
  onRefreshCarousel,
}: CaptionModalProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [appliedTitleIndex, setAppliedTitleIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Strategy states
  const [strategies, setStrategies] = useState<CommentStrategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<CommentStrategyType>("lead_magnet");
  const [customKeyword, setCustomKeyword] = useState<string>("");
  const [isUpdatingSlide, setIsUpdatingSlide] = useState(false);
  const [slideSuccess, setSlideSuccess] = useState<string | null>(null);
  const [showSlidePreview, setShowSlidePreview] = useState(true);

  useEffect(() => {
    if (!open || !carouselId) return;
    let isCancelled = false;
    async function loadStrategies() {
      try {
        const res = await fetch(`/api/carousels/${carouselId}/caption`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.strategies) {
            setStrategies(data.strategies);
            if (data.keyword && !customKeyword) {
              setCustomKeyword(data.keyword);
            }
          }
        }
      } catch {
        // silent fallback
      }
    }
    loadStrategies();
    return () => {
      isCancelled = true;
    };
  }, [open, carouselId]);

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

  const handleRegenerate = async (stratId?: CommentStrategyType, kw?: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/carousels/${carouselId}/caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId: stratId || selectedStrategyId,
          keyword: kw !== undefined ? kw : customKeyword,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateCaptionData?.(data);
        if (data.strategies) {
          setStrategies(data.strategies);
        }
        if (data.keyword) {
          setCustomKeyword(data.keyword);
        }
        if (stratId) {
          setSelectedStrategyId(stratId);
        }
      }
    } catch (err) {
      console.error("Regenerate error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyStrategy = async (strategy: CommentStrategy) => {
    setSelectedStrategyId(strategy.id);

    onUpdateCaptionData?.({
      caption: strategy.fullCaption,
      hashtags,
      alternativeTitles,
    });

    try {
      await fetch(`/api/carousels/${carouselId}/caption`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: strategy.fullCaption,
          hashtags,
          alternativeTitles,
        }),
      });
    } catch (err) {
      console.error("Failed to persist strategy caption:", err);
    }
  };

  // Safe slide update: replaces the last slide to avoid duplicate CTA slides
  const handleSyncFinalSlide = async (mode: "replace_last" | "append" = "replace_last") => {
    if (!carouselId) return;
    setIsUpdatingSlide(true);
    setSlideSuccess(null);
    try {
      const res = await fetch(`/api/carousels/${carouselId}/slides/boost-cta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          keyword: customKeyword,
          mode,
        }),
      });
      if (res.ok) {
        setSlideSuccess(mode === "replace_last" ? "Slide finale mise à jour !" : "Slide CTA ajoutée !");
        await onRefreshCarousel?.();
        setTimeout(() => setSlideSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update final slide:", err);
    } finally {
      setIsUpdatingSlide(false);
    }
  };

  const currentStrategy =
    strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const titleBadges = [
    { label: "🎯 Angle Curiosité", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { label: "⚡ Angle Erreur", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "🚀 Angle Action", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm oc-fade">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span>Studio Stratégie Algorithme &amp; Légende</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  Garantie Anti-Shadowban
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Optimisez la vélocité des commentaires et préparez vos publications en 1 clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate()}
              disabled={isGenerating}
              className="text-xs gap-1.5 h-7.5"
            >
              <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin text-accent" : ""}`} />
              <span>{isGenerating ? "Génération..." : "Régénérer"}</span>
            </Button>

            <button
              onClick={() => onOpenChange(false)}
              className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Strategies & A/B Titles (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Anti-Shadowban Checklist Banner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs text-emerald-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Normes Algorithme 2026</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>✓ 4-5 tags max</span>
                <span>✓ Hook &lt;125 car.</span>
                <span>✓ Vélocité com. &lt;60min</span>
              </div>
            </div>

            {/* STRATÉGIE ALGORITHMIQUE */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-foreground">
                    Déclencheur de Commentaires (Vélocité)
                  </span>
                </div>
                {currentStrategy && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentStrategy.multiplier}
                  </span>
                )}
              </div>

              {/* 4 Strategy Cards */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "lead_magnet",
                    title: "🎁 Lead Magnet",
                    badge: "+500%",
                    desc: "Abonne-toi + Mot-clé en DM",
                    icon: Gift,
                  },
                  {
                    id: "debate",
                    title: "⚔️ Vote 1 ou 2",
                    badge: "+300%",
                    desc: "Dilemme tech binaire",
                    icon: Swords,
                  },
                  {
                    id: "expert_challenge",
                    title: "🧠 Défi Senior",
                    badge: "+250%",
                    desc: "Omission d'une règle clé",
                    icon: Brain,
                  },
                  {
                    id: "experience",
                    title: "🔥 Pire Galère",
                    badge: "+200%",
                    desc: "Anecdote en production",
                    icon: Flame,
                  },
                ].map((card) => {
                  const isSelected = selectedStrategyId === card.id;
                  const matchedStrat = strategies.find((s) => s.id === card.id);

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => {
                        if (matchedStrat) {
                          handleApplyStrategy(matchedStrat);
                        } else {
                          handleRegenerate(card.id as CommentStrategyType);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/20 shadow-xs ring-1 ring-cyan-400/40"
                          : "border-border bg-surface/80 hover:bg-muted/40 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {card.title}
                        </span>
                        <span className="text-[9px] font-bold text-cyan-400">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Strategy Action & Slide Sync */}
              {currentStrategy && (
                <div className="bg-background/80 rounded-lg p-3 border border-border/60 space-y-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    💡 {currentStrategy.description}
                  </p>

                  {/* Lead magnet keyword modifier */}
                  {selectedStrategyId === "lead_magnet" && (
                    <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground">
                        Mot-clé DM :
                      </span>
                      <input
                        type="text"
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value.toUpperCase())}
                        placeholder="GUIDE"
                        className="bg-muted px-2 py-0.5 text-xs font-mono font-bold text-accent rounded border border-accent/40 w-24 uppercase focus:outline-hidden focus:ring-1 focus:ring-accent"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => handleRegenerate("lead_magnet", customKeyword)}
                        disabled={isGenerating}
                      >
                        Actualiser
                      </Button>
                      <span className="text-[10px] text-emerald-400 font-mono ml-auto">
                        ✓ ManyChat Ready
                      </span>
                    </div>
                  )}

                  {/* Actions: Sync final slide without duplicates */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={isUpdatingSlide}
                        onClick={() => handleSyncFinalSlide("replace_last")}
                        className="h-7.5 text-xs gap-1.5 font-medium shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                          {isUpdatingSlide ? "Mise à jour..." : "Mettre à jour la slide finale (CTA)"}
                        </span>
                      </Button>

                      <button
                        type="button"
                        disabled={isUpdatingSlide}
                        onClick={() => handleSyncFinalSlide("append")}
                        className="text-[10px] text-muted-foreground hover:text-accent underline pl-1"
                        title="Ajouter comme une slide additionnelle"
                      >
                        + Ajouter en slide supplémentaire
                      </button>
                    </div>

                    {slideSuccess && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        {slideSuccess}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Slide Preview */}
            {currentStrategy && currentStrategy.ctaSlideHtml && (
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-accent" />
                    Aperçu de la Slide Finale Combinée (Gagnant-Gagnant)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSlidePreview(!showSlidePreview)}
                    className="text-[10px] text-accent hover:underline"
                  >
                    {showSlidePreview ? "Masquer" : "Afficher"}
                  </button>
                </div>

                {showSlidePreview && (
                  <div className="rounded-lg border border-border bg-black/80 p-2 flex justify-center overflow-hidden">
                    <div
                      className="rounded shadow-lg overflow-hidden pointer-events-none"
                      style={{
                        width: "360px",
                        height: "450px",
                        transform: "scale(0.7)",
                        transformOrigin: "center center",
                        margin: "-60px 0",
                      }}
                    >
                      <iframe
                        title="Slide Preview"
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;overflow:hidden;background:#0A0A0F;transform-origin:top left;transform:scale(0.33333);width:1080px;height:1350px;}</style></head><body>${currentStrategy.ctaSlideHtml}</body></html>`}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3 Viral Titles Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>3 Suggestions de Titres Viraux (Tests A/B)</span>
                </h3>
              </div>

              <div className="space-y-1.5">
                {alternativeTitles.map((title, idx) => {
                  const badge = titleBadges[idx] || titleBadges[0];
                  const isCurrent = carouselName === title;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 text-xs ${
                        isCurrent
                          ? "border-accent bg-accent/10"
                          : "border-border bg-muted/20 hover:border-accent/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] text-accent font-mono">
                              (Actif)
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground truncate">{title}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onApplyTitle && !isCurrent && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleApplyTitle(title, idx)}
                          >
                            {appliedTitleIndex === idx ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <ArrowRight className="h-3 w-3" />
                            )}
                            <span>{appliedTitleIndex === idx ? "Appliqué" : "Appliquer"}</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleCopy(title, "title", idx)}
                        >
                          {copiedTitleIndex === idx ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedTitleIndex === idx ? "Copié" : "Copier"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full Caption & Hashtags (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Description / Caption */}
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Description / Légende ({caption.length} car.)</span>
                </h3>

                {caption && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    onClick={() => handleCopy(caption, "caption")}
                  >
                    {copiedCaption ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedCaption ? "Copié !" : "Copier"}</span>
                  </Button>
                )}
              </div>

              <div className="flex-1 min-h-[220px]">
                <pre className="h-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[360px]">
                  {caption || "Aucune description générée pour l'instant."}
                </pre>
              </div>
            </div>

            {/* Hashtags Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-accent" />
                  Hashtags Anti-Shadowban ({hashtags.length})
                </span>

                {hashtags.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
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
                    <span>{copiedHashtags ? "Copié !" : "Copier tous"}</span>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleCopy(`#${tag}`, "hashtags")}
                    className="cursor-pointer text-[11px] bg-accent/10 border border-accent/20 text-accent rounded-md px-2 py-0.5 font-mono font-medium hover:bg-accent/20 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Formule Gagnant-Gagnant : Abonne-toi + Cadeau Lead Magnet sur la même slide.
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-7.5"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
