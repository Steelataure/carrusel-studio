/**
 * Real Studio MP3 Audio Engine for High-Retention Instagram Reels & Carousels
 * Features 12 authentic, studio-produced MP3 tracks categorized by carousel niche:
 * - Viral & Phonk (High retention, hook drops)
 * - Tech, Dev & IA (Synthwave, EDM pulse)
 * - Finance & Crypto (Wall Street groove, market volatility)
 * - Minimal & Lo-Fi (JazzHop chill, acoustic warm)
 *
 * Real MP3 audio decoded via AudioContext for video recording,
 * with HTMLAudioElement for instant zero-latency UI previews.
 */

export type TrackCategory = "viral" | "tech" | "finance" | "aesthetic";

export interface TrackInfo {
  id: string;
  name: string;
  category: TrackCategory;
  categoryLabel: string;
  genre: string;
  vibe: string;
  bpm: number;
  src: string;
  recommendedFor: string;
  igKeywords: string[];
  tags: string[];
}

export const CURATED_TRACKS: TrackInfo[] = [
  // --- VIRAL & PHONK ---
  {
    id: "montagem-pr-funk",
    name: "Montagem PR Funk",
    category: "viral",
    categoryLabel: "🔥 Viral Phonk",
    genre: "Brazilian Phonk / TikTok Viral",
    vibe: "Basses 808 ultra lourdes, rythme #1 sur Instagram Reels, rétention maximale",
    bpm: 130,
    src: "/audio/montagem-pr-funk.mp3",
    recommendedFor: "Accroches percutantes, provocations, gros chiffres, viralité pure",
    igKeywords: ["Montagem PR Funk", "Brazilian Phonk", "Viral Reel Audio", "808 Bass"],
    tags: ["viral", "phonk", "bass", "hook", "reels", "energie", "challenge", "gym", "tiktok"],
  },
  {
    id: "orquestra-maldita",
    name: "Orquestra Maldita",
    category: "viral",
    categoryLabel: "🔥 Viral Phonk",
    genre: "Dark Phonk / Aggressive",
    vibe: "Ambiance sombre et percutante, basses massives, arrêt sur scroll garanti",
    bpm: 132,
    src: "/audio/orquestra-maldita.mp3",
    recommendedFor: "Discipline, vérité crue, prises de position fortes, mindset",
    igKeywords: ["Orquestra Maldita", "Aggressive Phonk", "Dark Workout Beat"],
    tags: ["dark", "phonk", "discipline", "mindset", "hustle", "hardcore"],
  },
  {
    id: "gigachad-phonk",
    name: "GigaChad Sigma Anthem",
    category: "viral",
    categoryLabel: "🔥 Viral Phonk",
    genre: "Phonk House / Sigma Vibe",
    vibe: "Ralenti & basses boostées, hymne culte du mindset et du dépassement",
    bpm: 128,
    src: "/audio/gigachad-phonk.mp3",
    recommendedFor: "Mindset, succès, leçons de vie, citations percutantes",
    igKeywords: ["Gigachad theme", "Sigma mindset", "Alpha audio", "Slowed phonk"],
    tags: ["sigma", "mindset", "succes", "motivation", "reussite", "hustle"],
  },

  // --- TECH, DEV & IA ---
  {
    id: "tech-edm-pulse",
    name: "Tech Pulse (Silicon Valley)",
    category: "tech",
    categoryLabel: "💻 Tech & Code",
    genre: "Modern EDM / Tech House",
    vibe: "Kick 4/4 punchy, groove moderne, parfait pour le code et l'architecture SaaS",
    bpm: 126,
    src: "/audio/tech-edm-pulse.mp3",
    recommendedFor: "Tutoriels dev, Next.js, React, architecture logicielle, IA",
    igKeywords: ["Tech house EDM", "Developer pulse", "Startup energy", "Clean beat"],
    tags: ["tech", "code", "dev", "nextjs", "react", "ia", "terminal", "javascript", "python", "software"],
  },
  {
    id: "cyberpunk-synthwave",
    name: "Cyberpunk Retro Drive",
    category: "tech",
    categoryLabel: "💻 Tech & Code",
    genre: "Synthwave 80s / Retrowave",
    vibe: "Arpèges laser rapides, vitesse, sensation cyberpunk et futuriste",
    bpm: 130,
    src: "/audio/cyberpunk-synthwave.mp3",
    recommendedFor: "Astuces tech rapides, raccourcis dev, nouveaux outils, vitesse",
    igKeywords: ["Cyberpunk synthwave", "Retrowave 80s", "Neon drive", "Outrun"],
    tags: ["cyberpunk", "synthwave", "retrowave", "outils", "shortcuts", "vitesse", "futur"],
  },
  {
    id: "cloud-dancer-house",
    name: "Cloud Dancer (Future Tech)",
    category: "tech",
    categoryLabel: "💻 Tech & Code",
    genre: "Upbeat Electro House",
    vibe: "Mélodie entraînante, build-up positif, progression rythmée et moderne",
    bpm: 128,
    src: "/audio/cloud-dancer-house.mp3",
    recommendedFor: "Lancements de produits, démos de fonctionnalités, comparatifs tech",
    igKeywords: ["Upbeat tech house", "Future dance", "Modern workflow"],
    tags: ["tech", "build", "saas", "launch", "product", "demo"],
  },

  // --- FINANCE & CRYPTO ---
  {
    id: "wall-street-groove",
    name: "Wall Street Dark Groove",
    category: "finance",
    categoryLabel: "📈 Finance & Bourse",
    genre: "Dark Spy Groove / Smart Money",
    vibe: "Basse feutrée marchante, élégant, mystérieux, ambiance haute finance",
    bpm: 115,
    src: "/audio/wall-street-groove.mp3",
    recommendedFor: "Investissement en bourse, ETF, intérêts composés, analyses financières",
    igKeywords: ["Wall street groove", "Finance audio", "Smart money", "Investing mindset"],
    tags: ["finance", "bourse", "etf", "argent", "investir", "patrimoine", "actions", "dividendes", "richesse"],
  },
  {
    id: "crypto-volatile-rush",
    name: "Crypto Volatility Rush",
    category: "finance",
    categoryLabel: "📈 Finance & Bourse",
    genre: "Cinematic Action / Adrenaline",
    vibe: "Rythme intense, percussions rapides, adrénaline des marchés volatils",
    bpm: 135,
    src: "/audio/crypto-volatile-rush.mp3",
    recommendedFor: "Cycles crypto, alertes marchés, risques financiers, bull run",
    igKeywords: ["Market volatility", "Crypto rush", "High stakes trading"],
    tags: ["crypto", "bitcoin", "trading", "volatilite", "marches", "alerte", "bullrun"],
  },
  {
    id: "business-cut-and-run",
    name: "Business Fast Momentum",
    category: "finance",
    categoryLabel: "📈 Finance & Bourse",
    genre: "Action Adrenaline / Hustle",
    vibe: "Course contre la montre, percussions pressantes, business momentum",
    bpm: 138,
    src: "/audio/business-cut-and-run.mp3",
    recommendedFor: "Erreurs business à éviter, conseils rentabilité, passage à l'action immédiat",
    igKeywords: ["Business hustle", "Urgent momentum", "Fast results"],
    tags: ["business", "rentabilite", "chiffredaffaires", "erreurs", "conseils", "croissance"],
  },

  // --- MINIMAL & LO-FI ---
  {
    id: "lofi-chill-groove",
    name: "Chill Lo-Fi JazzHop",
    category: "aesthetic",
    categoryLabel: "☕ Minimal & Lo-Fi",
    genre: "Lo-Fi Hip-Hop / Cozy",
    vibe: "Piano Rhodes chaleureux, batterie feutrée, ambiance café & focus",
    bpm: 88,
    src: "/audio/lofi-chill-groove.mp3",
    recommendedFor: "Productivité, Notion, routines calmes, carrousels épurés",
    igKeywords: ["Lofi study beats", "Chill hop", "Aesthetic reel", "Coffee vibes"],
    tags: ["lofi", "chill", "notion", "routine", "productivite", "minimaliste", "design", "lecture"],
  },
  {
    id: "kick-shock-upbeat",
    name: "Kick Shock Pop Energy",
    category: "aesthetic",
    categoryLabel: "☕ Minimal & Lo-Fi",
    genre: "Modern Pop / Upbeat",
    vibe: "Groove dynamique, léger et positif, accrocheur sans être agressif",
    bpm: 122,
    src: "/audio/kick-shock-upbeat.mp3",
    recommendedFor: "Top 3 outils, carrousels conseils légers, formats éducatifs rapides",
    igKeywords: ["Pop groove", "Upbeat mood", "Modern vibes"],
    tags: ["pop", "upbeat", "top3", "outils", "conseils", "astuces", "educatif"],
  },
  {
    id: "daily-beetle-chill",
    name: "Daily Beetle (Acoustic Warm)",
    category: "aesthetic",
    categoryLabel: "☕ Minimal & Lo-Fi",
    genre: "Acoustic Chill / Friendly",
    vibe: "Guitares légères, ambiance bienveillante, storytelling personnel",
    bpm: 105,
    src: "/audio/daily-beetle-chill.mp3",
    recommendedFor: "Storytelling, retours d'expérience, conseils bienveillants",
    igKeywords: ["Acoustic chill", "Friendly story", "Warm aesthetic"],
    tags: ["storytelling", "experience", "bienveillance", "histoire", "developpementpersonnel"],
  },
];

