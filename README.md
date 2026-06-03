# HB Service — Parfums & Soins Naturels Premium

**HB Service** est une application web e-commerce premium pour une marque de parfums et soins naturels, construite avec **Next.js 16**, **Tailwind CSS v4**, **Prisma**, et **PostgreSQL (Supabase)**.

> ✨ Une expérience olfactive d'exception, née du savoir-faire africain et de la pureté des ingrédients naturels.

---

## 🚀 Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.2.6 | Framework full-stack (App Router, SSR, API) |
| **React** | 19+ | UI Components |
| **Tailwind CSS** | v4 | Styling utilitaire |
| **shadcn/ui** | latest | Composants UI accessibles |
| **Prisma** | latest | ORM (PostgreSQL) |
| **PostgreSQL** | Supabase | Base de données hébergée |
| **Framer Motion** | latest | Animations |
| **Recharts** | latest | Graphiques dashboard |

---

## ✨ Fonctionnalités

### 🛍️ E-commerce & Contenu Dynamique
- Catalogue produits avec collections (Signature, Botanique, Héritage)
- Fiches produits détaillées (notes olfactives, inspirations, galerie)
- Panier d'achat avec sélection de variantes (tailles)
- Checkout intégré
- **Paramètres du site 100% dynamiques** : Modifiez à la volée le logo, les titres, sous-titres, coordonnées (téléphone, e-mail, adresse), réseaux sociaux, les sections Storytelling et Réassurance, ainsi que les métadonnées SEO depuis le panneau admin.
- **Le Journal (Blog SEO)** : Section articles de blog dynamique avec éditeur de rédaction intégré pour booster le référencement naturel.

### 🎨 Design & Expérience
- **Mode sombre/clair** avec persistance (`localStorage`)
- Typographie élégante (Inter + Playfair Display)
- Animations fluides (Framer Motion)
- Design responsive et accessible
- Thème luxe (doré, blanc cassé, noir profond)
- **Impression de Factures optimisée** : Modèle de facture A4 épuré sans fioritures d'interface, prêt à l'impression papier ou PDF en un clic.

### 🔐 Administration & Sécurité
- Dashboard analytics (ventes, CA, panier moyen)
- Authentification admin et client sécurisée
- **Double Authentification (MFA)** : Sécurisation par QR Code (Google Authenticator/Authy) configurable dans le profil utilisateur.
- Gestion complète des produits, collections et commandes (CRUD)
- **Actions de masse (Bulk)** : Activation/désactivation de produits et mise à jour des commandes groupées en un clic.
- **Export CSV** : Export de la liste des commandes pour gestion comptable externe.

### ⚡ Optimisations & Performance
- **Régénération Statique Incrémentale (ISR)** : La page d'accueil se rafraîchit automatiquement toutes les 60 secondes en arrière-plan. Si vous modifiez une image ou un texte depuis l'admin (Supabase), la mise à jour est en ligne en moins d'une minute sans avoir à re-déployer le site.
- **URLs Propres (Clean URLs)** : Les URLs des produits utilisent désormais des slugs lisibles pour un meilleur SEO et une meilleure expérience de partage (ex: `?view=product&product=oud-home-spray`).
- **Prévention du Flash SPA** : L'utilisation optimisée de `useLayoutEffect` garantit que l'utilisateur arrive directement sur la page ciblée lors d'un rafraîchissement, sans voir la page d'accueil clignoter.
- **Mise en valeur "Maison"** : L'algorithme de la page d'accueil trie et propulse systématiquement les créations estampillées "HB_Service" en haut de la grille des nouveautés.

