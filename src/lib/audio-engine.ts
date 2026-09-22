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
    id: "balkan-turbo-phonk",
    name: "Balkan Turbo Phonk",
    genre: "Aggressive Phonk",
    vibe: "Énergie brute, cowbell rapide, viralité maximale",
    bpm: 135,
    igKeywords: ["Aggressive phonk", "Cowbell drift", "Viral audio"],
  },
  {
    id: "tech-house-bounce",
    name: "Tech House Pulse",
    genre: "Tech House / EDM",
    vibe: "Kick 4/4 punchy, groove club moderne, startup tech",
    bpm: 126,
    igKeywords: ["Deep tech house", "Club coder", "Startup energy"],
  },
  {
    id: "minimal-deep-tech",
    name: "Silicon Valley Minimal",
    genre: "Minimal Tech",
    vibe: "Kick propre, basse feutrée, ambiance dev moderne",
    bpm: 125,
    igKeywords: ["Silicon valley", "Clean tech", "Developer flow"],
  },
  {
    id: "drill-motivation",
    name: "Viral Motivation Drill",
    genre: "UK Drill / Trap",
    vibe: "Rythme entraînant, percussions rapides, mindset conquérant",
    bpm: 140,
    igKeywords: ["Motivational beat", "Hustle energy", "Drill instrumental"],
  },
  {
    id: "trap-dark-momentum",
    name: "Wall Street Dark Trap",
    genre: "Dark Trap / Finance",
    vibe: "Snare snappy, 808 punchy, trading & business",
    bpm: 136,
    igKeywords: ["Finance trap", "Trading motivation", "Crypto momentum"],
  },
  {
    id: "future-bass-drop",
    name: "Future Bass Energy",
    genre: "Future Bass / EDM",
    vibe: "Accords brillants, énergie explosive, drop dynamique",
    bpm: 130,
    igKeywords: ["Future bass", "EDM drop", "High energy boost"],
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
    id: "miami-nightdrive",
    name: "Miami Nightdrive Funk",
    genre: "Retrowave Funk 80s",
    vibe: "Basse slap rebondissante, synthés funk, vibe GTA",
    bpm: 124,
    igKeywords: ["Miami 80s", "Funk retrowave", "Nightdrive"],
  },
  {
    id: "boom-bap-hustle",
    name: "Boom Bap Hustle",
    genre: "Hip-Hop 90s Boom Bap",
    vibe: "Kick lourd, caisse claire claquante, focus & business",
    bpm: 106,
    igKeywords: ["Boom bap hustle", "90s hip hop", "Focus grind"],
  },
  {
    id: "afrobeat-summer",
    name: "Afrobeat Summer Wave",
    genre: "Afrobeat Pop",
    vibe: "Rythme solaire et dansant, ultra positif et catchy",
    bpm: 118,
    igKeywords: ["Afrobeat viral", "Summer dance", "Catchy pop"],
  },
  {
    id: "lofi-upbeat-groove",
    name: "Upbeat Lofi Summer",
    genre: "Sunny Lofi / Boom Bap",
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
      "balkan-turbo-phonk": [
        [146.83, 220.0, 293.66], // Dm
        [155.56, 233.08, 311.13], // D#m
        [146.83, 220.0, 293.66], // Dm
        [138.59, 207.65, 277.18], // C#m
      ],
      "tech-house-bounce": [
        [130.81, 196.0, 261.63, 329.63], // Cmaj
        [146.83, 220.0, 261.63, 349.23], // Dm
        [110.0, 164.81, 220.0, 261.63], // Am
        [174.61, 261.63, 329.63, 392.0], // F
      ],
      "minimal-deep-tech": [
        [87.31, 174.61, 261.63, 311.13], // Fm7
        [103.83, 207.65, 261.63, 311.13], // Abmaj7
        [65.41, 130.81, 196.0, 261.63], // Cm7
        [116.54, 233.08, 293.66, 349.23], // Bbm7
      ],
      "drill-motivation": [
        [146.83, 220.0, 293.66], // Dm
        [130.81, 196.0, 261.63], // C
        [116.54, 174.61, 233.08], // Bb
        [110.0, 164.81, 220.0], // A
      ],
      "trap-dark-momentum": [
        [110.0, 164.81, 220.0], // Am
        [87.31, 174.61, 220.0], // F
        [146.83, 220.0, 293.66], // Dm
        [82.41, 164.81, 246.94], // E
      ],
      "future-bass-drop": [
        [174.61, 261.63, 329.63, 392.0], // Fmaj7
        [196.0, 246.94, 293.66, 392.0], // G
        [164.81, 246.94, 329.63, 392.0], // Em7
        [110.0, 220.0, 261.63, 329.63], // Am7
      ],
      "synthwave-outrun": [
        [146.83, 220.0, 261.63, 349.23], // Dm
        [174.61, 261.63, 329.63, 392.0], // F
        [130.81, 196.0, 261.63, 329.63], // C
        [116.54, 233.08, 293.66, 349.23], // Bb
      ],
      "miami-nightdrive": [
        [146.83, 220.0, 261.63, 349.23], // Dm7
        [196.0, 246.94, 293.66, 349.23], // G7
        [130.81, 196.0, 246.94, 329.63], // Cmaj7
        [110.0, 220.0, 277.18, 329.63], // A7
      ],
      "boom-bap-hustle": [
        [164.81, 246.94, 329.63, 392.0], // Em7
        [110.0, 220.0, 261.63, 329.63], // Am7
        [123.47, 185.0, 246.94, 293.66], // Bm7
        [130.81, 196.0, 261.63, 329.63], // Cmaj7
      ],
      "afrobeat-summer": [
        [130.81, 196.0, 261.63, 329.63], // C
        [196.0, 246.94, 293.66, 392.0], // G
        [110.0, 164.81, 220.0, 261.63], // Am
        [174.61, 220.0, 261.63, 349.23], // F
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

      // --- 1. DRUMS & PERCUSSIONS ---
      if (this.currentTrackId === "tech-house-bounce" || this.currentTrackId === "minimal-deep-tech") {
        // Four on the floor kick
        if (step16 % 4 === 0) {
          this.playPunchyKick(now);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 4 === 2) {
          this.playCrispHat(now, true);
        } else if (step16 % 2 === 1) {
          this.playCrispHat(now, false);
        }
        if (step16 % 4 === 2) {
          this.playBouncyBass(now, currentChord[0] / 2);
        }
        if (this.currentTrackId === "minimal-deep-tech" && step16 % 4 === 1) {
          this.playBrightPluck(now, currentChord[1]);
        }
      } else if (this.currentTrackId === "phonk-energy-808" || this.currentTrackId === "balkan-turbo-phonk") {
        // Phonk Trap & Balkan Turbo
        const isBalkan = this.currentTrackId === "balkan-turbo-phonk";
        if (isBalkan ? step16 % 4 === 0 : (step16 === 0 || step16 === 6 || step16 === 10)) {
          this.playPunchyKick(now);
          this.play808Sub(now, currentChord[0] / 2);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0 || step16 === 14 || step16 === 15) {
          this.playCrispHat(now, false);
        }
        // Rapid cowbell melody
        if (isBalkan ? (step16 % 2 === 0) : (step16 === 2 || step16 === 5 || step16 === 8 || step16 === 11)) {
          const cowbellNotes = [587.33, 659.25, 783.99, 880.0];
          this.playPhonkCowbell(now, cowbellNotes[step16 % cowbellNotes.length]);
        }
      } else if (this.currentTrackId === "drill-motivation" || this.currentTrackId === "trap-dark-momentum") {
        // Trap & Drill
        if (step16 === 0 || step16 === 7 || step16 === 10) {
          this.playPunchyKick(now);
          this.play808Sub(now, currentChord[0] / 2);
        }
        if (step16 === 6 || step16 === 14) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0 || step16 === 11 || step16 === 13) {
          this.playCrispHat(now, step16 === 6);
        }
        if (step16 % 2 === 1) {
          this.playBrightPluck(now, currentChord[step16 % currentChord.length] * 2);
        }
      } else if (this.currentTrackId === "future-bass-drop") {
        // Future bass bouncy rhythm
        if (step16 === 0 || step16 === 6 || step16 === 10) {
          this.playPunchyKick(now);
          this.play808Sub(now, currentChord[0] / 2);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0) {
          this.playCrispHat(now, step16 === 2);
        }
        if (step16 === 0 || step16 === 6 || step16 === 10) {
          this.playBrightBrassChord(now, currentChord);
        }
      } else if (this.currentTrackId === "synthwave-outrun" || this.currentTrackId === "miami-nightdrive") {
        // Driving Synthwave & Miami Funk
        if (step16 === 0 || step16 === 8 || (this.currentTrackId === "miami-nightdrive" && step16 % 4 === 0)) {
          this.playPunchyKick(now);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 0) {
          this.playCrispHat(now, step16 === 6);
        }
        if (this.currentTrackId === "synthwave-outrun") {
          this.playSynthBass(now, currentChord[0] / 2);
          if (step16 === 0 || step16 === 6) {
            this.playBrightBrassChord(now, currentChord);
          }
        } else {
          // Miami Funk slap bass & Rhodes
          if (step16 % 4 === 2) {
            this.playBouncyBass(now, currentChord[0] / 2);
          }
          if (step16 === 0 || step16 === 6) {
            this.playRhodesChord(now, currentChord);
          }
        }
      } else if (this.currentTrackId === "afrobeat-summer") {
        // Afrobeat rhythm
        if (step16 === 0 || step16 === 6 || step16 === 10) {
          this.playPunchyKick(now);
        }
        if (step16 === 4 || step16 === 12) {
          this.playSnareClap(now);
        }
        if (step16 % 2 === 1 || step16 === 2) {
          this.playCrispHat(now, step16 === 10);
        }
        if (step16 % 2 === 0) {
          this.playBrightPluck(now, currentChord[step16 % currentChord.length]);
        }
      } else {
        // Boom Bap Hustle & Upbeat Lofi Summer
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
