# Simulateur Crypto — S'investir

Simulateur DCA (Dollar-Cost Averaging) de crypto-monnaies développé dans le cadre du test technique S'investir.

🔗 **Démo live** : _[Lien Vercel à ajouter]_  
📂 **Repo** : _[Lien GitHub à ajouter]_

---

## 🎯 Objectif

Transposer la logique fonctionnelle du [simulateur existant](https://sinvestir.fr/simulateur-crypto-monnaie/) dans les standards UI/UX du nouveau dashboard [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/), avec des données de prix **réelles et historiques**.

---

## ✨ Fonctionnalités

- **Sélection d'actif** : recherche dynamique parmi les 30 top cryptos par capitalisation boursière
- **Stratégies** : investissement unique (one-shot) ou DCA (quotidien / hebdomadaire / mensuel)
- **Données réelles** : prix historiques EUR via Binance (données complètes depuis 2017, sans clé API)
- **KPIs** : capital total investi, volume acquis, prix moyen d'acquisition, capital final, performance %
- **Graphique** : évolution du volume acquis et de la valeur du capital sur la période
- **Responsive** : desktop, tablette, mobile

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── prices/route.ts   # Proxy prix historiques (Binance → EUR)
│   │   └── coins/route.ts    # Top 30 coins + recherche (CoinGecko)
│   ├── globals.css            # Design system tokens (light theme S'investir)
│   └── page.tsx               # Page principale (layout)
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Header sticky responsive
│   │   └── Sidebar.tsx        # Navigation latérale (desktop)
│   ├── simulator/
│   │   ├── AssetSelector.tsx  # Dropdown recherche crypto
│   │   ├── FrequencySelector.tsx
│   │   ├── SimulatorForm.tsx  # Formulaire de configuration
│   │   ├── SimulatorResults.tsx # Affichage des KPIs
│   │   └── HistoryChart.tsx   # Graphique Recharts
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── hooks/
│   └── useSimulator.ts        # Logique métier (debounce, état, calcul)
└── lib/
    ├── api.ts                 # Client API (routes serveur)
    ├── calculator.ts          # Calcul DCA
    └── types.ts               # Types TypeScript
```

---

## 🔌 Source de données

### Prix historiques — Binance API (principal)
- **Endpoint** : `GET /api/v3/klines?symbol=BTCEUR&interval=1d`
- **Avantage** : gratuit, sans clé API, historique complet depuis la cotation de chaque coin
- **Stratégie** : paire EUR en priorité (`BTCEUR`), sinon USDT + taux EUR/USD live ([currency-api](https://github.com/fawazahmed0/currency-api))
- **Cache** : 1h en mémoire serveur pour éviter les requêtes dupliquées

### Liste des coins — CoinGecko (top 30 par market cap)
- Top 30 par capitalisation, avec cache 30min
- Recherche dynamique

### Routes API Next.js
Tous les appels externes passent par des **Route Handlers** (`/api/*`) pour :
- Éviter les problèmes CORS (requêtes serveur-à-serveur)
- Centraliser le cache
- Permettre l'ajout d'une clé API sans exposer de secret côté client

---

## 🎨 Décisions design

- **Thème clair** : fond `#f1f5f9`, cartes blanches avec ombre légère — fidèle au widget sur sinvestir.fr
- **Couleurs brand** : primary `#0049C6` (bleu S'investir), gold `#f3cc30`
- **Border-radius réduit** : 4–8px (style minimaliste souhaité)
- **CSS Vanilla** : pas de Tailwind (CSS custom properties + classes utilitaires), pour contrôle total et légèreté
- **Responsive** : sidebar cachée sur mobile, grille adaptative, champs dates en colonne sur petit écran

---

## ⚖️ Philosophie d'Implémentation (Natif vs Custom)

Afin d'optimiser les performances (score Lighthouse) et garantir la légèreté de l'application, j'ai suivi une règle stricte : utiliser un maximum de fonctionnalités natives (Navigateur / HTML5 / React pur) et limiter les librairies externes et composants "custom" complexes uniquement là où c'était strictement nécessaire.

### 🟢 Implémentations Natives (Navigateur & React pur)
- **Formatage des monnaies/nombres** : Utilisation de l'API native `Intl.NumberFormat('fr-FR')` au lieu de librairies lourdes comme `numeral.js` ou `currency.js`.
- **Formulaires** : Utilisation des inputs natifs HTML5 (`<input type="date">` et `<select>`) plutôt que des usines à gaz comme `react-datepicker`. Cela délègue l'affichage du calendrier à l'OS de l'utilisateur (parfaitement accessible et performant).
- **Thème (Dark Mode)** : Utilisation des API natives `localStorage`, `window.matchMedia('(prefers-color-scheme: dark)')` et des Variables CSS. Pas de Styled-Components ni de Tailwind.
- **Réseau** : Appels API via la fonction native `fetch()`, sans importer `axios`.
- **Debounce (Performances)** : Implémentation via les API natives `setTimeout`/`clearTimeout` sans importer `lodash.debounce`.
- **Accessibilité** : Utilisation du Hook React natif `useId()` et des attributs ARIA standard.

### 🔵 Implémentations Custom (Code Métier)
- **Moteur de calcul DCA (`lib/calculator.ts`)** : 100% logique mathématique "custom" en TypeScript pur, aucune librairie financière externe.
- **Custom Hooks (`useSimulator.ts`, `useTheme.ts`)** : Isolation totale de la logique métier (appels API, debounce, calculs) pour garder les composants UI "purs".
- **AssetSelector (Recherche Crypto)** : Seule véritable exception pour les formulaires, nécessitant un menu "custom" avec `role="combobox"` car un `<select>` natif ne permet pas d'afficher des images (logos) ni d'avoir une barre de recherche intégrée.
- **Composants UI** : Wrappers très légers (`Card`, `Input`, `Select`) autour des éléments HTML natifs pour appliquer la charte graphique S'investir de façon centralisée.

---

## 🚀 Installation locale

```bash
git clone <repo>
cd investir-test
npm install
npm run dev
# → http://localhost:3000
```

### Variable d'environnement (optionnelle)

```bash
# .env.local
COINGECKO_API_KEY=   # Clé gratuite Demo sur coingecko.com/en/api/pricing
                     # Sans clé : fonctionne via Binance (données complètes)
```

---

## 🛡️ Sécurité & Robustesse

L'application a été conçue pour résister aux failles courantes du web (OWASP) :

- **Input Sanitization** : Les paramètres des routes API (`coinId`, `from`, `to`, `q`) sont strictement vérifiés par des expressions régulières (Regex) pour prévenir toute injection (NoSQL Injection, Path Traversal).
- **HTTP Security Headers** : Configurées nativement dans `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Strict-Transport-Security) pour contrer les attaques XSS et Clickjacking.
- **Protection API Key** : L'éventuelle clé API CoinGecko reste strictement côté serveur (Route Handlers Next.js).
- **CORS / SSRF Mitigation** : Les appels vers les API externes (Binance / CoinGecko) ne font confiance à aucune URL fournie par l'utilisateur. Seuls les identifiants préalablement validés sont injectés dans l'URL de l'API tiers.
- **Déni de Service (DoS)** : Les API disposent d'un système de cache en mémoire (TTL d'une heure pour Binance, 30 min pour CoinGecko) pour absorber d'éventuels pics de trafic sans saturer les limites des APIs sous-jacentes.

---

## 🤖 SEO & Generative Engine Optimization (GEO / AIO)

Afin que le simulateur devienne une référence non seulement sur Google (SEO classique) mais aussi pour les nouvelles Intelligences Artificielles (ChatGPT, Perplexity, Google SGE, Claude), l'application intègre des métadonnées avancées :

- **Données Structurées JSON-LD** : Implémentation du schéma `SoftwareApplication` de *Schema.org*. Cela fournit aux LLMs (IA) un contexte sémantique clair (nom du logiciel, fournisseur, fonctionnalités, gratuité) pour qu'ils puissent analyser et recommander l'outil avec une précision chirurgicale.
- **Métadonnées Next.js natives** : Configuration exhaustive incluant les balises OpenGraph (partages sociaux), Twitter Cards, et le contrôle de l'indexation (Robots `follow, index`).
- **Localisation (GEO)** : L'attribut `<html lang="fr-FR">` et la balise `alternates.languages` ciblent précisément le marché français. L'URL canonique est également sécurisée pour éviter le contenu dupliqué.

---

## 📦 Stack technique

| Outil | Rôle |
|---|---|
| Next.js 14 (App Router) | Framework React SSR/SSG |
| TypeScript | Typage statique |
| Recharts | Visualisation graphique |
| Binance Public API | Prix historiques EUR (gratuit) |
| CoinGecko API | Métadonnées coins (logo, market cap) |
| date-fns | Manipulation des dates |

---

## 💡 Suggestions d'amélioration

- **Comparaison multi-actifs** : simuler plusieurs cryptos sur la même période et les superposer sur le graphique
- **Simulation lump-sum vs DCA** : afficher les deux courbes côte-à-côte pour visualiser l'avantage du DCA
- **Export CSV** : permettre l'export des données de simulation
- **Partage** : URL shareable encodant les paramètres de simulation
