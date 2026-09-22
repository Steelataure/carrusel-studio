<div align="center">

# ⚡ Carrusel Studio

### Créez des carrousels & des reels viraux avec l'IA. Exportez en PNG pixel-perfect & vidéo 9:16.

**Local-first. Open source. Propulsé par Steelataure.**

[![License: MIT](https://img.shields.io/badge/license-MIT-1a1a2e.svg?style=flat-square)](./LICENSE)
[![Built with Claude](https://img.shields.io/badge/built%20with-Claude-e94560.svg?style=flat-square)](https://claude.ai)
[![Author: Steelataure](https://img.shields.io/badge/author-Steelataure-22d3ee.svg?style=flat-square)](https://github.com/Steelataure)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000.svg?style=flat-square)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149eca.svg?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=flat-square)](https://tailwindcss.com)

![Dashboard](./docs/screenshots/dashboard.png)

</div>

---

## 📑 Sommaire

- [Pourquoi Carrusel Studio ?](#-pourquoi-carrusel-studio-)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Aperçu de l'Interface](#-aperçu-de-linterface)
- [Démarrage Rapide (60 secondes)](#-démarrage-rapide-60-secondes)
- [Comment fonctionne l'IA](#-comment-fonctionne-lia)
- [Slash Commands](#-slash-commands)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Structure du Projet](#-structure-du-projet)
- [À propos de l'Auteur](#-à-propos-de-lauteur)
- [Licence](#-licence)

---

## ✨ Pourquoi Carrusel Studio ?

Concevoir des carrousels Instagram et des vidéos Reels de haute qualité demande des heures chaque semaine. Les créateurs se retrouvent souvent face à 3 frustrations :

- 💸 **Payer 20 à 60€/mois** pour des outils SaaS fermés et limités
- 🥱 **Utiliser des templates Canva génériques** vus et revus partout sur les réseaux
- ⏳ **Perdre ses week-ends sur Figma** à ajuster manuellement chaque alignement et chaque typo

**Carrusel Studio change la donne.** Conçu pour les créateurs exigeants, les développeurs et les marques personnelles :

1. **Génération intelligente** : Discutez avec l'IA pour concevoir des slides uniques en vrai HTML/CSS.
2. **Édition ultra-rapide** : Modifiez n'importe quel texte ou bloc de code directement en double-cliquant sur la slide, sans passer par l'IA.
3. **Titres viraux & Anti-Shadowban** : Obtenez 3 variantes de titres optimisés pour le taux de clic (Curiosité, Erreur, Résultat), une légende engageante et des hashtags ciblés conformes à l'algorithme 2026.
4. **Planning 30 jours** : Visualisez votre calendrier de publication mensuel et planifiez vos posts en 1 clic grâce à l'auto-planification séquentielle.
5. **Multi-format PNG & Reel 9:16** : Exportez vos carrousels en images PNG nettes ou transformez-les en **vidéos animées 9:16** avec transitions fluides et musique d'ambiance intégrée pour TikTok, Instagram Reels et YouTube Shorts.
6. **100% Local-First** : Vos créations, polices et configurations restent sur votre ordinateur. Zéro abonnement, zéro dépendance cloud imposée.

---

## 🧰 Fonctionnalités Clés

- 🔍 **Recherche instantanée & Filtres thématiques** : Retrouvez n'importe quel carrousel en temps réel avec le raccourci `/` et filtrez par sujet (*Git, Docker, Python, Architecture, TypeScript, SQL, Terminal, Carrière*).
- 📅 **Calendrier de Publication 30 Jours** : Vue calendrier mensuelle interactive avec glisser-déposer et bouton magique **"Auto-planifier (1/j)"**.
- ✏️ **Édition Rapide de Slide (Quick Edit)** : Double-clic sur une slide pour modifier directement les titres, sous-titres, corps de texte et blocs de code avec prévisualisation en direct.
- 🎯 **Titres Viraux & Légendes Anti-Shadowban** :
  - 3 variantes de titres (Tests A/B) avec bouton 1-clic pour appliquer le titre au carrousel
  - Hook optimisé (< 125 car.), résumé en puces, trigger de sauvegarde 🔖
  - 4-5 hashtags ultra-ciblés
- 🎬 **Export Vidéo / Reel 9:16 Animé** : Générez une vidéo verticale Full HD prête à poster avec choix des transitions (*Fondu doux, Glissement, Zoom lent*), durée par slide et musique intégrée.
- 🎵 **Lecteur d'Ambiance Sonore** : Pistes générées par Web Audio (*Cyberpunk Neon Synthwave, Midnight Lofi Code, Dark Terminal*).
- 📐 **Ratios d'aspect Instagram** : Support natif 1:1 (1080×1080), 4:5 (1080×1350) et 9:16 (1080×1920).
- 🛡️ **Overlay Safe Zones** : Vérifiez que vos textes ne sont pas masqués par les boutons de l'interface Instagram (Stories / Reels).
- 🎨 **Charte Graphique Personnalisable** : Couleurs, polices Google Fonts, mots-clés de style injectés automatiquement dans chaque génération.
- 💾 **Export ZIP propre** : Fichier ZIP automatiquement nommé d'après le titre de votre carrousel.

---

## 🎬 Aperçu de l'Interface

**Dashboard** — recherche instantanée, filtres par thématiques, statut de publication et bascule calendrier :

![Dashboard](./docs/screenshots/dashboard.png)

**Éditeur** — panneau de chat IA (gauche), prévisualisation dynamique (centre), filmstrip réorganisable (bas), titres viraux & export :

![Editor](./docs/screenshots/editor.png)

---

## 🚀 Démarrage Rapide (60 secondes)

### Installation

```bash
# Cloner le repository
git clone https://github.com/Steelataure/-carrusel-studio.git
cd -carrusel-studio

# Installer les dépendances et initialiser les données
npm run setup

# Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Utilisation avec Claude Code (Optionnel)

Si vous utilisez [Claude Code](https://docs.anthropic.com/en/docs/claude-code) :

```bash
claude
/start
```

---

## 💬 Comment fonctionne l'IA

L'agent utilise le **CLI Claude** exécuté en sous-processus via `/api/chat`. Les messages sont diffusés au navigateur en streaming temps réel via Server-Sent Events (SSE).

Quand vous demandez un carrousel à l'IA :

1. L'agent lit votre charte graphique (`brand.json`) et le contexte du carrousel.
2. Il génère chaque slide sous forme de HTML/CSS propre et responsive.
3. Il crée automatiquement la slide via l'API locale `/api/carousels/[id]/slides`.
4. La nouvelle slide apparaît en direct dans votre éditeur.

### Comment les slides deviennent des PNG et des Reels

- **Export PNG** : [Puppeteer](https://pptr.dev) capture chaque slide aux dimensions exactes en haute définition, sans perte de qualité.
- **Export Reel 9:16** : Un moteur de rendu Canvas anime les transitions entre vos slides et combine le flux vidéo avec le synthétiseur audio Web Audio pour produire un fichier vidéo prêt à être publié.

---

## 🛠 Slash Commands

Si vous utilisez le CLI :

| Commande        | Description                                                                              |
|-----------------|------------------------------------------------------------------------------------------|
| `/start [port]` | Installe, initialise les données, démarre le serveur et ouvre le navigateur.             |
| `/stop [port]`  | Arrête le serveur de développement (par défaut `:3000`).                                  |
| `/reset`        | Réinitialise les données locales (carrousels, templates, charte) avec confirmation.       |
| `/doctor`       | Diagnostic de l'environnement : version de Node, dépendances, ports et fichiers requis.  |

Commandes npm équivalentes :

```bash
npm run setup     # installation des dépendances et initialisation
npm run dev       # démarrage du serveur de dev
npm run build     # compilation de production Next.js
npm run lint      # validation TypeScript et ESLint
npm run doctor    # diagnostic de santé du projet
```

---

## 🏗 Architecture & Tech Stack

```
carrusel-studio/
├── data/                    # Données locales (carousels.json, brand.json, templates.json)
├── src/
│   ├── app/                 # Routes Next.js (Dashboard, Éditeur, API Endpoints)
│   ├── components/
│   │   ├── brand/           # Configuration de charte graphique
│   │   ├── chat/            # Panneau de discussion IA
│   │   ├── dashboard/       # Calendrier 30J & composants du Dashboard
│   │   ├── editor/          # Prévisualisation, Quick Edit, CaptionModal, ReelExport, Audio
│   │   ├── layout/          # TopBar & navigation
│   │   ├── templates/       # Galerie de modèles
│   │   └── ui/              # Composants Radix UI / styling
│   ├── lib/                 # Moteurs d'export, audio-engine, caption-generator, helpers
│   └── types/               # Définitions TypeScript
```

- **Framework** : Next.js 16 (Turbopack) + React 19
- **Langage** : TypeScript 5
- **Styling** : Tailwind CSS v4 + animations CSS personnalisées
- **Drag & Drop** : `@dnd-kit/core` & `@dnd-kit/sortable`
- **Rendu & Export** : Puppeteer + Sharp + Web Audio API + MediaRecorder

---

## 👤 À propos de l'Auteur

**Carrusel Studio** est développé et maintenu par **[Steelataure](https://github.com/Steelataure)**.

Conçu pour automatiser la création de contenu tech, de carrousels pédagogiques et de vidéos verticales percutantes pour Instagram, TikTok, LinkedIn et YouTube Shorts.

Pour soutenir le projet :
- ⭐ **Ajoutez une étoile au repository GitHub** : [Steelataure/-carrusel-studio](https://github.com/Steelataure/-carrusel-studio.git)
- 🚀 **Partagez vos retours et vos créations**

---

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE) — libre d'utilisation, de modification et de distribution.

<div align="center">

**Développé avec ❤️ par [Steelataure](https://github.com/Steelataure).**

*Créé pour propulser votre audience et votre contenu au niveau supérieur.*

</div>
