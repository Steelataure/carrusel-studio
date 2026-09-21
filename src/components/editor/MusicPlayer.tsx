"use client";

import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioEngine, CURATED_TRACKS } from "@/lib/audio-engine";

export function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(() => audioEngine?.getIsPlaying() ?? false);
  const [selectedTrack, setSelectedTrack] = useState(() => audioEngine?.getCurrentTrack() ?? "cyberpunk-neon");
  const [volume, setVolume] = useState(() => audioEngine?.getVolume() ?? 0.4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleTogglePlay = () => {
    if (!audioEngine) return;
    const nextState = audioEngine.toggle(selectedTrack);
    setIsPlaying(nextState);
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    if (audioEngine) {
      if (isPlaying) {
        audioEngine.play(trackId);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine?.setVolume(val);
  };

  const handleCopy = async (keyword: string) => {
    await navigator.clipboard.writeText(keyword);
    setCopiedKey(keyword);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentTrackInfo = CURATED_TRACKS.find((t) => t.id === selectedTrack) || CURATED_TRACKS[0];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant={isPlaying ? "accent" : "ghost"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 gap-1.5 px-2.5 text-xs transition-all ${
          isPlaying
            ? "border-accent text-accent-foreground font-medium shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Ambiance musicale & Sons Instagram"
        aria-label="Toggle music menu"
      >
        <Music className={`h-3.5 w-3.5 ${isPlaying ? "animate-bounce text-accent" : ""}`} />
        <span className="hidden sm:inline">
          {isPlaying ? "Musique active" : "Audio"}
        </span>
        {isPlaying && (
          <span className="flex items-end gap-0.5 h-3 ml-1">
            <span className="w-0.5 h-full bg-accent animate-pulse" />
            <span className="w-0.5 h-2/3 bg-accent animate-pulse delay-75" />
            <span className="w-0.5 h-4/5 bg-accent animate-pulse delay-150" />
          </span>
        )}
      </Button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-xl z-50 oc-fade">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Music className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold">Ambiance Sonore</h4>
                <p className="text-[10px] text-muted-foreground">Preview & suggestions Instagram</p>
              </div>
            </div>
            <button
              onClick={handleTogglePlay}
              className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                isPlaying
                  ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : "bg-accent text-accent-foreground hover:opacity-90 shadow-sm"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  Écouter
                </>
              )}
            </button>
          </div>

          {/* Soundscapes selector */}
          <div className="space-y-1.5 mb-4">
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Ambiance de prévisualisation :
            </label>
            {CURATED_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  selectedTrack === track.id
                    ? "border-accent bg-accent/10 text-foreground font-medium"
                    : "border-border/60 hover:border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    {track.name}
                    {selectedTrack === track.id && isPlaying && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{track.vibe}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border font-mono">
                  {track.genre}
                </span>
              </button>
            ))}
          </div>

          {/* Volume bar */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-muted/40 rounded-lg border border-border/40">
            {volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Instagram trending audio tags */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground mb-1.5">
              <Sparkles className="h-3 w-3 text-accent" />
              Sons recommandés sur Instagram :
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Copie un mot-clé et colle-le dans la recherche audio d&apos;Instagram :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentTrackInfo.igKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleCopy(kw)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-muted hover:bg-muted/80 border border-border text-foreground transition-all hover:border-accent/50"
                  title="Cliquer pour copier"
                >
                  {copiedKey === kw ? (
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                  )}
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