/**
 * Automatically analyze carousel slides & title to recommend the best matching music track
 */
export function getRecommendedTrack(
  slides: Array<{ html?: string; notes?: string; title?: string; content?: string }>,
  carouselTitle?: string
): TrackInfo {
  const slideTexts = slides
    .map((s) => {
      const rawHtml = s.html ? s.html.replace(/<[^>]*>/g, " ") : "";
      return `${rawHtml} ${s.notes || ""} ${s.title || ""} ${s.content || ""}`;
    })
    .join(" ");

  const combinedText = ((carouselTitle || "") + " " + slideTexts).toLowerCase();

  // Keyword weights
  const financeKeywords = [
    "bourse", "finance", "etf", "argent", "investir", "crypto", "trading", "action",
    "dividende", "patrimoine", "richesse", "wall street", "bitcoin", "marche", "capital",
    "revenus", "epargne", "euro", "dollar", "portfolio", "rendement", "compound"
  ];
  const techKeywords = [
    "code", "dev", "git", "github", "react", "next", "javascript", "typescript", "ia",
    "ai", "terminal", "api", "bug", "python", "software", "tech", "web", "programmation",
    "css", "html", "docker", "cloud", "serveur", "algo"
  ];
  const motivationKeywords = [
    "motivation", "mindset", "discipline", "echec", "succes", "reussite", "focus",
    "regle", "conseil", "productivite", "routine", "force", "arrete", "erreur", "secret",
    "danger", "piege", "gagner", "mental", "procrastination"
  ];
  const aestheticKeywords = [
    "design", "notion", "minimal", "aesthetic", "livre", "lecture", "calme", "zen",
    "organisation", "lifestyle", "routine", "sommeil", "bien-etre", "astuce", "simple"
  ];

  let financeScore = 0;
  let techScore = 0;
  let motivationScore = 0;
  let aestheticScore = 0;

  financeKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) financeScore += 2;
  });
  techKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) techScore += 2;
  });
  motivationKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) motivationScore += 2;
  });
  aestheticKeywords.forEach((kw) => {
    if (combinedText.includes(kw)) aestheticScore += 2;
  });

  const maxScore = Math.max(financeScore, techScore, motivationScore, aestheticScore);

  if (maxScore > 0) {
    if (maxScore === financeScore) {
      return (
        combinedText.includes("crypto") || combinedText.includes("bitcoin")
          ? CURATED_TRACKS.find((t) => t.id === "crypto-volatile-rush")!
          : CURATED_TRACKS.find((t) => t.id === "wall-street-groove")!
      );
    }
    if (maxScore === techScore) {
      return (
        combinedText.includes("retro") || combinedText.includes("vitesse") || combinedText.includes("outil")
          ? CURATED_TRACKS.find((t) => t.id === "cyberpunk-synthwave")!
          : CURATED_TRACKS.find((t) => t.id === "tech-edm-pulse")!
      );
    }
    if (maxScore === motivationScore) {
      return (
        combinedText.includes("sigma") || combinedText.includes("reussite")
          ? CURATED_TRACKS.find((t) => t.id === "gigachad-phonk")!
          : CURATED_TRACKS.find((t) => t.id === "montagem-pr-funk")!
      );
    }
    if (maxScore === aestheticScore) {
      return CURATED_TRACKS.find((t) => t.id === "lofi-chill-groove")!;
    }
  }

  // Default: viral Brazilian Phonk (#1 on Instagram Reels)
  return CURATED_TRACKS[0];
}

