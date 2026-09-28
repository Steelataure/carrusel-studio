import type { Carousel, AspectRatio } from "@/types/carousel";
import { DIMENSIONS } from "@/types/carousel";

export type CommentStrategyType =
  | "lead_magnet"
  | "debate"
  | "expert_challenge"
  | "experience";

export interface CommentStrategy {
  id: CommentStrategyType;
  title: string;
  badge: string;
  iconName: "Gift" | "Swords" | "Brain" | "Flame";
  multiplier: string;
  description: string;
  keyword?: string;
  ctaText: string;
  fullCaption: string;
  ctaSlideHtml: string;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  alternativeTitles: string[];
  strategies: CommentStrategy[];
  defaultStrategyId: CommentStrategyType;
  keyword: string;
}

export function getSmartKeyword(cleanName: string): string {
  const lower = cleanName.toLowerCase();
  if (lower.includes("git")) return "GIT";
  if (lower.includes("docker")) return "DOCKER";
  if (lower.includes("python")) return "PYTHON";
  if (lower.includes("typescript") || lower.includes("ts")) return "TYPESCRIPT";
  if (lower.includes("javascript") || lower.includes("js")) return "JAVASCRIPT";
  if (lower.includes("sql") || lower.includes("bdd") || lower.includes("postgres")) return "SQL";
  if (lower.includes("api") || lower.includes("rest") || lower.includes("http")) return "API";
  if (lower.includes("rag") || lower.includes("ia") || lower.includes("ai") || lower.includes("llm")) return "AGENTS";
  if (lower.includes("react") || lower.includes("next")) return "REACT";
  if (lower.includes("css") || lower.includes("tailwind")) return "DESIGN";
  if (lower.includes("securite") || lower.includes("auth")) return "SECURITY";
  return "GUIDE";
}

export function getTopicDebate(cleanName: string): {
  optionA: string;
  optionB: string;
  question: string;
} {
  const lower = cleanName.toLowerCase();
  if (lower.includes("git")) {
    return {
      optionA: "Git Rebase (Historique propre et linéaire)",
      optionB: "Git Merge (Pragmatique, zéro prise de tête)",
      question: "Tu es plutôt Rebase propre ou Merge direct ?",
    };
  }
  if (lower.includes("docker") || lower.includes("devops")) {
    return {
      optionA: "Docker Compose simple en production",
      optionB: "Kubernetes ou rien dès le premier jour",
      question: "Tu es plutôt Docker Compose ou Kubernetes ?",
    };
  }
  if (lower.includes("typescript") || lower.includes("ts") || lower.includes("javascript") || lower.includes("js")) {
    return {
      optionA: "TypeScript strict (Typage béton, zéro any)",
      optionB: "JavaScript rapide (Productivité pure et flexibilité)",
      question: "Tu es plutôt TypeScript strict ou JavaScript rapide ?",
    };
  }
  if (lower.includes("python")) {
    return {
      optionA: "Python minimaliste (Scripting rapide sans typage)",
      optionB: "Python moderne (Type hinting strict, Pydantic)",
      question: "Tu es plutôt Python chill ou Python typé strict ?",
    };
  }
  if (lower.includes("api") || lower.includes("rest") || lower.includes("http")) {
    return {
      optionA: "REST classique (Robuste, standard, éprouvé)",
      optionB: "GraphQL / tRPC (Requêtes flexibles sur-mesure)",
      question: "Tu es plutôt REST standard ou GraphQL/tRPC ?",
    };
  }
  if (lower.includes("sql") || lower.includes("bdd") || lower.includes("postgres") || lower.includes("database")) {
    return {
      optionA: "SQL relationnel (PostgreSQL indétrônable)",
      optionB: "NoSQL flexible (MongoDB, Document store)",
      question: "Tu es plutôt SQL relationnel ou NoSQL flexible ?",
    };
  }
  if (lower.includes("rag") || lower.includes("ia") || lower.includes("ai") || lower.includes("llm")) {
    return {
      optionA: "Agents autonomes & RAG complexes",
      optionB: "Prompting ultra ciblé & pragmatique",
      question: "Tu es plutôt Agents autonomes ou Prompting direct ?",
    };
  }
  if (lower.includes("css") || lower.includes("tailwind") || lower.includes("design")) {
    return {
      optionA: "Tailwind CSS (Vitesse pure en JSX)",
      optionB: "CSS pur / Modules (Contrôle total & natif)",
      question: "Tu es plutôt Tailwind CSS ou CSS pur ?",
    };
  }
  return {
    optionA: "Ship fast (Livrer vite en production)",
    optionB: "Clean Code (Architecture parfaite avant de release)",
    question: "Tu es plutôt Ship fast ou Clean code ?",
  };
}

