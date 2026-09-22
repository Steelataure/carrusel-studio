import type { Carousel } from "@/types/carousel";

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  alternativeTitles: string[];
}

export function generateViralCaption(carousel: Carousel): GeneratedContent {
  const name = carousel.name || "Guide Développeur";

  // Clean title for topic detection
  const cleanName = name
    .replace(/\s*\(from template\)\s*/gi, "")
    .replace(/\s*\(6 slides\)\s*/gi, "")
    .trim();

  // Extract plain text snippets from slides
  const slideTexts: string[] = [];
  for (const s of carousel.slides) {
    const text = s.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) slideTexts.push(text);
  }

  // Generate 3 High-Conversion Viral Titles (Curiosité, Erreur, Résultat)
  const alternativeTitles = [
    `Ce que 90% des développeurs ignorent sur ${cleanName}`,
    `L'erreur classique en ${cleanName} qui te fait perdre des heures`,
    `Le guide ultra-rapide pour maîtriser ${cleanName} proprement`,
  ];

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

  // Extract key points from slides (first few headings or bullets)
  const summaryPoints = carousel.slides.slice(0, 4).map((s, i) => {
    // Try to find a heading
    const hMatch = s.html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
    if (hMatch) {
      const cleanH = hMatch[1].replace(/<[^>]+>/g, "").trim();
      if (cleanH.length > 2 && cleanH.length < 60) return `• ${cleanH}`;
    }
    return `• Étape ${i + 1} : Les fondamentaux clés`;
  });

  const caption = `${cleanName} expliqué simplement en 60 secondes chrono ⚡

${summaryPoints.join("\n")}

Swipe jusqu'au bout pour voir les exemples concrets et éviter les pièges en production !

🔖 Enregistre ce post pour ton prochain sprint / session de code.
💬 Tu utilises quoi de ton côté ? Dis-le moi en commentaire 👇`.trim();

  return {
    caption,
    hashtags: tagList.slice(0, 5),
    alternativeTitles,
  };
}
