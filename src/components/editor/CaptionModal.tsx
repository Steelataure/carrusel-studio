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
  PlusCircle,
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
  const [isInsertingSlide, setIsInsertingSlide] = useState(false);
  const [slideSuccess, setSlideSuccess] = useState<string | null>(null);
  const [showSlidePreview, setShowSlidePreview] = useState(false);

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

    // Update parent
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

  const handleInsertBoostSlide = async (mode: "append" | "replace_last" = "append") => {
    if (!carouselId) return;
    setIsInsertingSlide(true);
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
        setSlideSuccess(mode === "replace_last" ? "Slide finale mise à jour !" : "Slide CTA insérée au carrousel !");
        await onRefreshCarousel?.();
        setTimeout(() => setSlideSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to insert boost slide:", err);
    } finally {
      setIsInsertingSlide(false);
    }
  };

  const currentStrategy =
    strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const titleBadges = [
    { label: "🎯 Angle Curiosité", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { label: "⚡ Angle Erreur / Déclic", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "🚀 Angle Résultat / Action", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm oc-fade">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span>Optimiseur Algorithme, Titres &amp; Légende</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  Garantie Anti-Shadowban
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
                  Booster Commentaires
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Stratégies de vélocité d&apos;engagement, A/B testing et formats conformes Instagram/TikTok 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate()}
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
                Vélocité commentaires (&lt;60 min)
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Call-to-action enregistrement 🔖
              </span>
            </div>
          </div>

          {/* STRATÉGIE ALGORITHME : BOOSTER DE COMMENTAIRES */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>Stratégie Algorithmique : Déclencheur de Commentaires</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      Levier #1 de Viralité
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Réduisez la friction mentale pour multiplier par 5 à 10 les commentaires dès la première heure.
                  </p>
                </div>
              </div>

              {currentStrategy && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                  <span>Impact estimé :</span>
                  <strong>{currentStrategy.multiplier}</strong>
                </div>
              )}
            </div>

            {/* Strategy Selectors Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: "lead_magnet",
                  title: "🎁 Lead Magnet",
                  badge: "+500% Com.",
                  desc: "Mot-clé ManyChat / DM. Zéro friction, ressource offerte.",
                  icon: Gift,
                  color: "border-cyan-500/60 bg-cyan-500/10 text-cyan-400",
                },
                {
                  id: "debate",
                  title: "⚔️ Vote 1 ou 2",
                  badge: "+300% Vélocité",
                  desc: "Dilemme binaire tranché. Un seul chiffre à taper.",
                  icon: Swords,
                  color: "border-purple-500/60 bg-purple-500/10 text-purple-400",
                },
                {
                  id: "expert_challenge",
                  title: "🧠 Défi Senior",
                  badge: "+250% Qualifié",
                  desc: "Omission volontaire. Les seniors adorent corriger/compléter.",
                  icon: Brain,
                  color: "border-amber-500/60 bg-amber-500/10 text-amber-400",
                },
                {
                  id: "experience",
                  title: "🔥 Pire Anecdote",
                  badge: "+200% Débat",
                  desc: "Storytelling et bêtise en prod. Connexion humaine forte.",
                  icon: Flame,
                  color: "border-rose-500/60 bg-rose-500/10 text-rose-400",
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
                    className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/20 shadow-md ring-1 ring-cyan-400/40"
                        : "border-border bg-surface/80 hover:bg-muted/40 hover:border-border/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          {card.title}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between w-full">
                      <span className={`text-[10px] font-medium ${isSelected ? "text-cyan-400 font-bold" : "text-muted-foreground"}`}>
                        {isSelected ? "✓ Actif sur la légende" : "Cliquer pour activer"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Strategy Detail & Slide Insertion */}
            {currentStrategy && (
              <div className="bg-background/90 rounded-xl p-4 border border-border/70 space-y-3.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>{currentStrategy.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-mono">
                        {currentStrategy.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentStrategy.description}
                    </p>
                  </div>

                  {/* Lead magnet keyword modifier */}
                  {selectedStrategyId === "lead_magnet" && (
                    <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border border-border shrink-0">
                      <span className="text-xs text-muted-foreground pl-1">
                        Mot-clé DM :
                      </span>
                      <input
                        type="text"
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value.toUpperCase())}
                        placeholder="GUIDE"
                        className="bg-background px-2.5 py-1 text-xs font-mono font-bold text-accent rounded border border-accent/40 w-28 uppercase focus:outline-hidden focus:ring-1 focus:ring-accent"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => handleRegenerate("lead_magnet", customKeyword)}
                        disabled={isGenerating}
                      >
                        Actualiser
                      </Button>
                    </div>
                  )}
                </div>

                {/* Slide CTA actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={isInsertingSlide}
                      onClick={() => handleInsertBoostSlide("append")}
                      className="h-8 text-xs gap-1.5 font-medium shadow-xs"
                      title="Ajouter une slide de fin avec ce call-to-action percutant"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>
                        {isInsertingSlide ? "Insertion..." : "⚡ Insérer la Slide CTA dans le Carrousel"}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isInsertingSlide}
                      onClick={() => handleInsertBoostSlide("replace_last")}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      title="Remplacer la dernière slide existante par ce CTA optimisé"
                    >
                      Remplacer la slide finale existante
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSlidePreview(!showSlidePreview)}
                      className="h-8 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{showSlidePreview ? "Masquer l'aperçu" : "Aperçu visuel de la slide"}</span>
                    </Button>
                  </div>

                  {slideSuccess && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
                      <Check className="h-4 w-4" />
                      {slideSuccess}
                    </span>
                  )}
                </div>

                {/* Optional visual slide preview */}
                {showSlidePreview && currentStrategy.ctaSlideHtml && (
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Aperçu du visuel de la Slide CTA générée :
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Conforme au thème sombre &amp; Safe-zones
                      </span>
                    </div>
                    <div className="rounded-xl border border-border bg-black/60 p-4 flex justify-center overflow-hidden">
                      <div
                        className="rounded-lg shadow-xl overflow-hidden pointer-events-none origin-top"
                        style={{
                          width: "360px",
                          height: "450px",
                          transform: "scale(0.85)",
                          transformOrigin: "center center",
                        }}
                      >
                        <iframe
                          title="Slide CTA Preview"
                          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;overflow:hidden;background:#0A0A0F;transform-origin:top left;transform:scale(0.33333);width:1080px;height:1350px;}</style></head><body>${currentStrategy.ctaSlideHtml}</body></html>`}
                          className="w-full h-full border-none"
                          sandbox="allow-scripts"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                <span>Description / Légende Instagram &amp; LinkedIn</span>
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
            Formatez vos publications et maximisez l&apos;algorithme en 1 clic
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