export function generateBoostCtaSlideHtml(
  carousel: Carousel,
  strategyId: CommentStrategyType,
  keyword?: string
): string {
  const ratio: AspectRatio = carousel.aspectRatio || "4:5";
  const { width, height } = DIMENSIONS[ratio] || DIMENSIONS["4:5"];

  const cleanName = (carousel.name || "Guide Développeur")
    .replace(/\s*\(from template\)\s*/gi, "")
    .replace(/\s*\(6 slides\)\s*/gi, "")
    .trim();

  const kw = (keyword || getSmartKeyword(cleanName)).toUpperCase();
  const debate = getTopicDebate(cleanName);

  const paddingY = ratio === "9:16" ? "150px" : ratio === "1:1" ? "70px" : "90px";
  const paddingX = ratio === "1:1" ? "60px" : "80px";

  if (strategyId === "debate") {
    return `<div style="width:${width}px;height:${height}px;background:#0A0A0F;color:#F8FAFC;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:${paddingY} ${paddingX};box-sizing:border-box;text-align:center;">
  <div style="display:flex;justify-content:center;">
    <span style="font-family:'JetBrains Mono',monospace;color:#A855F7;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.35);padding:10px 24px;border-radius:999px;font-size:22px;letter-spacing:1.5px;font-weight:700;">⚔️ LE GRAND DÉBAT TECH</span>
  </div>
  <div>
    <div style="font-size:62px;font-weight:800;color:#F8FAFC;margin-bottom:28px;line-height:1.15;">${debate.question}</div>
    <div style="display:flex;flex-direction:column;gap:18px;max-width:880px;margin:0 auto 36px auto;text-align:left;">
      <div style="background:#12121A;border:2px solid rgba(34,211,238,0.5);border-radius:20px;padding:26px 32px;display:flex;align-items:center;gap:20px;">
        <span style="background:#22D3EE;color:#0A0A0F;font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:900;padding:8px 18px;border-radius:12px;">1</span>
        <span style="font-size:26px;color:#F8FAFC;font-weight:600;">${debate.optionA}</span>
      </div>
      <div style="background:#12121A;border:2px solid rgba(168,85,247,0.5);border-radius:20px;padding:26px 32px;display:flex;align-items:center;gap:20px;">
        <span style="background:#A855F7;color:#F8FAFC;font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:900;padding:8px 18px;border-radius:12px;">2</span>
        <span style="font-size:26px;color:#F8FAFC;font-weight:600;">${debate.optionB}</span>
      </div>
    </div>
    <div style="background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.3);border-radius:16px;padding:20px 32px;display:inline-block;">
      <span style="font-size:26px;color:#22D3EE;font-weight:700;">Tape "1" ou "2" en commentaire ci-dessous 👇</span>
    </div>
  </div>
  <div style="display:flex;justify-content:space-around;border-top:1px solid #1E293B;padding-top:28px;">
    <span style="font-family:'JetBrains Mono',monospace;color:#22D3EE;font-size:22px;">💬 Vote en commentaire</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#A855F7;font-size:22px;">@LeDevCodeur</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#94A3B8;font-size:22px;">🔖 Sauvegarde</span>
  </div>
</div>`;
  }

  if (strategyId === "expert_challenge") {
    return `<div style="width:${width}px;height:${height}px;background:#0A0A0F;color:#F8FAFC;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:${paddingY} ${paddingX};box-sizing:border-box;text-align:center;">
  <div style="display:flex;justify-content:center;">
    <span style="font-family:'JetBrains Mono',monospace;color:#F59E0B;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);padding:10px 24px;border-radius:999px;font-size:22px;letter-spacing:1.5px;font-weight:700;">🧠 DÉFI TECH // TEST SENIOR</span>
  </div>
  <div>
    <div style="font-size:62px;font-weight:800;color:#F8FAFC;margin-bottom:24px;line-height:1.15;">J'ai volontairement mis de côté la règle n°1.</div>
    <p style="font-size:28px;color:#94A3B8;max-width:820px;margin:0 auto 40px auto;line-height:1.4;">Celle que 95% des développeurs oublient d'appliquer sur <span style="color:#22D3EE;">${cleanName}</span>.</p>
    <div style="background:#12121A;border:2px solid #22D3EE;border-radius:24px;padding:36px 48px;box-shadow:0 0 50px rgba(34,211,238,0.15);display:inline-block;max-width:820px;">
      <div style="font-size:24px;color:#94A3B8;margin-bottom:12px;">D'après toi, c'est laquelle ?</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:36px;color:#22D3EE;font-weight:800;">Dépose ta réponse en commentaire !</div>
      <div style="font-size:22px;color:#A855F7;margin-top:12px;">⚡ Je réponds et valide les meilleures analyses.</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-around;border-top:1px solid #1E293B;padding-top:28px;">
    <span style="font-family:'JetBrains Mono',monospace;color:#22D3EE;font-size:22px;">💬 Partage ta règle</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#A855F7;font-size:22px;">@LeDevCodeur</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#94A3B8;font-size:22px;">🔖 Sauvegarde</span>
  </div>
</div>`;
  }

  if (strategyId === "experience") {
    return `<div style="width:${width}px;height:${height}px;background:#0A0A0F;color:#F8FAFC;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:${paddingY} ${paddingX};box-sizing:border-box;text-align:center;">
  <div style="display:flex;justify-content:center;">
    <span style="font-family:'JetBrains Mono',monospace;color:#EF4444;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);padding:10px 24px;border-radius:999px;font-size:22px;letter-spacing:1.5px;font-weight:700;">🔥 VÉCU EN PROD // SANS FILTRE</span>
  </div>
  <div>
    <div style="font-size:62px;font-weight:800;color:#F8FAFC;margin-bottom:24px;line-height:1.15;">C'est quoi ta pire galère avec ${cleanName} ?</div>
    <p style="font-size:28px;color:#94A3B8;max-width:820px;margin:0 auto 40px auto;line-height:1.4;">Le bug vicieux, l'erreur 500 inexplicable ou le push du vendredi soir...</p>
    <div style="background:#12121A;border:2px solid #EF4444;border-radius:24px;padding:36px 48px;box-shadow:0 0 50px rgba(239,68,68,0.15);display:inline-block;max-width:820px;">
      <div style="font-size:24px;color:#94A3B8;margin-bottom:12px;">Raconte ton pire souvenir en 1 phrase :</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#EF4444;font-weight:800;">Balance ton anecdote ci-dessous 👇</div>
      <div style="font-size:22px;color:#A855F7;margin-top:12px;">(Promis, aucun jugement entre devs 😂)</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-around;border-top:1px solid #1E293B;padding-top:28px;">
    <span style="font-family:'JetBrains Mono',monospace;color:#EF4444;font-size:22px;">💬 Raconte en com</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#A855F7;font-size:22px;">@LeDevCodeur</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#94A3B8;font-size:22px;">🔖 Sauvegarde</span>
  </div>
</div>`;
  }

  // Default: Lead Magnet (ManyChat / DM automation) - Formule Gagnant-Gagnant (Abonne-toi + Cadeau)
  return `<div style="width:${width}px;height:${height}px;background:#0A0A0F;color:#F8FAFC;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:${paddingY} ${paddingX};box-sizing:border-box;text-align:center;">
  <div style="display:flex;justify-content:center;">
    <span style="font-family:'JetBrains Mono',monospace;color:#22D3EE;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.35);padding:10px 24px;border-radius:999px;font-size:22px;letter-spacing:1.5px;font-weight:700;">🎁 RESSOURCE OFFERTE // GUIDE COMPLET</span>
  </div>
  <div>
    <div style="font-size:62px;font-weight:800;color:#F8FAFC;margin-bottom:18px;line-height:1.15;">Tu veux la cheatsheet complète ?</div>
    <p style="font-size:26px;color:#94A3B8;max-width:820px;margin:0 auto 32px auto;line-height:1.4;">J'ai condensé tous les snippets, diagrammes et bonnes pratiques sur <span style="color:#22D3EE;">${cleanName}</span> en 1 page.</p>

    <!-- Unified 2-Step Action Container -->
    <div style="background:#12121A;border:2px solid #22D3EE;border-radius:24px;padding:32px 36px;box-shadow:0 0 50px rgba(34,211,238,0.18);display:inline-block;max-width:860px;width:100%;box-sizing:border-box;margin:0 auto;">
      <div style="font-size:20px;color:#94A3B8;margin-bottom:20px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Pour la recevoir gratuitement :</div>

      <div style="display:flex;flex-direction:column;gap:16px;text-align:left;max-width:720px;margin:0 auto 24px auto;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;display:flex;align-items:center;gap:18px;">
          <span style="background:rgba(168,85,247,0.2);color:#A855F7;border:1px solid #A855F7;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:900;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:10px;shrink:0;">1</span>
          <div>
            <div style="font-size:24px;color:#F8FAFC;font-weight:700;">Abonne-toi à <span style="color:#A855F7;">@LeDevCodeur</span></div>
            <div style="font-size:18px;color:#94A3B8;">Pour ne pas rater les prochains guides & valider l'envoi</div>
          </div>
        </div>

        <div style="background:rgba(34,211,238,0.06);border:1px solid rgba(34,211,238,0.3);border-radius:16px;padding:18px 24px;display:flex;align-items:center;gap:18px;">
          <span style="background:#22D3EE;color:#0A0A0F;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:900;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:10px;shrink:0;">2</span>
          <div>
            <div style="font-size:24px;color:#F8FAFC;font-weight:700;">Commente <span style="color:#22D3EE;font-family:'JetBrains Mono',monospace;background:rgba(34,211,238,0.15);padding:2px 10px;border-radius:8px;">"${kw}"</span> sous ce post</div>
            <div style="font-size:18px;color:#94A3B8;">Déclenche l'envoi immédiat de ton fichier en message privé</div>
          </div>
        </div>
      </div>

      <div style="font-size:22px;color:#22D3EE;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;">
        <span>⚡ Je te l'envoie automatiquement en DM !</span>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-around;border-top:1px solid #1E293B;padding-top:28px;">
    <span style="font-family:'JetBrains Mono',monospace;color:#A855F7;font-size:22px;">1. Abonne-toi</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#22D3EE;font-size:22px;">2. Commente "${kw}"</span>
    <span style="font-family:'JetBrains Mono',monospace;color:#F8FAFC;font-size:22px;">3. Reçois en DM</span>
  </div>
</div>`;
}