### 📚 Catalogue Maison
- **Surface publique** : `/[locale]/catalogue-maison` affiche dynamiquement tous les produits de la collection Maison (Bougies Parfumées, Home Sprays, Parfums d'intérieur, etc.). La page interroge directement la base de données en temps réel pour être toujours à jour.
- **Ajout rapide par script** : Des scripts spécifiques sont disponibles dans le dossier `scripts/` pour ajouter rapidement des produits avec leurs descriptions et prix convertis (ex: `add-bougie-760g.ts`, `add-home-spray.ts`). Pour les exécuter : `npx tsx scripts/<nom-du-script>.ts`.
- **Surface admin** : `/[locale]/admin/catalogue-maison` contient les outils d’import, d’aperçu, de fusion des doublons et d’export.
- **Imports supportés** : CSV, JSON et Excel `.xlsx`.
- **Aperçu avant import** : permet de valider les fiches générées avant écriture en base.
- **Anti-doublons** : fusion des doublons du lot, détection des noms déjà présents en base, et ajustement automatique des slugs.
- **Modèle Excel** : `public/downloads/catalogue-maison-import-template.xlsx`.

### 📡 API REST
- `GET /api/products` — Catalogue produits
- `GET /api/collections` — Collections
- `GET /api/orders` — Commandes (admin)
- `GET /api/analytics` — Statistiques (admin)
- `GET /api/catalogue-maison?mode=template` — Modèle CSV du catalogue maison
- `GET /api/catalogue-maison?mode=export` — Export du catalogue maison
- `POST /api/catalogue-maison` — Import CSV / JSON / `.xlsx` du catalogue maison (admin)
- `GET /api/settings` — Paramètres du site (GET / PUT)
- `POST /api/auth/login` — Connexion admin/client
- `POST /api/auth/logout` — Déconnexion
- `GET /api/auth/check` — Vérification session

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/           # Routes API (REST, including new /api/settings)
│   ├── globals.css    # Styles globaux + thème
│   ├── layout.tsx     # Layout racine (injecte les settings de la DB)
│   └── page.tsx       # Page d'accueil (charge les settings serveur)
├── components/
│   ├── ui/            # Composants shadcn/ui
│   ├── header.tsx     # Navigation (dynamic settings props)
│   ├── footer.tsx     # Pied de page (dynamic settings props)
│   ├── hero-section.tsx
│   ├── featured-products.tsx
│   ├── collections-section.tsx
│   ├── shop-view.tsx
│   ├── product-view.tsx
│   ├── product-card.tsx
│   ├── cart-drawer.tsx
│   ├── checkout-view.tsx
│   ├── home-client.tsx # Client wrapper dynamique pour l'accueil
│   ├── admin-dashboard-client.tsx # Dashboard admin enrichi avec l'onglet Paramètres
│   └── admin-login.tsx
├── hooks/
│   ├── use-theme.ts   # Hook mode sombre
│   └── use-toast.ts
├── lib/
│   ├── db.ts          # Client Prisma (PostgreSQL / Supabase)
│   ├── store.ts       # État global (Zustand)
│   ├── settings.ts    # Gestionnaire des paramètres du site (DEFAULT_SETTINGS + getSettings)
│   ├── seed.ts        # Données de démo
│   └── utils.ts       # Utilitaires
└── middleware.ts       # Protection routes admin
```

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** ≥ 18
- **npm** ou **yarn**

### Installation

```bash
# Cloner le projet
git clone https://github.com/dallha/Hb-Service.git
cd Hb-Service

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Initialiser la base de données
npx prisma db push

# (Optionnel) Charger les données de démonstration
# Accéder à /api/seed après le démarrage

# Lancer en développement
npm run dev
```

### Build Production

```bash
npm run build
npm start
```

---

## 🎨 Personnalisation du Thème

Les couleurs sont définies dans `src/app/globals.css` via des variables CSS :

```css
:root {
  --background: #f8f7f5;    /* Fond clair */
  --foreground: #1a1a1a;    /* Texte clair */
  --primary: #c9a84c;       /* Doré */
  --primary-foreground: #1a1a1a;
}

.dark {
  --background: #1a1a1a;    /* Fond sombre */
  --foreground: #f8f7f5;    /* Texte sombre */
  --primary: #c9a84c;       /* Doré conservé */
}
```

---

## 📦 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build production |
| `npm start` | Serveur production |
| `npm run lint` | Vérification ESLint |

---

## 🔒 Sécurité

- Authentification par session (cookies HTTP-only)
- Middleware de protection des routes admin
- Validation des entrées API
- Pas de secrets dans le code source
- `.env` exclu du versioning

---

## 📄 Licence

Projet privé — Tous droits réservés.

---

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants
- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Prisma](https://www.prisma.io/) pour l'ORM
