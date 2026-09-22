/**
 * Web Audio Procedural Ambient Generator for Tech Carousels & Reels
 * Generates viral, royalty-free Synthwave, Lofi, Phonk, Deep Tech, and Ambient soundscapes
 * entirely in-browser with zero external dependencies.
 */

export interface TrackInfo {
  id: string;
  name: string;
  genre: string;
  vibe: string;
  bpm: number;
  igKeywords: string[];
}

export const CURATED_TRACKS: TrackInfo[] = [
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    genre: "Synthwave",
    vibe: "Néon, futuriste, punchy",
    bpm: 105,
    igKeywords: ["Synthwave Chill", "Cyberpunk 2077 ambient", "Retrowave"],
  },
  {
    id: "lofi-code",
    name: "Midnight Lofi Chill",
    genre: "Lofi Beats",
    vibe: "Doux, chaleureux, focus dev",
    bpm: 80,
    igKeywords: ["Lofi coding", "Lofi study beats", "Lofi fruits"],
  },
  {
    id: "phonk-drift",
    name: "Viral Phonk Bass",
    genre: "Drift Phonk",
    vibe: "Basses lourdes, sombre, viral Reels",
    bpm: 95,
    igKeywords: ["Phonk drift", "Sigma edit audio", "Dark phonk beat"],
  },
  {
    id: "deep-tech-flow",
    name: "Deep Tech Flow",
    genre: "Tech House Minimal",
    vibe: "Rythmé, moderne, startup vibe",
    bpm: 120,
    igKeywords: ["Deep tech", "Minimal electronic", "Modern coder groove"],
  },
  {
    id: "wall-street-pulse",
    name: "Wall Street Momentum",
    genre: "Finance & Motivation",
    vibe: "Dynamique, précis, smart investing",
    bpm: 115,
    igKeywords: ["Finance motivation", "Compounders pulse", "Crypto beat"],
  },
  {
    id: "dark-terminal",
    name: "Dark Terminal Hacker",
    genre: "Dark Drone",
    vibe: "Profond, mystérieux, minimal",
    bpm: 70,
    igKeywords: ["Dark ambient drone", "Hacker vibe", "Cybersecurity beat"],
  },
  {
    id: "synth-arps",
    name: "Retrowave High Speed",
    genre: "Electro 80s",
    vibe: "Arpèges rapides, action, énergie",
    bpm: 125,
    igKeywords: ["Outrun synth", "Laser grid", "High energy coding"],
  },
  {
    id: "zen-focus",
    name: "Zen Minimalist",
    genre: "Chill Ambient",
    vibe: "Nappes éthérées, reposant, élégant",
    bpm: 65,
    igKeywords: ["Clean aesthetics", "Ambient study", "Zen developer"],
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = "cyberpunk-neon";
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private volume: number = 0.45;
  private listeners: Set<(isPlaying: boolean, trackId: string) => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (isPlaying: boolean, trackId: string) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.currentTrackId));
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
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  public toggle(trackId: string): boolean {
    if (this.isPlaying && this.currentTrackId === trackId) {
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
    const track = CURATED_TRACKS.find((t) => t.id === this.currentTrackId);
    const bpm = track?.bpm || 100;
    const intervalMs = (60 / bpm / 2) * 1000;

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
      "phonk-drift": [
        [110.0, 164.81, 220.0], // A sub
        [116.54, 174.61, 233.08], // Bb sub
        [98.0, 146.83, 196.0], // G sub
        [123.47, 185.0, 246.94], // B sub
      ],
      "deep-tech-flow": [
        [87.31, 174.61, 261.63, 311.13], // Fm7
        [103.83, 207.65, 261.63, 311.13], // Abmaj7
        [65.41, 130.81, 196.0, 261.63], // Cm7
        [116.54, 233.08, 293.66, 349.23], // Bb
      ],
      "wall-street-pulse": [
        [110.0, 164.81, 220.0, 261.63], // Am
        [87.31, 174.61, 220.0, 261.63], // F
        [130.81, 196.0, 261.63, 329.63], // C
        [98.0, 146.83, 196.0, 246.94], // G
      ],
      "dark-terminal": [
        [73.42, 110.0, 146.83, 220.0], // D drone
        [65.41, 116.54, 155.56, 233.08], // Bb drone
        [73.42, 110.0, 138.59, 207.65], // D dim drone
        [61.74, 98.0, 146.83, 196.0], // G drone
      ],
      "synth-arps": [
        [130.81, 196.0, 261.63, 329.63], // C
        [146.83, 220.0, 293.66, 349.23], // Dm
        [110.0, 164.81, 220.0, 261.63], // Am
        [98.0, 146.83, 196.0, 246.94], // G
      ],
      "zen-focus": [
        [174.61, 261.63, 329.63, 392.0], // Fmaj7
        [130.81, 196.0, 261.63, 329.63], // Cmaj7
        [110.0, 164.81, 220.0, 261.63], // Am7
        [146.83, 220.0, 261.63, 329.63], // Dm7
      ],
    };

    const chords = chordsMap[this.currentTrackId] || chordsMap["cyberpunk-neon"];

    const tick = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chordIdx = Math.floor(step / 8) % chords.length;
      const subStep = step % 8;

      // 1. Play chord pad on downbeats
      if (subStep === 0) {
        this.playPadChord(chords[chordIdx]);
      }

      // 2. Play bass pulses
      if (subStep === 0 || subStep === 4) {
        const rootFreq = chords[chordIdx][0] / 2;
        this.playBassNote(rootFreq);
      }

      // 3. Hi-hat / Percussion tick for groovy styles
      if (
        (this.currentTrackId === "deep-tech-flow" ||
          this.currentTrackId === "wall-street-pulse" ||
          this.currentTrackId === "phonk-drift") &&
        (subStep % 2 === 1)
      ) {
        this.playNoiseHat();
      }

      // 4. Arpeggios & Leads
      if (this.currentTrackId === "cyberpunk-neon" && subStep % 2 === 0) {
        const notes = chords[chordIdx];
        const note = notes[subStep % notes.length];
        this.playArpNote(note * 2, "square");
      } else if (this.currentTrackId === "synth-arps") {
        const notes = chords[chordIdx];
        const note = notes[(subStep * 2) % notes.length];
        this.playArpNote(note * 2, "sawtooth");
      } else if (this.currentTrackId === "phonk-drift" && (subStep === 2 || subStep === 6)) {
        // Phonk cowbell note
        const cowbellNotes = [587.33, 659.25, 783.99, 880.0];
        const cbNote = cowbellNotes[subStep % cowbellNotes.length];
        this.playCowbell(cbNote);
      } else if (this.currentTrackId === "wall-street-pulse" && subStep % 2 === 0) {
        const notes = chords[chordIdx];
        const note = notes[(subStep + 1) % notes.length];
        this.playArpNote(note * 1.5, "triangle");
      }

      step++;
    };

    tick();
    this.intervalId = window.setInterval(tick, intervalMs);
  }

  private playPadChord(freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const isZen = this.currentTrackId === "zen-focus";
    const isDark = this.currentTrackId === "dark-terminal";
    const duration = isZen ? 3.5 : 2.5;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isDark ? 350 : isZen ? 600 : 950, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isZen ? 0.08 : 0.12, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    filter.connect(gain);
    gain.connect(this.masterGain);

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = isZen ? "sine" : this.currentTrackId === "lofi-code" ? "triangle" : "sawtooth";
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

    const isPhonk = this.currentTrackId === "phonk-drift";
    osc.type = isPhonk ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(isPhonk ? 0.35 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isPhonk ? 0.9 : 0.7));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  private playArpNote(freq: number, type: OscillatorType = "square") {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playCowbell(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(840, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  private playNoiseHat() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
  }
}

export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null;