export function generateViralCaption(
  carousel: Carousel,
  options?: {
    activeStrategyId?: CommentStrategyType;
    customKeyword?: string;
  }
): GeneratedContent {
  const name = carousel.name || "Guide Développeur";

  // Clean title for topic detection
  const cleanName = name
    .replace(/\s*\(from template\)\s*/gi, "")
    .replace(/\s*\(6 slides\)\s*/gi, "")
    .trim();

  const kw = (options?.customKeyword || getSmartKeyword(cleanName)).toUpperCase();
  const debate = getTopicDebate(cleanName);

  // Extract key points from slides (first few headings or bullets)
  const summaryPoints = carousel.slides.slice(0, 4).map((s, i) => {
    const hMatch = s.html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
    if (hMatch) {
      const cleanH = hMatch[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH.length > 2 && cleanH.length < 60) return `• ${cleanH}`;
    }
    return `• Point clé #${i + 1} : Bonnes pratiques et pièges à éviter`;
  });

  const baseHeader = `${cleanName} expliqué simplement en 60 secondes chrono ⚡\n\n${summaryPoints.join("\n")}\n\nSwipe jusqu'au bout pour voir les exemples concrets et éviter les erreurs en prod !`;

  // 1. Lead Magnet Strategy (Gagnant-Gagnant : Abonne-toi + Mot-clé)
  const leadMagnetCta = `🎁 BONUS EXCLUSIF (Offert) :
J'ai réuni toute la cheatsheet + le code source complet prêt à copier.

Pour recevoir ton guide complet :
1️⃣ Abonne-toi à @LeDevCodeur
2️⃣ Commente "${kw}" ci-dessous

👉 Je te l'envoie automatiquement dans tes messages privés (DM) ! 📥

🔖 Enregistre ce post pour garder les snippets sous la main.`;

  // 2. Debate Strategy
  const debateCta = `⚔️ LE GRAND DÉBAT DU JOUR :
${debate.question}
1️⃣ ${debate.optionA}
2️⃣ ${debate.optionB}

👇 Tape simplement "1" ou "2" en commentaire ! (Les vrais arguments sont les bienvenus)

🔖 Enregistre ce post pour comparer les réponses des autres dev.`;

  // 3. Expert Challenge Strategy
  const expertCta = `🧠 QUESTION POUR LES SENIORS :
J'ai volontairement mis de côté LA règle indispensable que 90% des développeurs oublient d'appliquer sur ${cleanName}.

💬 C'est laquelle selon toi ? Dépose ta réponse en commentaire, je réponds à tout le monde ! 👇

🔖 Enregistre ce post pour vérifier la réponse avec les autres.`;

  // 4. Experience Strategy
  const experienceCta = `🔥 À TOI DE JOUER :
C'est quoi la pire erreur ou le bug le plus vicieux que tu as déjà eu sur ${cleanName} ? (Promis, pas de jugement 😂)

💬 Raconte en commentaire ci-dessous 👇

🔖 Enregistre ce post pour ton prochain debug.`;

  const strategies: CommentStrategy[] = [
    {
      id: "lead_magnet",
      title: "🎁 Lead Magnet (Mot-clé ManyChat)",
      badge: "+500% Commentaires",
      iconName: "Gift",
      multiplier: "x10 Commentaires",
      description:
        "Zéro friction : 1 seul mot à taper. Idéal pour ManyChat / automation DM pour envoyer une cheatsheet ou ressource.",
      keyword: kw,
      ctaText: leadMagnetCta,
      fullCaption: `${baseHeader}\n\n${leadMagnetCta}`,
      ctaSlideHtml: generateBoostCtaSlideHtml(carousel, "lead_magnet", kw),
    },
    {
      id: "debate",
      title: "⚔️ Débat Binaire (Vote 1 ou 2)",
      badge: "+300% Vélocité",
      iconName: "Swords",
      multiplier: "Vélocité Max (<1h)",
      description:
        "Guerre de clochers tech. Friction minimale (taper '1' ou '2') qui déclenche le boost de l'algorithme.",
      ctaText: debateCta,
      fullCaption: `${baseHeader}\n\n${debateCta}`,
      ctaSlideHtml: generateBoostCtaSlideHtml(carousel, "debate", kw),
    },
    {
      id: "expert_challenge",
      title: "🧠 Défi Senior (Omission volontaire)",
      badge: "+250% Engagement Long",
      iconName: "Brain",
      multiplier: "Commentaires Qualifiés",
      description:
        "Flatterie d'ego d'expert. Incite les développeurs seniors à rédiger des explications détaillées valorisées par l'algorithme.",
      ctaText: expertCta,
      fullCaption: `${baseHeader}\n\n${expertCta}`,
      ctaSlideHtml: generateBoostCtaSlideHtml(carousel, "expert_challenge", kw),
    },
    {
      id: "experience",
      title: "🔥 Raconte ta Galère (Storytelling)",
      badge: "+200% Discussions",
      iconName: "Flame",
      multiplier: "Connexion & Empathie",
      description:
        "Humanise le profil. Déclenche des partages d'anecdotes réelles en prod, favorisant les échanges en fil de discussion.",
      ctaText: experienceCta,
      fullCaption: `${baseHeader}\n\n${experienceCta}`,
      ctaSlideHtml: generateBoostCtaSlideHtml(carousel, "experience", kw),
    },
  ];

  const defaultStrategyId: CommentStrategyType =
    options?.activeStrategyId || "lead_magnet";

  const activeStrategy =
    strategies.find((s) => s.id === defaultStrategyId) || strategies[0];

  // Specific topic adjustments if recognizable
  const lowerName = cleanName.toLowerCase();
  let tagList = ["devcodeur", "programmation", "developpeurweb", "techfr", "coding"];

  if (lowerName.includes("git")) {
    tagList = ["git", "github", "devcodeur", "versioncontrol", "programmation"];
  } else if (lowerName.includes("docker")) {
    tagList = ["docker", "devops", "conteneur", "devcodeur", "backend"];
  } else if (lowerName.includes("python")) {
    tagList = ["python", "pythondeveloper", "devcodeur", "codetips", "programmation"];
  } else if (lowerName.includes("javascript") || lowerName.includes("js")) {
    tagList = ["javascript", "frontend", "webdev", "devcodeur", "programmation"];
  } else if (lowerName.includes("typescript") || lowerName.includes("ts")) {
    tagList = ["typescript", "javascript", "cleancode", "devcodeur", "webdev"];
  } else if (lowerName.includes("sql") || lowerName.includes("nosql") || lowerName.includes("bdd")) {
    tagList = ["database", "sql", "backend", "devcodeur", "architecture"];
  } else if (lowerName.includes("rag") || lowerName.includes("ia") || lowerName.includes("ai")) {
    tagList = ["intelligenceartificielle", "rag", "machinelearning", "devcodeur", "llm"];
  } else if (lowerName.includes("securite") || lowerName.includes("faille")) {
    tagList = ["cybersecurite", "websecurity", "hacking", "devcodeur", "infosec"];
  }

  // Generate 3 High-Conversion Viral Titles (Curiosité, Erreur, Résultat)
  const alternativeTitles = [
    `Ce que 90% des développeurs ignorent sur ${cleanName}`,
    `L'erreur classique en ${cleanName} qui te fait perdre des heures`,
    `Le guide ultra-rapide pour maîtriser ${cleanName} proprement`,
  ];

  return {
    caption: activeStrategy.fullCaption,
    hashtags: tagList.slice(0, 5),
    alternativeTitles,
    strategies,
    defaultStrategyId,
    keyword: kw,
  };
}
