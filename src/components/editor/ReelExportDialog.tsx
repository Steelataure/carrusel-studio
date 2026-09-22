"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  Upload,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  audioEngine,
  CURATED_TRACKS,
  getRecommendedTrack,
  TrackCategory,
} from "@/lib/audio-engine";
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
  const recommendedTrack = useMemo(
    () => getRecommendedTrack(slides, carouselName),
    [slides, carouselName]
  );
  const [slideDurationSec, setSlideDurationSec] = useState(3);
  const [transition, setTransition] = useState<TransitionType>("fade");
  const [selectedTrack, setSelectedTrack] = useState<string>(() => recommendedTrack.id);
  const [categoryFilter, setCategoryFilter] = useState<TrackCategory | "all">("all");
  const [playingPreviewTrack, setPlayingPreviewTrack] = useState<string | null>(null);

  // Custom Audio File State
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const customAudioInputRef = useRef<HTMLInputElement | null>(null);
  const customPreviewAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Clean up custom audio URL
  useEffect(() => {
    return () => {
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
    };
  }, [customAudioUrl]);

  // Auto-sync recommendation if slides change
  useEffect(() => {
    if (selectedTrack !== "none" && selectedTrack !== "custom") {
      setSelectedTrack(recommendedTrack.id);
    }
  }, [recommendedTrack.id]);

  // Subscribe to audio engine changes
  useEffect(() => {
    if (!audioEngine) return;
    const unsub = audioEngine.subscribe((playing, trackId) => {
      if (!playing) setPlayingPreviewTrack(null);
      else setPlayingPreviewTrack(trackId);
    });
    return unsub;
  }, []);

  // Stop audio playback when modal closes or unmounts
  useEffect(() => {
    if (!open) {
      if (audioEngine) audioEngine.stop();
      if (customPreviewAudioRef.current) customPreviewAudioRef.current.pause();
      setIsPlayingCustom(false);
      setPlayingPreviewTrack(null);
    }
  }, [open]);

  useEffect(() => {
    const previewEl = customPreviewAudioRef.current;
    return () => {
      if (audioEngine) audioEngine.stop();
      if (previewEl) previewEl.pause();
    };
  }, []);

  const toggleTrackPreview = (trackId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTrack(trackId);
    if (customPreviewAudioRef.current) {
      customPreviewAudioRef.current.pause();
      setIsPlayingCustom(false);
    }
    if (!audioEngine) return;

    if (playingPreviewTrack === trackId) {
      audioEngine.stop();
      setPlayingPreviewTrack(null);
    } else {
      audioEngine.play(trackId);
      setPlayingPreviewTrack(trackId);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    const url = URL.createObjectURL(file);
    setCustomAudioFile(file);
    setCustomAudioUrl(url);
    setSelectedTrack("custom");
    if (audioEngine) audioEngine.stop();
    setPlayingPreviewTrack(null);
  };

  const toggleCustomPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTrack("custom");
    if (!customPreviewAudioRef.current || !customAudioUrl) return;

    if (isPlayingCustom) {
      customPreviewAudioRef.current.pause();
      setIsPlayingCustom(false);
    } else {
      if (audioEngine) audioEngine.stop();
      setPlayingPreviewTrack(null);
      customPreviewAudioRef.current.currentTime = 0;
      customPreviewAudioRef.current
        .play()
        .then(() => setIsPlayingCustom(true))
        .catch(() => {});
    }
  };

  const removeCustomAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (customPreviewAudioRef.current) customPreviewAudioRef.current.pause();
    setIsPlayingCustom(false);
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    setCustomAudioUrl(null);
    setCustomAudioFile(null);
    setSelectedTrack(recommendedTrack.id);
  };

  const handleGenerateReel = async () => {
    if (slides.length === 0 || isGenerating) return;

    // Stop any ongoing preview before starting generation
    if (audioEngine) audioEngine.stop();
    if (customPreviewAudioRef.current) customPreviewAudioRef.current.pause();
    setIsPlayingCustom(false);
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
    let customAudioPlaybackEl: HTMLAudioElement | null = null;
    let customAudioCtx: AudioContext | null = null;
    let trackAudioCtx: AudioContext | null = null;
    let stopStreamAudio: (() => void) | null = null;

    try {
      // 1. Prepare offscreen canvas
      const width = 1080;
      const height = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible de créer le contexte 2D Canvas");

      // 2. Load rendered frames from server HD export route
      setStatusText("Génération des frames HD...");
      const framesRes = await fetch(`/api/carousels/${carouselId}/frames`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratio: "auto", slides }),
      });

      if (!framesRes.ok) {
        const errData = await framesRes.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur de génération des slides HD sur le serveur");
      }

      const data = await framesRes.json();
      const rawList = data.dataUrls || data.frames || [];
      const frameUrls: string[] = rawList
        .map((f: unknown) => {
          if (typeof f === "string") return f;
          if (typeof f === "object" && f !== null && "dataUrl" in f) {
            return (f as { dataUrl: string }).dataUrl;
          }
          return "";
        })
        .filter(Boolean);

      if (frameUrls.length === 0) {
        throw new Error("Aucune image n'a été retournée par le serveur");
      }

      setProgress(35);
      setStatusText("Préparation des médias...");

      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < frameUrls.length; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Slide ${i + 1} n'a pas pu être décodée`));
          img.src = frameUrls[i];
        });
        loadedImages.push(img);
        setProgress(Math.round(35 + ((i + 1) / frameUrls.length) * 15));
      }

      // Pre-render small blurred background for each slide once to eliminate heavy runtime ctx.filter
      const bgCanvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        const bgC = document.createElement("canvas");
        bgC.width = 360;
        bgC.height = 640;
        const bgCtx = bgC.getContext("2d");
        if (bgCtx) {
          bgCtx.fillStyle = "#0A0A0F";
          bgCtx.fillRect(0, 0, bgC.width, bgC.height);

          const imgW = img.width || width;
          const imgH = img.height || height;
          const scale = Math.max(bgC.width / imgW, bgC.height / imgH) * 1.15;
          const sw = imgW * scale;
          const sh = imgH * scale;
          const sx = (bgC.width - sw) / 2;
          const sy = (bgC.height - sh) / 2;

          bgCtx.filter = "blur(18px) brightness(0.35) saturate(1.4)";
          bgCtx.drawImage(img, sx, sy, sw, sh);
          bgCtx.filter = "none";

          bgCtx.fillStyle = "rgba(10, 10, 15, 0.35)";
          bgCtx.fillRect(0, 0, bgC.width, bgC.height);
        }
        bgCanvases.push(bgC);
      }

      // Timing constants: each slide stays fully visible and readable for slideDurationSec,
      // then transitions smoothly for transitionDurationMs.
      const staticDurationMs = slideDurationSec * 1000;
      const transitionDurationMs = 500; // 0.5s smooth transition
      const totalSlides = loadedImages.length;
      const slideCycleMs = staticDurationMs + transitionDurationMs;
      // Last slide holds for static duration + transition buffer
      const totalDurationMs = (totalSlides - 1) * slideCycleMs + (staticDurationMs + transitionDurationMs);

      // Reusable frame renderer (ultra-fast: < 0.1ms per frame, no runtime filter computation)
      const drawReelFrame = (
        slideIndex: number,
        timeIntoSlide: number,
        isTransitioning: boolean,
        transitionProgress: number
      ) => {
        const nextIndex = Math.min(totalSlides - 1, slideIndex + 1);
        const currentImg = loadedImages[slideIndex];
        const nextImg = loadedImages[nextIndex];
        if (!currentImg) return;

        const currentW = currentImg.width || width;
        const currentH = currentImg.height || height;
        const isVerticalFull = currentH >= height;
        const currentY = isVerticalFull ? 0 : Math.round((height - currentH) / 2);

        const nextH = nextImg ? nextImg.height || height : height;
        const nextY = nextH >= height ? 0 : Math.round((height - nextH) / 2);

        // 1. Ambient Background (smoothly blended pre-rendered glows)
        ctx.save();
        ctx.fillStyle = "#0A0A0F";
        ctx.fillRect(0, 0, width, height);

        if (!isVerticalFull && bgCanvases[slideIndex]) {
          if (isTransitioning && bgCanvases[nextIndex]) {
            if (transition === "slide") {
              const ease = 0.5 - Math.cos(transitionProgress * Math.PI) / 2;
              const bgOffset = ease * width;
              ctx.drawImage(bgCanvases[slideIndex], -bgOffset, 0, width, height);
              ctx.drawImage(bgCanvases[nextIndex], width - bgOffset, 0, width, height);
            } else {
              ctx.globalAlpha = 1;
              ctx.drawImage(bgCanvases[slideIndex], 0, 0, width, height);
              ctx.globalAlpha = transitionProgress;
              ctx.drawImage(bgCanvases[nextIndex], 0, 0, width, height);
            }
          } else {
            ctx.drawImage(bgCanvases[slideIndex], 0, 0, width, height);
          }
        }
        ctx.restore();

        // 2. Crisp Centered Card with Easing & Shadow
        ctx.save();
        if (!isVerticalFull) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
          ctx.shadowBlur = 45;
          ctx.shadowOffsetY = 15;
        }

        if (transition === "fade") {
          ctx.globalAlpha = 1;
          ctx.drawImage(currentImg, 0, currentY, width, currentH);
          if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
            ctx.globalAlpha = transitionProgress;
            ctx.drawImage(nextImg, 0, nextY, width, nextH);
          }
        } else if (transition === "slide") {
          const ease = 0.5 - Math.cos(transitionProgress * Math.PI) / 2;
          const offset = isTransitioning ? ease * width : 0;
          ctx.drawImage(currentImg, -offset, currentY, width, currentH);
          if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
            ctx.drawImage(nextImg, width - offset, nextY, width, nextH);
          }
        } else {
          // Zoom (Ken Burns)
          const zoomScale = 1.0 + (Math.min(timeIntoSlide, staticDurationMs) / staticDurationMs) * 0.04;
          const zw = width * zoomScale;
          const zh = currentH * zoomScale;
          const zx = (width - zw) / 2;
          const zy = currentY + (currentH - zh) / 2;
          ctx.globalAlpha = 1;
          ctx.drawImage(currentImg, zx, zy, zw, zh);
          if (isTransitioning && nextImg && nextImg instanceof HTMLImageElement) {
            ctx.globalAlpha = transitionProgress;
            ctx.drawImage(nextImg, 0, nextY, width, nextH);
          }
        }
        ctx.restore();

        // 3. Instagram Stories / TikTok Segmented Progress Indicator at Top
        const barMargin = 32;
        const barTop = 36;
        const barHeight = 4;
        const barSpacing = 8;
        const totalBarWidth = width - barMargin * 2;
        const segWidth = (totalBarWidth - (totalSlides - 1) * barSpacing) / totalSlides;

        ctx.save();
        for (let i = 0; i < totalSlides; i++) {
          const segX = barMargin + i * (segWidth + barSpacing);
          // Unfilled track
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.beginPath();
          ctx.roundRect(segX, barTop, segWidth, barHeight, 2);
          ctx.fill();

          // Filled track
          if (i < slideIndex) {
            ctx.fillStyle = "#22D3EE";
            ctx.beginPath();
            ctx.roundRect(segX, barTop, segWidth, barHeight, 2);
            ctx.fill();
          } else if (i === slideIndex) {
            const cycleTotal = staticDurationMs + (slideIndex < totalSlides - 1 ? transitionDurationMs : 0);
            const fillP = Math.min(1, Math.max(0, timeIntoSlide / cycleTotal));
            ctx.fillStyle = "#22D3EE";
            ctx.beginPath();
            ctx.roundRect(segX, barTop, segWidth * fillP, barHeight, 2);
            ctx.fill();
          }
        }
        ctx.restore();
      };

      // Pre-paint initial Slide 0 immediately before stream setup
      drawReelFrame(0, 0, false, 0);

      // 3. Setup Audio (Custom MP3, Studio Curated Beat, or Muted)
      let audioStreamNode: MediaStreamAudioDestinationNode | null = null;

      if (selectedTrack === "custom" && customAudioUrl) {
        try {
          customAudioPlaybackEl = new Audio(customAudioUrl);
          customAudioPlaybackEl.loop = true;
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          customAudioCtx = new AudioContextClass();
          if (customAudioCtx.state === "suspended") await customAudioCtx.resume();
          const source = customAudioCtx.createMediaElementSource(customAudioPlaybackEl);
          const dest = customAudioCtx.createMediaStreamDestination();
          source.connect(dest);
          audioStreamNode = dest;
        } catch (audioErr) {
          console.warn("Custom audio streaming failed:", audioErr);
        }
      } else if (selectedTrack !== "none" && audioEngine) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          trackAudioCtx = new AudioContextClass();
          if (trackAudioCtx.state === "suspended") await trackAudioCtx.resume();
          const streamAudio = await audioEngine.createMediaStreamAudioNode(trackAudioCtx, selectedTrack);
          if (streamAudio) {
            audioStreamNode = streamAudio.destNode;
            stopStreamAudio = streamAudio.stop;
          }
        } catch (audioErr) {
          console.warn("Studio audio streaming failed:", audioErr);
        }
      }

      // 4. Setup MediaRecorder with pre-warmed initial frame
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

      // Ensure canvas has the initial frame captured
      drawReelFrame(0, 0, false, 0);

      // Start recorder and custom audio in sync
      recorder.start(100);
      if (customAudioPlaybackEl) {
        try { await customAudioPlaybackEl.play(); } catch {}
      }

      // 5. Animate through all slides
      setStatusText("Enregistrement de la vidéo...");
      setProgress(50);

      let startTime: number | null = null;

      await new Promise<void>((resolveAnim, rejectAnim) => {
        const renderFrame = (now: number) => {
          try {
            if (startTime === null) {
              startTime = now;
            }
            const elapsed = now - startTime;
            if (elapsed >= totalDurationMs) {
              // Final frame
              drawReelFrame(totalSlides - 1, staticDurationMs, false, 0);
              resolveAnim();
              return;
            }

            const currentProgress = Math.min(99, Math.round(50 + (elapsed / totalDurationMs) * 49));
            setProgress(currentProgress);

            const slideIndex = Math.min(
              totalSlides - 1,
              Math.floor(elapsed / slideCycleMs)
            );
            const timeIntoSlide = elapsed - slideIndex * slideCycleMs;
            const isTransitioning =
              slideIndex < totalSlides - 1 && timeIntoSlide >= staticDurationMs;
            const transitionProgress = isTransitioning
              ? Math.min(1, (timeIntoSlide - staticDurationMs) / transitionDurationMs)
              : 0;

            drawReelFrame(slideIndex, timeIntoSlide, isTransitioning, transitionProgress);

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
      if (stopStreamAudio) {
        try { stopStreamAudio(); } catch {}
        stopStreamAudio = null;
      }
      if (trackAudioCtx) {
        try { trackAudioCtx.close().catch(() => {}); } catch {}
        trackAudioCtx = null;
      }
      if (audioEngine) {
        audioEngine.stop();
      }
      if (customAudioPlaybackEl) {
        customAudioPlaybackEl.pause();
        customAudioPlaybackEl = null;
      }
      if (customAudioCtx) {
        customAudioCtx.close().catch(() => {});
        customAudioCtx = null;
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
      if (stopStreamAudio) {
        try { stopStreamAudio(); } catch {}
      }
      if (trackAudioCtx) {
        try { trackAudioCtx.close().catch(() => {}); } catch {}
      }
      if (audioEngine) audioEngine.stop();
      if (customAudioPlaybackEl) {
        try { customAudioPlaybackEl.pause(); } catch {}
      }
      if (customAudioCtx) {
        try { customAudioCtx.close().catch(() => {}); } catch {}
      }
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
                Durée totale : ~{Math.round(((slides.length - 1) * (slideDurationSec * 1000 + 500) + (slideDurationSec * 1000 + 500)) / 1000)}s ({slideDurationSec}s nettes par slide + transitions fluides).
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

            {/* Audio / Music Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Music className="h-3.5 w-3.5 text-accent" />
                  <span>Musique Studio & Ambiance sonore</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  Vrais MP3 Studio • Libres de droits
                </span>
              </div>

              {/* Smart Content Recommendation Box */}
              <div className="p-3 rounded-xl border border-accent/30 bg-accent/5 flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      Recommandé pour votre extrait :
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                      {recommendedTrack.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {recommendedTrack.recommendedFor} ({recommendedTrack.genre} • {recommendedTrack.bpm} BPM)
                  </p>
                </div>
                {selectedTrack !== recommendedTrack.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrack(recommendedTrack.id);
                      if (audioEngine) audioEngine.play(recommendedTrack.id);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-accent text-accent-foreground shrink-0 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Sélectionner
                  </button>
                )}
              </div>

              {/* 1. BEST PRACTICE HIGHLIGHT: Trending Instagram Audio (Muted Export) */}
              <div
                onClick={() => {
                  setSelectedTrack("none");
                  if (audioEngine) audioEngine.stop();
                  if (customPreviewAudioRef.current) customPreviewAudioRef.current.pause();
                  setIsPlayingCustom(false);
                  setPlayingPreviewTrack(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTrack === "none"
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-sm"
                    : "border-border/80 hover:border-emerald-500/40 bg-surface/30 hover:bg-surface/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          Son Tendance Instagram (Export Muet)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                          ⭐ Secret Viral
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        L&apos;algorithme d&apos;Instagram & TikTok propulse les vidéos qui sélectionnent un son trending directement dans l&apos;application avant de poster. Exportez sans son pour choisir le son n°1 du moment !
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {selectedTrack === "none" ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-border/80" />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. CUSTOM MP3 UPLOAD */}
              <div
                onClick={() => {
                  if (customAudioUrl) {
                    setSelectedTrack("custom");
                    if (audioEngine) audioEngine.stop();
                    setPlayingPreviewTrack(null);
                  } else {
                    customAudioInputRef.current?.click();
                  }
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTrack === "custom"
                    ? "border-accent bg-accent/10 shadow-sm"
                    : "border-border/80 hover:border-accent/40 bg-surface/30 hover:bg-surface/60"
                }`}
              >
                <input
                  ref={customAudioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomAudioUpload}
                  className="hidden"
                />
                {customAudioUrl && (
                  <audio
                    ref={customPreviewAudioRef}
                    src={customAudioUrl}
                    onEnded={() => setIsPlayingCustom(false)}
                    className="hidden"
                  />
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {customAudioUrl ? (
                      <button
                        type="button"
                        onClick={toggleCustomPreview}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isPlayingCustom
                            ? "bg-accent text-accent-foreground shadow-md scale-105"
                            : "bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent border border-border/60"
                        }`}
                        title={isPlayingCustom ? "Arrêter l'écoute" : "Écouter votre MP3"}
                      >
                        {isPlayingCustom ? (
                          <VolumeX className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                        <Upload className="h-4 w-4" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {customAudioFile ? customAudioFile.name : "Importer mon propre MP3 / Audio"}
                        </span>
                        {customAudioFile && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent/15 text-accent font-medium">
                            Fichier perso
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {customAudioFile
                          ? "Votre musique sera synchronisée et mixée dans le Reel"
                          : "Glissez ou sélectionnez un MP3, WAV, ou M4A depuis votre PC"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {customAudioUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={removeCustomAudio}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Supprimer ce fichier audio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {selectedTrack === "custom" ? (
                          <div className="h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-border/80" />
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          customAudioInputRef.current?.click();
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground font-medium transition-colors"
                      >
                        Parcourir
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. BUILT-IN STUDIO MP3 TRACKS */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Musiques Studio selon votre style
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {CURATED_TRACKS.length} pistes disponibles
                  </span>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === "all"
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Toutes ({CURATED_TRACKS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("viral")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === "viral"
                        ? "bg-accent text-accent-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    🔥 Phonk & Viral
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("tech")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === "tech"
                        ? "bg-accent text-accent-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    💻 Tech & Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("finance")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === "finance"
                        ? "bg-accent text-accent-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    📈 Finance & Bourse
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("aesthetic")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === "aesthetic"
                        ? "bg-accent text-accent-foreground shadow-xs font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    ☕ Minimal & Lo-Fi
                  </button>
                </div>

                {/* Tracks list */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {(categoryFilter === "all"
                    ? CURATED_TRACKS
                    : CURATED_TRACKS.filter((t) => t.category === categoryFilter)
                  ).map((track) => {
                    const isCurrent = selectedTrack === track.id;
                    const isPlaying = playingPreviewTrack === track.id;
                    const isRecommended = track.id === recommendedTrack.id;

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setSelectedTrack(track.id);
                          if (customPreviewAudioRef.current) customPreviewAudioRef.current.pause();
                          setIsPlayingCustom(false);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "border-accent bg-accent/10 shadow-xs ring-1 ring-accent/30"
                            : "border-border/80 hover:border-accent/40 bg-surface/30 hover:bg-surface/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Play/Stop Preview Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleTrackPreview(track.id, e)}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                              isPlaying
                                ? "bg-accent text-accent-foreground shadow-md scale-105"
                                : "bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent border border-border/60"
                            }`}
                            title={isPlaying ? "Arrêter l'écoute" : "Écouter ce titre"}
                          >
                            {isPlaying ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-foreground truncate">
                                {track.name}
                              </p>
                              {isRecommended && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                                  ⭐ Recommandé
                                </span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                                {track.bpm} BPM
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent/15 text-accent font-medium">
                                {track.genre}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {track.vibe}
                            </p>
                            <p className="text-[10px] text-accent/80 truncate mt-0.5">
                              🎯 Idéal : {track.recommendedFor}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isPlaying && (
                            <div className="flex items-end gap-0.5 h-3.5 px-2 py-0.5 bg-accent/20 rounded-full">
                              <span className="w-0.5 bg-accent rounded-full animate-bounce h-full" />
                              <span className="w-0.5 bg-accent rounded-full animate-bounce h-2/3 [animation-delay:150ms]" />
                              <span className="w-0.5 bg-accent rounded-full animate-bounce h-4/5 [animation-delay:300ms]" />
                            </div>
                          )}
                          {isCurrent ? (
                            <div className="h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-border/80" />
                          )}
                        </div>
                      </div>
                    );
                  })}
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
