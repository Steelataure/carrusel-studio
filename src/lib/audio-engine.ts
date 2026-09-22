/**
 * Web Audio Procedural High-Energy Beat Generator for Viral Reels
 * Fast tempo (105 - 140 BPM), punchy kicks, snares, claps, crisp hi-hats, and bouncy 808s.
 * 100% royalty-free, zero depressing drones.
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
    id: "phonk-energy-808",
    name: "Phonk Energy 808",
    genre: "Drift Phonk / Trap",
    vibe: "Basses 808 lourdes, rapide, percutant & viral",
    bpm: 132,
    igKeywords: ["Phonk drift", "Sigma beat", "High energy reel"],
  },
  {
    id: "tech-house-bounce",
    name: "Tech House Pulse",
    genre: "Tech House / EDM",
    vibe: "Kick 4/4 punchy, groove club moderne, dynamique",
    bpm: 126,
    igKeywords: ["Deep tech house", "Club coder", "Startup energy"],
  },
  {
    id: "drill-motivation",
    name: "Viral Motivation Drill",
    genre: "UK Drill / Trap",
    vibe: "Rythme entraînant, percussions rapides, boost d'action",
    bpm: 138,
    igKeywords: ["Motivational beat", "Hustle energy", "Drill instrumental"],
  },
  {
    id: "synthwave-outrun",
    name: "Neon Highway Rush",
    genre: "Synthwave / Cyberpunk",
    vibe: "Électro rapide, arpèges laser, sensation de vitesse",
    bpm: 128,
    igKeywords: ["Synthwave outrun", "Fast retrowave", "Cyberpunk drive"],
  },
  {
    id: "lofi-upbeat-groove",
    name: "Upbeat Lofi Summer",
    genre: "Upbeat Lofi / Boom Bap",
    vibe: "Accords solaires, joyeux, positif & motivant",
    bpm: 108,
    igKeywords: ["Happy lofi", "Summer boom bap", "Positive mindset"],
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = "phonk-energy-808";
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private volume: number = 0.55;
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
    const bpm = track?.bpm || 128;
    // 16th notes sequencer interval
    const intervalMs = (60 / bpm / 4) * 1000;

    // Upbeat chords progressions
    const chordsMap: Record<string, number[][]> = {
      "phonk-energy-808": [
        [110.0, 164.81, 220.0], // A
        [116.54, 174.61, 233.08], // Bb
        [130.81, 196.0, 261.63], // C
        [123.47, 185.0, 246.94], // B
      ],
      "tech-house-bounce": [
        [130.81, 196.0, 261.63, 329.63], // Cmaj
        [146.83, 220.0, 261.63, 349.23], // Dm
        [110.0, 164.81, 220.0, 261.63], // Am
        [174.61, 261.63, 329.63, 392.0], // F
      ],
      "drill-motivation": [
        [146.83, 220.0, 293.66], // Dm
        [130.81, 196.0, 261.63], // C
        [116.54, 174.61, 233.08], // Bb
        [110.0, 164.81, 220.0], // A
      ],
      "synthwave-outrun": [
        [146.83, 220.0, 261.63, 349.23], // Dm
        [174.61, 261.63, 329.63, 392.0], // F
        [130.81, 196.0, 261.63, 329.63], // C
        [116.54, 233.08, 293.66, 349.23], // Bb
      ],
      "lofi-upbeat-groove": [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7 (Bright & warm)
        [220.0, 261.63, 329.63, 440.0], // Am7
        [146.83, 220.0, 261.63, 349.23], // Dm7
        [196.0, 246.94, 293.66, 349.23], // G7
      ],
    };

    const chords = chordsMap[this.currentTrackId] || chordsMap["phonk-energy-808"];

    const tick = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const step16 = step % 16;
      const chordIdx = Math.floor(step / 16) % chords.length;
      const currentChord = chords[chordIdx];

      // --- 1. DRUMS & PERCUSSIONS (Kicks, Snares, Claps, Hi-Hats) ---
      if (this.currentTrackId === "tech-house-bounce") {
        // Four on the floor kick (every 4 sixteenths = 0, 4, 8, 12)
        if (step16 % 4 === 0) {
          this.playPunchyKick(now);
        }
        // Clap on 4 and 12 (beats 2 and 4)
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        // Open hi-hat on offbeat (2, 6, 10, 14)
        if (step16 % 4 === 2) {
          this.playCrispHat(now, true);
        } else if (step16 % 2 === 1) {
          this.playCrispHat(now, false);
        }
        // Bouncy bassline on offbeats
        if (step16 % 4 === 2) {
          this.playBouncyBass(now, currentChord[0] / 2);
        }
      } else if (this.currentTrackId === "phonk-energy-808") {
        // Phonk Trap Beat
        if (step16 === 0 || step16 === 6 || step16 === 10) {
          this.playPunchyKick(now);
          this.play808Sub(now, currentChord[0] / 2);
        }
        // Snare on 4 and 12
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        // Fast 16th hi-hats
        if (step16 % 2 === 0 || step16 === 14 || step16 === 15) {
          this.playCrispHat(now, false);
        }
        // Cowbell hook
        if (step16 === 2 || step16 === 5 || step16 === 8 || step16 === 11) {
          const cowbellNotes = [587.33, 659.25, 783.99, 880.0];
          this.playPhonkCowbell(now, cowbellNotes[step16 % cowbellNotes.length]);
        }
      } else if (this.currentTrackId === "drill-motivation") {
        // UK Drill / Trap
        if (step16 === 0 || step16 === 7 || step16 === 10) {
          this.playPunchyKick(now);
          this.play808Sub(now, currentChord[0] / 2);
        }
        if (step16 === 6 || step16 === 14) {
          this.playSnareClap(now);
        }
        // Triplet hi-hat feel
        if (step16 % 2 === 0 || step16 === 11 || step16 === 13) {
          this.playCrispHat(now, step16 === 6);
        }
        // Rhythmic pluck lead
        if (step16 % 2 === 1) {
          this.playBrightPluck(now, currentChord[step16 % currentChord.length] * 2);
        }
      } else if (this.currentTrackId === "synthwave-outrun") {
        // Driving Synthwave: Kick on 0, 8. Snare on 4, 12.
        if (step16 === 0 || step16 === 8) {
          this.playPunchyKick(now);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0) {
          this.playCrispHat(now, false);
        }
        // Driving 16th rolling bass
        this.playSynthBass(now, currentChord[0] / 2);

        // Bright brass synth chords on 0 and 6
        if (step16 === 0 || step16 === 6) {
          this.playBrightBrassChord(now, currentChord);
        }
      } else {
        // Upbeat Lofi Summer: Boom bap punch
        if (step16 === 0 || step16 === 6 || step16 === 10) {
          this.playPunchyKick(now);
          this.playBouncyBass(now, currentChord[0] / 2);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0) {
          this.playCrispHat(now, step16 === 4 || step16 === 12);
        }
        // Warm sunny electric piano chords
        if (step16 === 0 || step16 === 6) {
          this.playRhodesChord(now, currentChord);
        }
      }

      step++;
    };

    tick();
    this.intervalId = window.setInterval(tick, intervalMs);
  }

  // Punchy Kick with instant pitch drop
  private playPunchyKick(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Snappy Snare / Clap
  private playSnareClap(now: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);

    // Noise snap
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1300, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  // Crisp Metallic Hi-Hat
  private playCrispHat(now: number, open: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const duration = open ? 0.11 : 0.035;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7500, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.2 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  // Heavy 808 Sub with subtle saturation
  private play808Sub(now: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Bouncy Club Bass
  private playBouncyBass(now: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.16);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Rolling Synthwave Bass
  private playSynthBass(now: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Bright Pluck Lead
  private playBrightPluck(now: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Phonk Cowbell
  private playPhonkCowbell(now: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(920, now);
    filter.Q.setValueAtTime(6, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Bright Brass Chord for Synthwave
  private playBrightBrassChord(now: number, freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    filter.connect(gain);
    gain.connect(this.masterGain);

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq * 1.5, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // Sunny Rhodes Electric Piano Chords for Summer Lofi
  private playRhodesChord(now: number, freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    filter.connect(gain);
    gain.connect(this.masterGain);

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + 0.55);
    });
  }
}

export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null;
