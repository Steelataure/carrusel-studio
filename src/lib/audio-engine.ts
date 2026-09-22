/**
 * Web Audio Procedural Ambient Generator for Tech Carousels
 * Generates chill, royalty-free Synthwave, Lofi, and Dark Ambient soundscapes
 * entirely in-browser with zero external dependencies.
 */

export interface TrackInfo {
  id: string;
  name: string;
  genre: string;
  vibe: string;
  igKeywords: string[];
}

export const CURATED_TRACKS: TrackInfo[] = [
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    genre: "Synthwave",
    vibe: "Néon, futuriste, dynamique",
    igKeywords: ["Synthwave Chill", "Cyberpunk 2077 ambient", "Retrowave"],
  },
  {
    id: "lofi-code",
    name: "Midnight Lofi Code",
    genre: "Lofi Beats",
    vibe: "Doux, chaleureux, focus",
    igKeywords: ["Lofi coding", "Lofi study beats", "Lofi fruits"],
  },
  {
    id: "dark-terminal",
    name: "Dark Hacker Terminal",
    genre: "Dark Ambient",
    vibe: "Profond, mystérieux, minimal",
    igKeywords: ["Dark ambient drone", "Phonk instrumental", "Hacker vibe"],
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = "cyberpunk-neon";
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): string {
    return this.currentTrackId;
  }

  public getMediaStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.initContext();
    if (!this.ctx || !this.masterGain) return null;
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(dest);
    return dest;
  }

  public play(trackId?: string) {
    this.initContext();
    if (trackId) {
      this.currentTrackId = trackId;
    }

    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.startSequencer();
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggle(trackId?: string): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(trackId);
      return true;
    }
  }

  private startSequencer() {
    if (!this.ctx || !this.masterGain) return;

    let step = 0;
    const bpm = this.currentTrackId === "cyberpunk-neon" ? 105 : this.currentTrackId === "lofi-code" ? 80 : 70;
    const intervalMs = (60 / bpm / 2) * 1000;

    // Chords frequencies (MIDI-like)
    // Synthwave: Dm, Bb, F, C
    // Lofi: Dm9, G13, Cmaj7, Am9
    // Dark: D, F, G, C#
    const chordsMap: Record<string, number[][]> = {
      "cyberpunk-neon": [
        [146.83, 220.0, 261.63, 349.23], // Dm
        [116.54, 233.08, 293.66, 349.23], // Bb
        [174.61, 261.63, 329.63, 392.0], // F
        [130.81, 196.0, 261.63, 329.63], // C
      ],
      "lofi-code": [
        [146.83, 220.0, 261.63, 329.63, 349.23], // Dm9
        [98.0, 196.0, 246.94, 329.63, 370.0], // G13
        [130.81, 196.0, 246.94, 329.63, 392.0], // Cmaj7
        [110.0, 220.0, 261.63, 329.63, 440.0], // Am9
      ],
      "dark-terminal": [
        [73.42, 110.0, 146.83, 220.0], // D drone
        [65.41, 116.54, 155.56, 233.08], // Bb drone
        [73.42, 110.0, 138.59, 207.65], // D dim drone
        [61.74, 98.0, 146.83, 196.0], // G drone
      ],
    };

    const chords = chordsMap[this.currentTrackId] || chordsMap["cyberpunk-neon"];

    const tick = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chordIdx = Math.floor(step / 8) % chords.length;
      const subStep = step % 8;

      // Play chord pad on step 0
      if (subStep === 0) {
        this.playPadChord(chords[chordIdx]);
      }

      // Play bass pulse
      if (subStep === 0 || subStep === 4) {
        const rootFreq = chords[chordIdx][0] / 2;
        this.playBassNote(rootFreq);
      }

      // Play soft arpeggio note
      if (this.currentTrackId === "cyberpunk-neon" && (subStep % 2 === 0)) {
        const notes = chords[chordIdx];
        const note = notes[subStep % notes.length];
        this.playArpNote(note * 2);
      }

      step++;
    };

    tick();
    this.intervalId = window.setInterval(tick, intervalMs);
  }

  private playPadChord(freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 2.4;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(this.currentTrackId === "dark-terminal" ? 400 : 900, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    filter.connect(gain);
    gain.connect(this.masterGain);

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = this.currentTrackId === "lofi-code" ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  private playBassNote(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  private playArpNote(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null;