class AudioEngine {
  private previewAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string = "montagem-pr-funk";
  private volume: number = 0.65;
  private listeners: Set<(isPlaying: boolean, trackId: string) => void> = new Set();
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.previewAudio = new Audio();
      this.previewAudio.loop = true;
      this.previewAudio.volume = this.volume;
      this.previewAudio.addEventListener("ended", () => {
        this.isPlaying = false;
        this.notify();
      });
      this.previewAudio.addEventListener("pause", () => {
        this.isPlaying = false;
        this.notify();
      });
      this.previewAudio.addEventListener("play", () => {
        this.isPlaying = true;
        this.notify();
      });
      this.previewAudio.addEventListener("error", (e) => {
        console.warn("Preview audio playback error:", e);
        this.isPlaying = false;
        this.notify();
      });
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
    if (this.previewAudio) {
      this.previewAudio.volume = this.volume;
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

  /**
   * Preview a real studio MP3 track in the UI
   */
  public play(trackId?: string) {
    if (!this.previewAudio) return;

    const targetId = trackId || this.currentTrackId;
    const track = CURATED_TRACKS.find((t) => t.id === targetId);
    if (!track) return;

    this.currentTrackId = targetId;

    if (this.previewAudio.src && this.previewAudio.src.includes(track.src) && !this.previewAudio.paused) {
      return;
    }

    this.previewAudio.src = track.src;
    this.previewAudio.volume = this.volume;
    this.previewAudio.currentTime = 0;
    this.previewAudio
      .play()
      .then(() => {
        this.isPlaying = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("Audio preview autoplay blocked or failed:", err);
        this.isPlaying = false;
        this.notify();
      });
  }

  public stop() {
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio.currentTime = 0;
    }
    this.isPlaying = false;
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

  /**
   * Fetch and decode real MP3 audio into an AudioBuffer for high-fidelity video recording
   */
  public async loadAudioBuffer(trackId: string, ctx?: AudioContext): Promise<AudioBuffer | null> {
    const track = CURATED_TRACKS.find((t) => t.id === trackId);
    if (!track) return null;

    if (this.audioBufferCache.has(trackId)) {
      return this.audioBufferCache.get(trackId)!;
    }

    try {
      const activeCtx =
        ctx ||
        this.audioCtx ||
        (this.audioCtx = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )());

      const res = await fetch(track.src);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${track.src}`);

      const arrayBuffer = await res.arrayBuffer();
      const decodedBuffer = await activeCtx.decodeAudioData(arrayBuffer);
      this.audioBufferCache.set(trackId, decodedBuffer);
      return decodedBuffer;
    } catch (err) {
      console.error(`Failed to decode MP3 audio for track ${trackId}:`, err);
      return null;
    }
  }

  /**
   * Mix real MP3 track directly into a MediaStreamDestination for video recording
   */
  public async createMediaStreamAudioNode(
    audioCtx: AudioContext,
    trackId: string
  ): Promise<{ destNode: MediaStreamAudioDestinationNode; stop: () => void } | null> {
    const buffer = await this.loadAudioBuffer(trackId, audioCtx);
    if (!buffer) return null;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(this.volume, audioCtx.currentTime);

    const dest = audioCtx.createMediaStreamDestination();

    source.connect(gainNode);
    gainNode.connect(dest);
    source.start(0);

    return {
      destNode: dest,
      stop: () => {
        try {
          source.stop();
          source.disconnect();
          gainNode.disconnect();
        } catch {}
      },
    };
  }
}

export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null;
