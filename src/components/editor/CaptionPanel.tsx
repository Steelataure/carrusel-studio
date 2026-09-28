"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Hash,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Gift,
  Swords,
  Brain,
  Flame,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommentStrategy, CommentStrategyType } from "@/lib/caption-generator";

interface CaptionPanelProps {
  carouselId?: string;
  carouselName?: string;
  caption?: string;
  hashtags?: string[];
  alternativeTitles?: string[];
  onApplyTitle?: (newTitle: string) => Promise<void>;
  onOpenModal?: () => void;
  onUpdateCaptionData?: (data: {
    caption: string;
    hashtags: string[];
    alternativeTitles: string[];
  }) => void;
  onRefreshCarousel?: () => Promise<void> | void;
}

export function CaptionPanel({
  carouselId,
  carouselName,
  caption,
  hashtags,
  alternativeTitles,
  onApplyTitle,
  onOpenModal,
  onUpdateCaptionData,
  onRefreshCarousel,
}: CaptionPanelProps) {
  const [expanded, setExpanded] = useState(true);
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

  // Fetch initial strategies if carouselId changes
  useEffect(() => {
    if (!carouselId) return;
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
  }, [carouselId]);

  const hasContent =
    (caption && caption.trim()) ||
    (hashtags && hashtags.length > 0) ||
    (alternativeTitles && alternativeTitles.length > 0) ||
    strategies.length > 0;

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

  const handleGenerate = async (stratId?: CommentStrategyType, kw?: string) => {
    if (!carouselId) return;
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
        onUpdateCaptionData?.({
          caption: data.caption,
          hashtags: data.hashtags,
          alternativeTitles: data.alternativeTitles,
        });
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
      console.error("Failed to generate caption:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyStrategy = async (strategy: CommentStrategy) => {
    setSelectedStrategyId(strategy.id);
    if (!carouselId) return;

    // Instantly update local caption and persist
    onUpdateCaptionData?.({
      caption: strategy.fullCaption,
      hashtags: hashtags || [],
      alternativeTitles: alternativeTitles || [],
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

  // Safe Slide Update: Replaces the final CTA slide by default to avoid duplicates
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
    { label: "🎯 Curiosité", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { label: "⚡ Erreur", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "🚀 Action", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  return (
    <div className="border-t border-border bg-surface shrink-0">
      {/* Accordion header bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-b border-border/40">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="font-semibold text-foreground">
            Titres Viraux &amp; Légende Optimisée
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-2.5 w-2.5" />
            Anti-Shadowban
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <TrendingUp className="h-2.5 w-2.5" />
            Booster Commentaires
          </span>
        </button>

        <div className="flex items-center gap-1">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="h-6 px-2 text-[11px] rounded flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Agrandir en fenêtre"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Agrandir</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-3.5 max-h-[340px] overflow-y-auto">
          {!hasContent ? (
            <div className="p-3.5 rounded-xl border border-dashed border-accent/40 bg-accent/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-foreground">
                <Sparkles className="h-4 w-4 text-accent shrink-0" />
                <span>
                  Générez instantanément 3 titres viraux, la légende optimisée et la stratégie de commentaires.
                </span>
              </div>
              <Button
                variant="accent"
                size="sm"
                disabled={isGenerating}
                onClick={() => handleGenerate()}
                className="text-xs gap-1.5 shrink-0 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Génération..." : "Générer avec l'IA"}</span>
              </Button>
            </div>
          ) : (
            <>
              {/* SECTION 1: Stratégies Algorithme (Booster de commentaires) */}
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-foreground">
                      Stratégie Commentaires (Vélocité Algorithme)
                    </span>
                  </div>
                  {currentStrategy && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {currentStrategy.multiplier}
                    </span>
                  )}
                </div>

                {/* 4 Strategy Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "lead_magnet", label: "🎁 Lead Magnet", badge: "+500%", icon: Gift },
                    { id: "debate", label: "⚔️ Vote 1 ou 2", badge: "+300%", icon: Swords },
                    { id: "expert_challenge", label: "🧠 Défi Senior", badge: "+250%", icon: Brain },
                    { id: "experience", label: "🔥 Anecdote", badge: "+200%", icon: Flame },
                  ].map((tab) => {
                    const isSelected = selectedStrategyId === tab.id;
                    const matchedStrat = strategies.find((s) => s.id === tab.id);

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (matchedStrat) {
                            handleApplyStrategy(matchedStrat);
                          } else {
                            handleGenerate(tab.id as CommentStrategyType);
                          }
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 text-foreground font-semibold shadow-xs ring-1 ring-cyan-400/30"
                            : "bg-surface/80 border-border/80 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <span className="text-[11px] truncate">{tab.label}</span>
                        <span className="text-[9px] font-bold text-cyan-400 ml-1">
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Strategy Details & One-Click Final Slide Sync */}
                {currentStrategy && (
                  <div className="bg-background/80 rounded-lg p-2.5 border border-border/60 space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      💡 <strong>{currentStrategy.title}</strong> : {currentStrategy.description}
                    </p>

                    {/* Lead magnet keyword modifier */}
                    {selectedStrategyId === "lead_magnet" && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                        <span className="text-[11px] text-muted-foreground">
                          Mot-clé DM :
                        </span>
                        <div className="flex items-center gap-1.5">
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
                            onClick={() => handleGenerate("lead_magnet", customKeyword)}
                            disabled={isGenerating}
                          >
                            Actualiser
                          </Button>
                        </div>
                        <span className="text-[10px] text-emerald-400/90 font-mono">
                          ✓ Compatible ManyChat &amp; Make
                        </span>
                      </div>
                    )}

                    {/* Single Clean Action: Sync the Final CTA Slide (No duplicates!) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="accent"
                          size="sm"
                          disabled={isUpdatingSlide}
                          onClick={() => handleSyncFinalSlide("replace_last")}
                          className="h-7 text-xs gap-1.5 font-medium shadow-xs"
                          title="Met à jour la dernière slide du carrousel avec cette stratégie"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {isUpdatingSlide ? "Mise à jour..." : "Mettre à jour la slide finale (CTA)"}
                          </span>
                        </Button>

                        <button
                          type="button"
                          disabled={isUpdatingSlide}
                          onClick={() => handleSyncFinalSlide("append")}
                          className="text-[10px] text-muted-foreground hover:text-accent underline pl-1"
                          title="Ajouter comme une slide additionnelle au lieu de remplacer la dernière"
                        >
                          + Ajouter en slide supplémentaire
                        </button>
                      </div>

                      {slideSuccess && (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {slideSuccess}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Suggestions de Titres Viraux (A/B testing) */}
              {alternativeTitles && alternativeTitles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span className="text-[11px] font-semibold text-foreground">
                        3 Titres Viraux Suggérés (Tests A/B)
                      </span>
                    </div>
                    {carouselId && (
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1"
                        title="Générer de nouveaux titres"
                      >
                        <RefreshCw className={`h-2.5 w-2.5 ${isGenerating ? "animate-spin" : ""}`} />
                        <span>Régénérer</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {alternativeTitles.map((title, idx) => {
                      const badge = titleBadges[idx] || titleBadges[0];
                      const isCurrent = carouselName === title;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between gap-2 border rounded-lg p-2 text-xs transition-colors ${
                            isCurrent
                              ? "bg-accent/10 border-accent/60"
                              : "bg-muted/40 border-border/80 hover:border-accent/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md border shrink-0 ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            <span className="font-medium text-foreground truncate">
                              {title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-accent font-mono shrink-0">
                                (Titre actif)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {onApplyTitle && !isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[11px] gap-1 px-2 text-accent hover:bg-accent/15"
                                onClick={() => handleApplyTitle(title, idx)}
                                title="Définir comme titre du carrousel"
                              >
                                {appliedTitleIndex === idx ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span>Appliqué !</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>Appliquer</span>
                                  </>
                                )}
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[11px] gap-1 px-2 hover:bg-muted"
                              onClick={() => handleCopy(title, "title", idx)}
                            >
                              {copiedTitleIndex === idx ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>{copiedTitleIndex === idx ? "Copié !" : "Copier"}</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: Description / Caption */}
              {caption && caption.trim() && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-cyan-400" />
                      <span className="text-[11px] font-semibold text-foreground">
                        Légende Instagram &amp; LinkedIn Optimisée ({caption.length} car.)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] gap-1 px-2 hover:bg-muted font-medium"
                      onClick={() => handleCopy(caption, "caption")}
                    >
                      {copiedCaption ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedCaption ? "Copié !" : "Copier la description"}</span>
                    </Button>
                  </div>
                  <pre className="text-xs text-foreground bg-muted/50 border border-border/70 rounded-lg p-2.5 whitespace-pre-wrap leading-relaxed font-mono max-h-24 overflow-y-auto">
                    {caption}
                  </pre>
                </div>
              )}

              {/* SECTION 4: Hashtags Anti-Shadowban */}
              {hashtags && hashtags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3 text-accent" />
                      Hashtags Ciblés Anti-Shadowban ({hashtags.length})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] gap-1 px-2 hover:bg-muted font-medium"
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
                      <span>{copiedHashtags ? "Copié !" : "Copier tous les hashtags"}</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleCopy(`#${tag}`, "hashtags")}
                        className="cursor-pointer text-[11px] bg-accent/10 border border-accent/20 text-accent rounded-md px-2 py-0.5 font-mono font-medium hover:bg-accent/20 transition-colors"
                        title="Cliquer pour copier ce tag"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
