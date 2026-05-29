# HB Service — Parfums & Soins Naturels Premium

**HB Service** est une application web e-commerce premium pour une marque de parfums et soins naturels, construite avec **Next.js 16**, **Tailwind CSS v4**, **Prisma**, et **SQLite**.

> ✨ Une expérience olfactive d'exception, née du savoir-faire africain et de la pureté des ingrédients naturels.

---

## 🚀 Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.2.6 | Framework full-stack (App Router, SSR, API) |
| **React** | 19+ | UI Components |
| **Tailwind CSS** | v4 | Styling utilitaire |
| **shadcn/ui** | latest | Composants UI accessibles |
| **Prisma** | latest | ORM (SQLite) |
| **SQLite** | — | Base de données embarquée |
| **Framer Motion** | latest | Animations |
| **Recharts** | latest | Graphiques dashboard |

---

## ✨ Fonctionnalités

### 🛍️ E-commerce
- Catalogue produits avec collections (Signature, Botanique, Héritage)
- Fiches produits détaillées (notes olfactives, inspirations, galerie)
- Panier d'achat avec sélection de variantes (tailles)
- Checkout intégré

### 🎨 Design
- **Mode sombre/clair** avec persistance (`localStorage`)
- Typographie élégante (Inter + Playfair Display)
- Animations fluides (Framer Motion)
- Design responsive et accessible
- Thème luxe (doré, blanc cassé, noir profond)

### 🔐 Administration
- Dashboard analytics (ventes, produits populaires)
- Authentification admin sécurisée
- Gestion des commandes

### 📡 API REST
- `GET /api/products` — Catalogue produits
- `GET /api/collections` — Collections
- `GET /api/orders` — Commandes (admin)
- `GET /api/analytics` — Statistiques (admin)
- `POST /api/auth/login` — Connexion admin
- `POST /api/auth/logout` — Déconnexion
- `GET /api/auth/check` — Vérification session

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/           # Routes API (REST)
│   ├── globals.css    # Styles globaux + thème
│   ├── layout.tsx     # Layout racine
│   └── page.tsx       # Page d'accueil
├── components/
│   ├── ui/            # Composants shadcn/ui
│   ├── header.tsx     # Navigation
│   ├── footer.tsx     # Pied de page
│   ├── hero-section.tsx
│   ├── featured-products.tsx
│   ├── collections-section.tsx
│   ├── shop-view.tsx
│   ├── product-view.tsx
│   ├── product-card.tsx
│   ├── cart-drawer.tsx
│   ├── checkout-view.tsx
│   ├── dashboard-view.tsx
│   └── admin-login.tsx
├── hooks/
│   ├── use-theme.ts   # Hook mode sombre
│   └── use-toast.ts
├── lib/
│   ├── db.ts          # Client Prisma
│   ├── store.ts       # État global (Zustand)
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
