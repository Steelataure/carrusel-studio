import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const carouselsPath = path.resolve(__dirname, "../data/carousels.json");

const data = JSON.parse(fs.readFileSync(carouselsPath, "utf8"));

function extractCleanTopic(name) {
  let clean = (name || "Guide Développeur")
    .replace(/\s*\(from template\)\s*/gi, "")
    .replace(/\s*\(\d+\s*slides?\)\s*/gi, "")
    .trim();

  const hookPrefixes = [
    /^ce que 90% des d[eé]veloppeurs ignorent sur\s+/i,
    /^l['’]erreur (classique|fatale) (en|sur|dans)\s+/i,
    /^le guide ultra-rapide pour ma[iî]triser\s+/i,
    /^arr[eê]te d['’]utiliser\s+/i,
    /^tu confonds encore\s+/i,
    /^le guide visuel (des|du|de)\s+/i,
    /^comment concevoir\s+/i,
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of hookPrefixes) {
      if (prefix.test(clean)) {
        clean = clean.replace(prefix, "").trim();
        changed = true;
      }
    }
  }

  clean = clean
    .replace(/\s+qui te fait perdre des heures$/i, "")
    .replace(/\s+proprement$/i, "")
    .replace(/\s+en 60s chrono$/i, "")
    .replace(/\s+expliqu[eé] simplement$/i, "")
    .trim();

  return clean || name || "Guide Développeur";
}

function getSmartKeyword(cleanName) {
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
  if (lower.includes("securite") || lower.includes("auth") || lower.includes("jwt")) return "SECURITY";
  if (lower.includes("dns") || lower.includes("web") || lower.includes("perf")) return "WEB";
  if (lower.includes("solid") || lower.includes("archi") || lower.includes("microservice")) return "CLEAN";
  if (lower.includes("vscode") || lower.includes("shortcut")) return "TIPS";
  return "GUIDE";
}

const DIMENSIONS = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
};

function generateCtaSlideHtml(ratio, cleanName, kw) {
  const { width, height } = DIMENSIONS[ratio] || DIMENSIONS["4:5"];
  const paddingY = ratio === "9:16" ? "150px" : ratio === "1:1" ? "70px" : "90px";
  const paddingX = ratio === "1:1" ? "60px" : "80px";

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
            <div style="font-size:18px;color:#94A3B8;">Pour ne pas rater les prochains guides &amp; valider l'envoi</div>
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

// 1. Specifically restore and fix the RAG carousel
const rag = data.carousels.find((c) => c.id === "8483df61-3b29-41d8-ba1c-fc426debedcd");
if (rag) {
  rag.name = "RAG : Donner une mémoire privée à ton IA";
  // Keep only the original 7 slides (orders 0 to 6)
  if (rag.slides.length > 7) {
    rag.slides = rag.slides.slice(0, 7);
  }
  const kw = "AGENTS";
  const lastSlideIdx = rag.slides.length - 1;
  rag.slides[lastSlideIdx].html = generateCtaSlideHtml(rag.aspectRatio, "RAG : Architecture & Vecteurs", kw);
  rag.slides[lastSlideIdx].notes = "Slide CTA Gagnant-Gagnant (Abonne-toi + Guide AGENTS en DM)";
  rag.alternativeTitles = [
    "Ce que 90% des développeurs ignorent sur le RAG en IA",
    "L'erreur classique en RAG qui ruine ton projet d'IA",
    "Le guide ultra-rapide pour brancher tes PDF à un LLM proprement",
  ];
  rag.caption = `RAG expliqué simplement en 60 secondes chrono ⚡

• Arrête d'injecter tout ton PDF dans le prompt
• Le Chunking intelligent (taille + overlap)
• Les Embeddings et les Bases Vectorielles (Pinecone, Chroma, pgvector)
• Le Prompt Augmenté sans aucune hallucination

Swipe jusqu'au bout pour voir les exemples concrets et éviter les erreurs en prod !

🎁 BONUS EXCLUSIF (Offert) :
J'ai réuni toute la cheatsheet + le code source complet prêt à copier.

Pour recevoir ton guide complet :
1️⃣ Abonne-toi à @LeDevCodeur
2️⃣ Commente "AGENTS" ci-dessous

👉 Je te l'envoie automatiquement dans tes messages privés (DM) ! 📥

🔖 Enregistre ce post pour garder les snippets sous la main.`;
}

// 2. Upgrade all other carousels
for (const carousel of data.carousels) {
  if (carousel.id === "8483df61-3b29-41d8-ba1c-fc426debedcd") continue;
  if (!carousel.slides || carousel.slides.length === 0) continue;

  const cleanName = extractCleanTopic(carousel.name);
  const kw = getSmartKeyword(cleanName);
  const ratio = carousel.aspectRatio || "4:5";

  // Replace final slide with combined CTA slide
  const lastIdx = carousel.slides.length - 1;
  carousel.slides[lastIdx].html = generateCtaSlideHtml(ratio, cleanName, kw);
  carousel.slides[lastIdx].notes = `Slide CTA Gagnant-Gagnant (Abonne-toi + Guide ${kw} en DM)`;

  // Update caption if not heavily customized
  carousel.caption = `${cleanName} expliqué simplement en 60 secondes chrono ⚡

Swipe jusqu'au bout pour voir les exemples concrets et éviter les pièges en production !

🎁 BONUS EXCLUSIF (Offert) :
J'ai réuni toute la cheatsheet + le code source complet prêt à copier.

Pour recevoir ton guide complet :
1️⃣ Abonne-toi à @LeDevCodeur
2️⃣ Commente "${kw}" ci-dessous

👉 Je te l'envoie automatiquement dans tes messages privés (DM) ! 📥

🔖 Enregistre ce post pour garder les snippets sous la main.`;

  carousel.alternativeTitles = [
    `Ce que 90% des développeurs ignorent sur ${cleanName}`,
    `L'erreur classique en ${cleanName} qui te fait perdre des heures`,
    `Le guide ultra-rapide pour maîtriser ${cleanName} proprement`,
  ];
}

fs.writeFileSync(carouselsPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Successfully upgraded ${data.carousels.length} carousels with unified CTA slides!`);
