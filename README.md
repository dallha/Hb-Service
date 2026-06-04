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
- **Recherche Globale Intelligente** : Barre de recherche accessible depuis le header permettant de filtrer dynamiquement le catalogue par mot-clé (marque, parfum, genre).
- **Paramètres du site 100% dynamiques** : Modifiez à la volée le logo, les titres, sous-titres, coordonnées (téléphone, e-mail, adresse), réseaux sociaux, les sections Storytelling et Réassurance, ainsi que les métadonnées SEO depuis le panneau admin.
- **Le Journal (Blog SEO)** : Section articles de blog dynamique avec éditeur de rédaction intégré pour booster le référencement naturel.
- **Académie HB_Service (Formations)** : Page dédiée aux formations professionnelles (Parfumerie, Cosmétique) avec formulaire d'inscription redirigeant directement vers WhatsApp avec les données pré-remplies.
- **Upload d'Images Natif** : Intégration directe avec Supabase Storage (bucket `medias`) permettant d'uploader des photos depuis son ordinateur pour les produits, collections, et articles de blog sans avoir besoin de manipuler des URL externes.

### 🤖 Chatbot AI (Conseiller Virtuel)
- **Modèle Intelligent** : Intégration complète de l'API Google Gemini (`gemini-2.5-flash`) via le SDK Vercel AI pour offrir une expérience conversationnelle ultra-rapide et gratuite.
- **RAG (Retrieval-Augmented Generation)** : Le chatbot a directement accès au catalogue de produits (depuis la base de données PostgreSQL) en temps réel. Il peut suggérer des parfums, donner les prix, et décrire les produits exacts de la boutique.
- **UI Immersive** : Interface sous forme de tiroir latéral (Drawer) animée avec Framer Motion. 
- **Suggestions Intelligentes** : Boutons d'accès rapide pour les questions fréquentes ("Quels sont vos parfums les plus populaires ?", "Quelle est votre collection Signature ?").
- **Gestion d'Erreurs UI** : Le composant gère les déconnexions ou les erreurs de clé API avec des retours visuels immédiats pour l'utilisateur.

### 🎨 Design & Expérience
- **Mode sombre/clair** avec persistance (`localStorage`)
- Typographie élégante (Inter + Playfair Display)
- Animations fluides (Framer Motion)
- **Design 100% Mobile Responsive** : Optimisation des grilles de produits, gestion anti-débordement des typographies géantes (`break-words`), et espacement adaptatif du menu pour une navigation fluide sur smartphone.
- Thème luxe (doré, blanc cassé, noir profond)
- **Impression de Factures optimisée** : Modèle de facture A4 épuré sans fioritures d'interface, prêt à l'impression papier ou PDF en un clic.
- **Crédits Interactifs** : Le crédit d'identité visuelle (Graphiste de la Hadara) dans le pied de page ouvre une modale détaillée présentant les services, packages et contacts du designer.

### 🔐 Administration & Sécurité
- Dashboard analytics (ventes, CA, panier moyen)
- Authentification admin et client sécurisée
- **Double Authentification (MFA)** : Sécurisation par QR Code (Google Authenticator/Authy) configurable dans le profil utilisateur.
- **Gestion Complète** : Produits, collections, commandes, utilisateurs, codes promo et articles de blog (CRUD).
- **Étiquettes d'Expédition** : Génération instantanée d'une étiquette de livraison au format 10x15cm prête à être imprimée sur une imprimante thermique, avec code-barres simulé et infos d'expédition.
- **Gestion des Utilisateurs Avancée** : Promouvoir/Rétrograder les administrateurs, **Bloquer/Débloquer** un compte client, et **Réinitialisation de mot de passe** par e-mail en un clic.
- **Codes Promo Intelligents** : Bouton de génération de codes aléatoires sécurisés (ex: `HBS-XXXX`) pour créer des réductions rapidement.
- **Tableau de Bord & Statistiques** : Visualisation du chiffre d'affaires, panier moyen, avec **Filtres de dates** (7j, 30j, Année, Historique) et **Export CSV** pour la comptabilité.
- **Actions de masse (Bulk)** : Activation/désactivation de produits et mise à jour des commandes groupées en un clic.
- **Protection du Droit d'Auteur** : Le crédit d'identité visuelle (Graphiste de la Hadara) est verrouillé dans le code source et ne peut pas être modifié depuis le tableau de bord, garantissant ainsi la pérennité de la signature de l'auteur.

### ⚡ Optimisations & Performance
- **Régénération Statique Incrémentale (ISR)** : La page d'accueil se rafraîchit automatiquement toutes les 60 secondes en arrière-plan. Si vous modifiez une image ou un texte depuis l'admin (Supabase), la mise à jour est en ligne en moins d'une minute sans avoir à re-déployer le site.
- **URLs Propres (Clean URLs)** : Les URLs des produits utilisent désormais des slugs lisibles pour un meilleur SEO et une meilleure expérience de partage (ex: `?view=product&product=oud-home-spray`).
- **Prévention du Flash SPA** : L'utilisation optimisée de `useLayoutEffect` garantit que l'utilisateur arrive directement sur la page ciblée lors d'un rafraîchissement, sans voir la page d'accueil clignoter.
- **Mise en valeur "Maison"** : L'algorithme de la page d'accueil trie et propulse systématiquement les créations estampillées "HB_Service" en haut de la grille des nouveautés.

