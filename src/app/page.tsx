"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Layers,
  Calendar,
  SlidersHorizontal,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateCarouselDialog } from "@/components/ui/create-carousel-dialog";
import { BrandSetup } from "@/components/brand/BrandSetup";
import { SlideRenderer } from "@/components/editor/SlideRenderer";
import { TemplateGallery } from "@/components/templates/TemplateGallery";
import type { Carousel } from "@/types/carousel";
import type { BrandConfig } from "@/types/brand";

type TabFilter = "all" | "draft" | "published" | "templates";

export default function DashboardPage() {
  const router = useRouter();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBrandSetup, setShowBrandSetup] = useState(false);
  const [brand, setBrand] = useState<BrandConfig | null>(null);

  // Tab & Drag state
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<"draft" | "published" | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/carousels").then((r) => r.json()),
      fetch("/api/brand").then((r) => r.json()),
    ])
      .then(([carouselData, brandData]) => {
        setCarousels(carouselData.carousels || []);
        setBrand(brandData);
        if (!brandData.name || brandData.name.trim() === "") {
          setShowBrandSetup(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const handleDelete = useCallback((e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setConfirmState({
      open: true,
      title: `Supprimer "${name}" ?`,
      description: "Cette action supprimera définitivement le carrousel et ses slides.",
      onConfirm: async () => {
        const res = await fetch(`/api/carousels/${id}`, { method: "DELETE" });
        if (res.ok) {
          setCarousels((prev) => prev.filter((c) => c.id !== id));
        }
      },
    });
  }, []);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreate = useCallback(async (name: string, aspectRatio: string) => {
    const res = await fetch("/api/carousels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        aspectRatio,
      }),
    });
    if (res.ok) {
      const carousel = await res.json();
      router.push(`/carousel/${carousel.id}`);
    }
  }, [router]);

  // Update status (published vs draft)
  const handleUpdateStatus = useCallback(async (id: string, newStatus: "draft" | "published") => {
    const publishedAt = newStatus === "published" ? new Date().toISOString() : null;
    const target = carousels.find((c) => c.id === id);
    const name = target?.name || "Carrousel";

    // Optimistic UI update
    setCarousels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, publishedAt } : c))
    );

    setToast({
      message:
        newStatus === "published"
          ? `"${name}" marqué comme publié ! 🎉`
          : `"${name}" remis en brouillon / à publier.`,
      type: "success",
    });
    setTimeout(() => setToast(null), 3000);

    try {
      await fetch(`/api/carousels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, publishedAt }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }, [carousels]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverTab(null);
  };

  const handleTabDragOver = (e: React.DragEvent, target: "draft" | "published") => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTab !== target) {
      setDragOverTab(target);
    }
  };

  const handleTabDrop = (e: React.DragEvent, target: "draft" | "published") => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDragOverTab(null);
    if (id) {
      handleUpdateStatus(id, target);
    }
  };

  // Filtered lists
  const drafts = useMemo(() => carousels.filter((c) => c.status !== "published"), [carousels]);
  const published = useMemo(() => carousels.filter((c) => c.status === "published"), [carousels]);

  const displayedCarousels = useMemo(() => {
    if (activeTab === "published") return published;
    if (activeTab === "draft") return drafts;
    return carousels;
  }, [activeTab, carousels, drafts, published]);

  return (
    <div className="h-full flex flex-col">
      <TopBar onSettingsClick={() => setShowBrandSetup(true)} />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={confirmState.onConfirm}
      />

      <CreateCarouselDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />

      <BrandSetup
        open={showBrandSetup}
        onComplete={() => {
          setShowBrandSetup(false);
          fetch("/api/brand")
            .then((r) => r.json())
            .then((data) => setBrand(data))
            .catch(() => {});
        }}
        initialBrand={brand || undefined}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 oc-enter-pop px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-surface/95 backdrop-blur-md shadow-2xl text-sm font-medium flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toast.message}</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Open Carrusel</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Générateur de carrousels viraux avec IA
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} variant="accent">
              <Plus className="h-4 w-4" />
              Nouveau Carrousel
            </Button>
          </div>

          {/* Navigation Tabs with Drag & Drop Status Zones */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-border pb-px">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {/* Tous */}
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "all"
                    ? "border-accent text-foreground font-semibold bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Tous</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                  {carousels.length}
                </span>
              </button>

              {/* À publier (Drop Target) */}
              <div
                onDragOver={(e) => handleTabDragOver(e, "draft")}
                onDragLeave={() => setDragOverTab(null)}
                onDrop={(e) => handleTabDrop(e, "draft")}
                className="relative"
              >
                <button
                  onClick={() => setActiveTab("draft")}
                  className={`px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "draft"
                      ? "border-accent text-foreground font-semibold bg-accent/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  } ${
                    dragOverTab === "draft"
                      ? "ring-2 ring-cyan-400 bg-cyan-500/20 text-cyan-300 scale-105"
                      : draggingId
                      ? "border-dashed border-cyan-500/60 animate-pulse bg-cyan-500/5"
                      : ""
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>À publier</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                    {drafts.length}
                  </span>
                  {dragOverTab === "draft" && (
                    <span className="text-[11px] font-bold text-cyan-300 ml-1">
                      Déposer ici !
                    </span>
                  )}
                </button>
              </div>

              {/* Publiés (Drop Target) */}
              <div
                onDragOver={(e) => handleTabDragOver(e, "published")}
                onDragLeave={() => setDragOverTab(null)}
                onDrop={(e) => handleTabDrop(e, "published")}
                className="relative"
              >
                <button
                  onClick={() => setActiveTab("published")}
                  className={`px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "published"
                      ? "border-emerald-400 text-foreground font-semibold bg-emerald-500/10"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  } ${
                    dragOverTab === "published"
                      ? "ring-2 ring-emerald-400 bg-emerald-500/30 text-emerald-300 scale-105"
                      : draggingId
                      ? "border-dashed border-emerald-500/60 animate-pulse bg-emerald-500/5"
                      : ""
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Publiés</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {published.length}
                  </span>
                  {dragOverTab === "published" && (
                    <span className="text-[11px] font-bold text-emerald-300 ml-1 animate-bounce">
                      ✓ Déposer pour publier !
                    </span>
                  )}
                </button>
              </div>

              {/* Modèles */}
              <button
                onClick={() => setActiveTab("templates")}
                className={`px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "templates"
                    ? "border-accent text-foreground font-semibold bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Modèles</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Hint Banner */}
          {draggingId && (
            <div className="mb-6 p-3 rounded-xl border border-dashed border-accent bg-accent/10 text-xs text-foreground flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-accent" />
                <span>
                  Glissez ce carrousel sur l&apos;onglet <strong>Publiés</strong> ou <strong>À publier</strong> pour modifier son statut instantanément.
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">Relâchez pour annuler</span>
            </div>
          )}

          {activeTab === "templates" ? (
            <TemplateGallery />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : displayedCarousels.length === 0 ? (
            <div className="text-center py-20">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                {activeTab === "published"
                  ? "Aucun carrousel publié pour le moment"
                  : activeTab === "draft"
                  ? "Aucun carrousel en attente"
                  : "Aucun carrousel pour l'instant"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {activeTab === "published"
                  ? "Glissez vos carrousels terminés sur l'onglet 'Publiés' ou cliquez sur le badge du carrousel pour les marquer comme publiés."
                  : "Créez votre premier carrousel Instagram. L'assistant IA vous aidera à concevoir de superbes slides."}
              </p>
              {activeTab !== "published" && (
                <Button onClick={() => setShowCreateDialog(true)} variant="accent" size="lg">
                  <Plus className="h-5 w-5" />
                  Créer un Carrousel
                </Button>
              )}
            </div>
          ) : (
            <div className="oc-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCarousels.map((carousel) => {
                const isPublished = carousel.status === "published";
                return (
                  <div
                    key={carousel.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, carousel.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => router.push(`/carousel/${carousel.id}`)}
                    className={`relative text-left rounded-xl border bg-surface p-4 group cursor-grab active:cursor-grabbing transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      draggingId === carousel.id
                        ? "opacity-30 scale-95 border-dashed border-accent shadow-none"
                        : "hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5 border-border"
                    }`}
                  >
                    {/* Top status toggle badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(carousel.id, isPublished ? "draft" : "published");
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shadow-sm ${
                          isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-surface/90 text-muted-foreground border border-border hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                        title={
                          isPublished
                            ? "Marqué comme publié (cliquer pour remettre en 'À publier')"
                            : "Cliquer pour marquer comme publié (ou glisser vers l'onglet 'Publiés')"
                        }
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Publié</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>À publier</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Card top-right actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await fetch(`/api/carousels/${carousel.id}/duplicate`, {
                            method: "POST",
                          });
                          if (res.ok) {
                            const dup = await res.json();
                            setCarousels((prev) => [dup, ...prev]);
                          }
                        }}
                        className="h-7 w-7 rounded-lg flex items-center justify-center bg-surface border border-border hover:bg-muted"
                        aria-label={`Dupliquer ${carousel.name}`}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, carousel.id, carousel.name)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center bg-surface border border-border hover:bg-destructive hover:text-white hover:border-destructive"
                        aria-label={`Supprimer ${carousel.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail preview */}
                    <div className="h-32 rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden relative">
                      {carousel.slides.length > 0 ? (
                        <SlideRenderer
                          html={carousel.slides[0].html}
                          aspectRatio={carousel.aspectRatio}
                          className="w-full h-full"
                        />
                      ) : (
                        <Layers className="h-8 w-8 text-muted-foreground/30" />
                      )}

                      {/* Drag hint on hover */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity bg-black/60 p-1 rounded backdrop-blur text-white">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors truncate">
                      {carousel.name}
                    </h3>

                    <div className="flex items-center justify-between gap-2 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          <SlidersHorizontal className="h-2.5 w-2.5 mr-1" />
                          {carousel.aspectRatio}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3" />
                          {new Date(carousel.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isPublished && (
                        <span className="text-[10px] font-medium text-emerald-400">
                          En ligne
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
