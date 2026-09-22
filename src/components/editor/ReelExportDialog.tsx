"use client";

import { useState, useRef, useEffect } from "react";
import {
  Film,
  Download,
  Play,
  Pause,
  Sparkles,
  Music,
  Check,
  X,
  Sliders,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioEngine, CURATED_TRACKS } from "@/lib/audio-engine";
import type { Slide } from "@/types/carousel";

interface ReelExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: Slide[];
  carouselName: string;
  carouselId: string;
}

type TransitionType = "fade" | "slide" | "zoom";

export function ReelExportDialog({
  open,
  onOpenChange,
  slides,
  carouselName,
  carouselId,
}: ReelExportDialogProps) {
  const [slideDurationSec, setSlideDurationSec] = useState(3);
  const [transition, setTransition] = useState<TransitionType>("fade");
  const [selectedTrack, setSelectedTrack] = useState<string>("cyberpunk-neon");
  const [playingPreviewTrack, setPlayingPreviewTrack] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Clean up blob URL on unmount or new generation
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Stop audio playback when modal closes or unmounts
  useEffect(() => {
    if (!open) {
      if (audioEngine) audioEngine.stop();
      setPlayingPreviewTrack(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (audioEngine) audioEngine.stop();
    };
  }, []);

  const toggleTrackPreview = (trackId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTrack(trackId);
    if (!audioEngine) return;

    if (playingPreviewTrack === trackId) {
      audioEngine.stop();
      setPlayingPreviewTrack(null);
    } else {
      audioEngine.play(trackId);
      setPlayingPreviewTrack(trackId);
    }
  };

  const handleGenerateReel = async () => {
    if (slides.length === 0 || isGenerating) return;

    // Stop any ongoing preview before starting generation
    if (audioEngine) audioEngine.stop();
    setPlayingPreviewTrack(null);

    setIsGenerating(true);
    setError(null);
    setProgress(5);
    setStatusText("Rendu des slides HD...");
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    let recorder: MediaRecorder | null = null;
    let animFrameId: number | null = null;

    try {
      const width = 1080;
      const height = 1920; // 9:16 Reel standard
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("Impossible d'initialiser le Canvas");

      // 1. Fetch rendered HD PNG frames from server pipeline
      setProgress(15);
      setStatusText("Génération des visuels 1080x1920...");

      const framesRes = await fetch(`/api/carousels/${carouselId}/frames`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratio: "9:16", slides }),
      });

      if (!framesRes.ok) {
        const errJson = await framesRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Échec du rendu des frames");
      }

      const framesData = await framesRes.json();
      const frames: { dataUrl: string }[] = framesData.frames || [];
      if (frames.length === 0) {
        throw new Error("Aucune image générée");
      }

      // 2. Load all PNG frames as real HTMLImageElements
      setStatusText("Chargement des images...");
      setProgress(35);
      const loadedImages: HTMLImageElement[] = [];

      for (let i = 0; i < frames.length; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Impossible de charger l'image ${i + 1}`));
          img.src = frames[i].dataUrl;
        });
        loadedImages.push(img);
        setProgress(Math.round(35 + ((i + 1) / frames.length) * 15));
      }

      // 3. Setup Audio
      let audioStreamNode: MediaStreamAudioDestinationNode | null = null;
      if (selectedTrack !== "none" && audioEngine) {
        try {
          audioStreamNode = audioEngine.getMediaStreamDestination();
          await audioEngine.play(selectedTrack);
        } catch (audioErr) {
          console.warn("Audio playback not available:", audioErr);
        }
      }

      // 4. Setup MediaRecorder
      const fps = 30;
      const canvasStream = canvas.captureStream(fps);
      const tracks = [...canvasStream.getVideoTracks()];
      if (audioStreamNode) {
        tracks.push(...audioStreamNode.stream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);

      let mimeType = "video/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,mp4a")) {
          mimeType = "video/mp4;codecs=avc1,mp4a";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          mimeType = "video/mp4";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          mimeType = "video/webm;codecs=vp9,opus";
        }
      }

      recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high quality
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve) => {
        if (!recorder) return;
        recorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          resolve(finalBlob);
        };
      });

      recorder.start(100);

      // 5. Animate through all slides
      setStatusText("Enregistrement de la vidéo...");
      const slideDurationMs = slideDurationSec * 1000;
      const transitionDurationMs = 600; // 0.6s transition
      const totalSlides = loadedImages.length;
      const totalDurationMs = totalSlides * slideDurationMs;

      const startTime = performance.now();

      await new Promise<void>((resolveAnim, rejectAnim) => {
        const renderFrame = (now: number) => {
          try {
            const elapsed = now - startTime;
            if (elapsed >= totalDurationMs) {
              resolveAnim();
              return;
            }

            const currentProgress = Math.min(99, Math.round(50 + (elapsed / totalDurationMs) * 49));
            setProgress(currentProgress);

            const slideIndex = Math.min(
              totalSlides - 1,
              Math.floor(elapsed / slideDurationMs)
            );
            const timeIntoSlide = elapsed - slideIndex * slideDurationMs;
            const nextIndex = Math.min(totalSlides - 1, slideIndex + 1);

            const currentImg = loadedImages[slideIndex];
            const nextImg = loadedImages[nextIndex];

            ctx.fillStyle = "#0A0A0F";
            ctx.fillRect(0, 0, width, height);

            // Transition timing
            const isTransitioning =
              timeIntoSlide > slideDurationMs - transitionDurationMs &&
              slideIndex < totalSlides - 1;
            const transitionProgress = isTransitioning
              ? (timeIntoSlide - (slideDurationMs - transitionDurationMs)) / transitionDurationMs
              : 0;

            if (currentImg && currentImg instanceof HTMLImageElement) {
              if (transition === "fade") {
                // Draw current slide
                ctx.globalAlpha = 1;
                ctx.drawImage(currentImg, 0, 0, width, height);

                if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
                  ctx.globalAlpha = transitionProgress;
                  ctx.drawImage(nextImg, 0, 0, width, height);
                  ctx.globalAlpha = 1;
                }
              } else if (transition === "slide") {
                const ease = 0.5 - Math.cos(transitionProgress * Math.PI) / 2;
                const offset = isTransitioning ? ease * width : 0;

                ctx.drawImage(currentImg, -offset, 0, width, height);
                if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
                  ctx.drawImage(nextImg, width - offset, 0, width, height);
                }
              } else {
                // Zoom (Ken Burns)
                const zoomScale = 1.0 + (timeIntoSlide / slideDurationMs) * 0.05;
                const zw = width * zoomScale;
                const zh = height * zoomScale;
                const zx = (width - zw) / 2;
                const zy = (height - zh) / 2;

                ctx.globalAlpha = 1;
                ctx.drawImage(currentImg, zx, zy, zw, zh);

                if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
                  ctx.globalAlpha = transitionProgress;
                  ctx.drawImage(nextImg, 0, 0, width, height);
                  ctx.globalAlpha = 1;
                }
              }
            }

            animFrameId = requestAnimationFrame(renderFrame);
          } catch (err) {
            rejectAnim(err);
          }
        };

        animFrameId = requestAnimationFrame(renderFrame);
      });

      // 6. Stop recorder and audio
      setStatusText("Finalisation...");
      if (recorder.state === "recording") {
        recorder.stop();
      }
      if (audioEngine) {
        audioEngine.stop();
      }

      const blob = await recordPromise;
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setProgress(100);
      setStatusText("Prêt !");
    } catch (err) {
      console.error("Reel generation failed:", err);
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la génération de la vidéo";
      setError(errMsg);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (recorder && recorder.state === "recording") {
        try { recorder.stop(); } catch {}
      }
      if (audioEngine) audioEngine.stop();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const cleanTitle = carouselName
      ? carouselName.trim().replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, "-")
      : `reel-${carouselId}`;

    const ext = videoBlob?.type.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${cleanTitle}-reel.${ext}`;
    a.click();
  };

  const togglePreviewPlay = () => {
    if (!videoPreviewRef.current) return;
    if (videoPreviewRef.current.paused) {
      videoPreviewRef.current.play();
      setIsPlayingPreview(true);
    } else {
      videoPreviewRef.current.pause();
      setIsPlayingPreview(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm oc-fade">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span>Générateur de Reel & Vidéo 9:16</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-medium">
                  TikTok • Reels • Shorts
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Transformez vos slides en vidéo animée verticale avec musique d&apos;ambiance intégrée.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Split: Settings on Left, Video Player on Right */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Settings Panel */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-border space-y-5">
            {/* Slide Duration Setting */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center justify-between text-foreground">
                <span>Durée par slide</span>
                <span className="text-accent font-mono">{slideDurationSec} secondes</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSlideDurationSec(sec)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      slideDurationSec === sec
                        ? "border-accent bg-accent/10 text-accent font-bold shadow-xs"
                        : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {sec} secondes
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Durée totale estimée : {slides.length * slideDurationSec}s pour {slides.length} slides.
              </p>
            </div>

            {/* Transition Style with Live Preview */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Sliders className="h-3.5 w-3.5 text-accent" />
                  <span>Transition entre slides</span>
                </label>
                <span className="text-[11px] font-mono text-accent">
                  {transition === "fade" ? "Fondu doux" : transition === "slide" ? "Glissement" : "Zoom lent"}
                </span>
              </div>

              {/* Live Interactive Transition Demo Screen */}
              <div className="relative h-18 w-full rounded-xl bg-black/50 border border-border/80 overflow-hidden flex items-center justify-between px-3.5 py-2 shadow-inner">
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Aperçu de la transition</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {transition === "fade" && "Crossfade fluide : fondu enchaîné subtil et continu entre chaque slide."}
                    {transition === "slide" && "Push horizontal : glissement latéral cinématographique dynamique."}
                    {transition === "zoom" && "Effet Ken Burns : grossissement immersif et élégant."}
                  </p>
                </div>

                {/* Mini screen mockup */}
                <div className="relative w-11 h-14 rounded-md overflow-hidden border border-white/20 bg-slate-950 shrink-0 shadow-md">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-1 flex flex-col justify-between text-indigo-300 font-mono text-[7px] font-bold ${
                      transition === "slide" ? "reel-demo-slide-a" : ""
                    }`}
                  >
                    <div className="h-1 w-3 bg-indigo-400/60 rounded-xs" />
                    <span className="text-right opacity-70">#01</span>
                  </div>

                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-1 flex flex-col justify-between text-emerald-300 font-mono text-[7px] font-bold ${
                      transition === "fade"
                        ? "reel-demo-fade-b"
                        : transition === "slide"
                        ? "reel-demo-slide-b"
                        : "reel-demo-zoom-b"
                    }`}
                  >
                    <div className="h-1 w-3 bg-emerald-400/60 rounded-xs" />
                    <span className="text-right opacity-70">#02</span>
                  </div>
                </div>
              </div>

              {/* 3 Transition Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "fade", label: "Fondu doux", desc: "Crossfade fluide" },
                  { id: "slide", label: "Glissement", desc: "Push horizontal" },
                  { id: "zoom", label: "Zoom lent", desc: "Effet Ken Burns" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTransition(t.id as TransitionType)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      transition === t.id
                        ? "border-accent bg-accent/10 text-accent font-semibold shadow-xs"
                        : "border-border text-muted-foreground hover:border-accent/40 bg-surface/30 hover:bg-surface"
                    }`}
                  >
                    <p className="text-xs font-medium">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Soundscape Track with Live Preview Player */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Music className="h-3.5 w-3.5 text-accent" />
                  <span>Musique d&apos;ambiance intégrée</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                  {CURATED_TRACKS.length} styles • 100% libre de droit
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 rounded-xl">
                {CURATED_TRACKS.map((track) => {
                  const isCurrent = selectedTrack === track.id;
                  const isPlaying = playingPreviewTrack === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setSelectedTrack(track.id);
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                        isCurrent
                          ? "border-accent bg-accent/10 shadow-xs"
                          : "border-border/80 hover:border-accent/40 bg-surface/30 hover:bg-surface/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Play/Stop Preview Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleTrackPreview(track.id, e)}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            isPlaying
                              ? "bg-accent text-accent-foreground shadow-md scale-105"
                              : "bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent border border-border/60"
                          }`}
                          title={isPlaying ? "Arrêter l'écoute" : "Écouter l'extrait audio"}
                        >
                          {isPlaying ? (
                            <VolumeX className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {track.name}
                            </p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                              {track.bpm} BPM
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent/15 text-accent font-medium">
                              {track.genre}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {track.vibe}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isPlaying && (
                          <div className="flex items-end gap-0.5 h-3 px-1.5 py-0.5 bg-accent/20 rounded-full">
                            <span className="w-0.5 bg-accent rounded-full animate-bounce h-full" />
                            <span className="w-0.5 bg-accent rounded-full animate-bounce h-2/3 [animation-delay:150ms]" />
                            <span className="w-0.5 bg-accent rounded-full animate-bounce h-4/5 [animation-delay:300ms]" />
                          </div>
                        )}
                        {isCurrent ? (
                          <div className="h-4 w-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-border/80" />
                        )}
                      </div>
                    </div>
                  );
                })}

                <div
                  onClick={() => {
                    setSelectedTrack("none");
                    if (audioEngine) audioEngine.stop();
                    setPlayingPreviewTrack(null);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                    selectedTrack === "none"
                      ? "border-accent bg-accent/10 shadow-xs"
                      : "border-border/80 hover:border-accent/40 bg-surface/30 hover:bg-surface/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                      <VolumeX className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Sans musique (audio muet)</p>
                      <p className="text-[10px] text-muted-foreground">
                        Idéal pour ajouter un son viral trending directement sur Instagram ou TikTok.
                      </p>
                    </div>
                  </div>
                  {selectedTrack === "none" ? (
                    <div className="h-4 w-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border/80 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2 space-y-2">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <span className="font-semibold">Erreur :</span> {error}
                </div>
              )}

              <Button
                variant="accent"
                onClick={handleGenerateReel}
                disabled={isGenerating}
                className="w-full text-xs h-10 gap-2 font-medium shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{statusText || "Génération en cours..."} ({progress}%)</span>
                  </>
                ) : (
                  <>
                    <Film className="h-4 w-4" />
                    <span>{videoUrl ? "Régénérer le Reel 9:16" : "Générer la vidéo Reel 9:16"}</span>
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Video Preview Screen */}
          <div className="w-full md:w-[380px] bg-background/60 p-6 flex flex-col items-center justify-center shrink-0">
            {videoUrl ? (
              <div className="flex flex-col items-center w-full max-w-[270px]">
                <div className="relative rounded-2xl overflow-hidden border-2 border-accent/40 shadow-2xl bg-black aspect-[9/16] w-full">
                  <video
                    ref={videoPreviewRef}
                    src={videoUrl}
                    controls={false}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={togglePreviewPlay}
                  />

                  {/* Overlay Play/Pause Button */}
                  <button
                    onClick={togglePreviewPlay}
                    className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {isPlayingPreview ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between w-full mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Prêt à exporter
                  </span>
                  <span>{slides.length * slideDurationSec}s</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground max-w-[240px]">
                <div className="w-24 h-40 border-2 border-dashed border-border rounded-xl mx-auto mb-3 flex items-center justify-center bg-surface/50">
                  <Film className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-xs font-semibold text-foreground">Aperçu du Reel</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Cliquez sur &quot;Générer la vidéo&quot; pour lancer le rendu haute définition.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Canvas used for rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Résolution : 1080 × 1920 (9:16 Full HD)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Fermer
            </Button>

            {videoUrl && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleDownload}
                className="text-xs gap-1.5 font-semibold shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger la Vidéo</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes reelDemoFade {
              0%, 30% { opacity: 0; }
              50%, 80% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes reelDemoSlideA {
              0%, 30% { transform: translateX(0%); }
              50%, 80% { transform: translateX(-100%); }
              100% { transform: translateX(0%); }
            }
            @keyframes reelDemoSlideB {
              0%, 30% { transform: translateX(100%); }
              50%, 80% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
            @keyframes reelDemoZoomB {
              0%, 25% { transform: scale(1); opacity: 0; }
              35% { opacity: 1; }
              40%, 85% { transform: scale(1.18); opacity: 1; }
              95%, 100% { transform: scale(1); opacity: 0; }
            }
            .reel-demo-fade-b {
              animation: reelDemoFade 3s infinite ease-in-out;
            }
            .reel-demo-slide-a {
              animation: reelDemoSlideA 3s infinite ease-in-out;
            }
            .reel-demo-slide-b {
              animation: reelDemoSlideB 3s infinite ease-in-out;
            }
            .reel-demo-zoom-b {
              animation: reelDemoZoomB 3s infinite ease-in-out;
            }
          `,
        }}
      />
    </div>
  );
}
