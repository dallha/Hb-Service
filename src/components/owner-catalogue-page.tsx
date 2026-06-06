'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Droplets,
  Flame,
  FlaskConical,
  Sparkles,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import type { SiteSettingsMap } from '@/lib/settings';

type CategoryCard = {
  title: string;
  description: string;
  icon: typeof Sparkles;
  accent: string;
};

const categories: CategoryCard[] = [
  {
    title: 'Parfums',
    description: 'La famille principale du propriétaire: eau de parfum, extrait, brumes et signatures olfactives.',
    icon: Sparkles,
    accent: 'Priorité',
  },
  {
    title: 'Bougies',
    description: 'Bougies parfumées et objets d’ambiance pour élargir le catalogue maison.',
    icon: Flame,
    accent: 'Maison',
  },
  {
    title: 'Huiles',
    description: 'Huiles parfumées, huiles de soin et déclinaisons flacon/roll-on.',
    icon: Droplets,
    accent: 'Soin',
  },
  {
    title: 'Autres produits',
    description: 'Soins, accessoires et futures familles produits à brancher plus tard si besoin.',
    icon: FlaskConical,
    accent: 'Suite',
  },
];

const importFields = [
  'Nom du produit',
  'Catégorie',
  'Marque / maison',
  'Genre',
  'Format / taille',
  'Prix',
  'Description courte',
  'Ordre d’affichage',
  'Image',
];

export default function OwnerCataloguePage({ settings = {} }: { settings?: SiteSettingsMap }) {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rawNames, setRawNames] = useState('');
  const [defaultBrand, setDefaultBrand] = useState('HB Maison');
  const [defaultCategory, setDefaultCategory] = useState('Parfum');
  const [defaultGender, setDefaultGender] = useState('U');
  const [defaultSize, setDefaultSize] = useState('Standard');
  const [defaultPrice, setDefaultPrice] = useState('0');
  const [defaultStock, setDefaultStock] = useState('0');
  const [defaultIsNew, setDefaultIsNew] = useState(false);
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [rawPreview, setRawPreview] = useState<Array<{
    name: string;
    slug: string;
    brand: string | null;
    category: string | null;
    gender: string | null;
    size: string;
    price: number;
    stock: number;
    isNew: boolean;
    order: number;
  }> | null>(null);
  const [rawPreviewCounts, setRawPreviewCounts] = useState<{ products: number; variants: number } | null>(null);
  const [rawDuplicateSummary, setRawDuplicateSummary] = useState<{
    merged: string[];
    existingNames: string[];
    slugAdjustments: Array<{ name: string; from: string; to: string }>;
  }>({
    merged: [],
    existingNames: [],
    slugAdjustments: [],
  });
  const locale = pathname?.split('/')[1] || 'fr';

  const headline = settings.story_1_title || 'Catalogue Maison HB_Service';
  const subtitle = settings.storytelling_hero_subtitle || 'Un espace dédié aux produits créés par le propriétaire: parfums, bougies, huiles et autres références de la maison.';

  const downloadCsv = async (mode: 'template' | 'export') => {
    setIsBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/catalogue-maison?mode=${mode}`);
      if (!res.ok) throw new Error('Impossible de générer le fichier');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = mode === 'template' ? 'catalogue-maison-template.csv' : 'catalogue-maison.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage(mode === 'template' ? 'Modèle CSV téléchargé.' : 'Export CSV téléchargé.');
    } catch {
      setMessage('Erreur lors du téléchargement.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage('Choisis un fichier CSV, JSON ou Excel avant d’importer.');
      return;
    }

    setIsBusy(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mergeDuplicates', String(mergeDuplicates));
      const res = await fetch('/api/catalogue-maison', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      setMessage(`Import réussi: ${data.counts?.products ?? 0} produits, ${data.counts?.variants ?? 0} variantes.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setRawPreview(null);
      setRawPreviewCounts(null);
      setRawDuplicateSummary(data.duplicates ?? { merged: [], existingNames: [], slugAdjustments: [] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur lors de l’import.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFilePreview = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage('Choisis un fichier CSV, JSON ou Excel avant de prévisualiser.');
      return;
    }

    setIsBusy(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('previewOnly', 'true');
      formData.append('mergeDuplicates', String(mergeDuplicates));
      const res = await fetch('/api/catalogue-maison', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Preview failed');
      setRawPreview(data.preview ?? []);
      setRawPreviewCounts(data.counts ?? null);
      setRawDuplicateSummary(data.duplicates ?? { merged: [], existingNames: [], slugAdjustments: [] });
      setMessage(`Aperçu généré: ${data.counts?.products ?? 0} produits, ${data.counts?.variants ?? 0} variantes.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur lors de l’aperçu.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRawImport = async () => {
    const names = rawNames
      .split(/\r?\n|[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setMessage('Colle au moins un nom de produit avant d’importer.');
      return;
    }

    setIsBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/catalogue-maison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names,
          defaults: {
            defaultBrand,
            defaultCategory,
            defaultGender,
            defaultDescription: '',
            defaultSize,
            defaultPrice: Number(defaultPrice) || 0,
            defaultCompareAtPrice: null,
            defaultStock: Number(defaultStock) || 0,
            defaultIsNew,
          },
          mergeDuplicates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      setMessage(`Auto-remplissage réussi: ${data.counts?.products ?? 0} produits, ${data.counts?.variants ?? 0} variantes.`);
      setRawNames('');
      setRawPreview(null);
      setRawPreviewCounts(null);
      setRawDuplicateSummary(data.duplicates ?? { merged: [], existingNames: [], slugAdjustments: [] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur lors de l’auto-remplissage.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRawPreview = async () => {
    const names = rawNames
      .split(/\r?\n|[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setMessage('Colle au moins un nom de produit avant de prévisualiser.');
      return;
    }

    setIsBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/catalogue-maison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          names,
          previewOnly: true,
          defaults: {
            defaultBrand,
            defaultCategory,
            defaultGender,
            defaultDescription: '',
            defaultSize,
            defaultPrice: Number(defaultPrice) || 0,
            defaultCompareAtPrice: null,
            defaultStock: Number(defaultStock) || 0,
            defaultIsNew,
          },
          mergeDuplicates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Preview failed');
      setRawPreview(data.preview ?? []);
      setRawPreviewCounts(data.counts ?? null);
      setRawDuplicateSummary(data.duplicates ?? { merged: [], existingNames: [], slugAdjustments: [] });
      setMessage(`Aperçu généré: ${data.counts?.products ?? 0} produits, ${data.counts?.variants ?? 0} variantes.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur lors de l’aperçu.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(26,26,26,0.08),_transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <nav className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-muted-foreground mb-8 flex-wrap">
            <button onClick={() => router.push(`/${locale}`)} className="hover:text-accent transition-colors">
              Accueil
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Catalogue Maison</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Terrain préparé pour import futur
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-5">
                {headline}
              </h1>
              <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/${locale}/admin`)}
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none"
                >
                  Préparer l’import
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none hover:border-accent hover:text-accent transition-colors"
                >
                  Retour accueil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Familles', value: '4' },
                { label: 'Prêt pour import', value: 'Oui' },
                { label: 'Produits existants', value: 'À créer' },
                { label: 'Statut', value: 'En préparation' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="border border-border bg-card/80 p-5 sm:p-6"
                >
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-3">
                    {item.label}
                  </p>
                  <p className="font-serif text-2xl text-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.article
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="p-6 border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37]">
                      {category.accent}
                    </span>
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="font-serif text-2xl text-foreground mb-3">
                    {category.title}
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Structure d’import
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
                Champs à préparer avant l’import
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                Quand la liste des noms est prête, on peut injecter le fichier sans recréer le modèle. Il suffit de remplir les champs de base ci-dessous.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importFields.map((field) => (
                <div key={field} className="border border-border bg-background p-4">
                  <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                    {field}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Import / Export
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
                Outils de transfert du catalogue
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                Tu peux télécharger un modèle Excel avec exemples, exporter la collection actuelle ou importer un fichier rempli quand la liste des noms sera prête.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/downloads/catalogue-maison-import-template.xlsx"
                  download
                  className="inline-flex items-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel avec exemples
                </a>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => downloadCsv('template')}
                  className="inline-flex items-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Modèle CSV
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => downloadCsv('export')}
                  className="inline-flex items-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export actuel
                </button>
              </div>
            </div>

            <div className="border border-border bg-background p-6 sm:p-8 space-y-4">
              <div>
                <label className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-2">
                  Fichier CSV, JSON ou Excel
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:border-0 file:bg-foreground file:text-background file:px-4 file:py-2 file:uppercase file:tracking-widest file:text-xs file:rounded-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleFilePreview}
                  className="inline-flex items-center gap-2 border border-border text-foreground font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  Aperçu fichier
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleImport}
                  className="inline-flex items-center gap-2 bg-foreground text-background font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Importer le fichier
                </button>
              </div>

              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Format attendu: `nom`, `slug`, `marque`, `categorie`, `genre`, `description`, `nouveau`, `page_source`, `nom_arabe`, `image_url`, `taille`, `prix`, `prix_barre`, `stock`, `sku`, `ordre`.
              </p>
              {message && (
                <p className="font-sans text-sm text-foreground border-t border-border pt-4">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Auto-remplissage rapide
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
                Coller une liste brute de noms
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                Colle un nom par ligne, puis le système génère les fiches de base tout seul. C’est l’option à utiliser quand la liste des produits est prête mais pas encore structurée.
              </p>
              <div className="mt-6 rounded-none border border-border bg-card/60 p-4 space-y-2">
                <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Format conseillé
                </p>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  Un nom par ligne. Les virgules et points-virgules sont aussi acceptés.
                </p>
              </div>
            </div>

            <div className="border border-border bg-background p-6 sm:p-8 space-y-5">
              <div>
                <label className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-2">
                  Liste brute de noms
                </label>
                <textarea
                  value={rawNames}
                  onChange={(event) => setRawNames(event.target.value)}
                  rows={8}
                  placeholder={`Oud Noir Intense\nBougie Ambre Doux\nHuile Rose Safran`}
                  className="block w-full border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Marque par défaut
                  </span>
                  <input
                    value={defaultBrand}
                    onChange={(event) => setDefaultBrand(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Famille
                  </span>
                  <input
                    value={defaultCategory}
                    onChange={(event) => setDefaultCategory(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Genre
                  </span>
                  <select
                    value={defaultGender}
                    onChange={(event) => setDefaultGender(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  >
                    <option value="none">Aucun</option>
                    <option value="U">Unisexe (U)</option>
                    <option value="H">Homme (H)</option>
                    <option value="F">Femme (F)</option>
                    <option value="SOIN">Soin</option>
                    <option value="CORPS">Corps</option>
                    <option value="MAISON">Maison</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Taille
                  </span>
                  <input
                    value={defaultSize}
                    onChange={(event) => setDefaultSize(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Prix par défaut
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={defaultPrice}
                    onChange={(event) => setDefaultPrice(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Stock par défaut
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={defaultStock}
                    onChange={(event) => setDefaultStock(event.target.value)}
                    className="block w-full border border-border bg-background p-3 text-sm text-foreground"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={defaultIsNew}
                  onChange={(event) => setDefaultIsNew(event.target.checked)}
                  className="h-4 w-4 border-border text-foreground"
                />
                Marquer tous les produits comme nouveaux
              </label>

              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={mergeDuplicates}
                  onChange={(event) => setMergeDuplicates(event.target.checked)}
                  className="h-4 w-4 border-border text-foreground"
                />
                Fusionner les doublons
              </label>

              <button
                type="button"
                disabled={isBusy}
                onClick={handleRawImport}
                className="inline-flex items-center gap-2 bg-foreground text-background font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Importer la liste brute
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={handleRawPreview}
                className="inline-flex items-center gap-2 border border-border text-foreground font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                Aperçu avant import
              </button>

              {rawPreviewCounts && (
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
                  Aperçu calculé sur {rawPreviewCounts.products} produits et {rawPreviewCounts.variants} variantes
                </p>
              )}

              {(rawDuplicateSummary.merged.length > 0 || rawDuplicateSummary.existingNames.length > 0 || rawDuplicateSummary.slugAdjustments.length > 0) && (
                <div className="rounded-none border border-amber-500/40 bg-amber-500/5 p-4">
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-amber-700 mb-2">
                    Doublons et collisions
                  </p>
                  {rawDuplicateSummary.merged.length > 0 && (
                    <p className="font-sans text-sm text-foreground leading-relaxed">
                      {rawDuplicateSummary.merged.length} doublon(s) ont été fusionné(s) dans le lot.
                    </p>
                  )}
                  {rawDuplicateSummary.existingNames.length > 0 && (
                    <p className="font-sans text-sm text-foreground leading-relaxed mt-2">
                      {rawDuplicateSummary.existingNames.length} nom(s) existent déjà dans la base et ont été ignorés.
                    </p>
                  )}
                  {rawDuplicateSummary.slugAdjustments.length > 0 && (
                    <p className="font-sans text-sm text-foreground leading-relaxed mt-2">
                      {rawDuplicateSummary.slugAdjustments.length} slug(s) ont été ajustés pour rester uniques.
                    </p>
                  )}
                  {rawDuplicateSummary.merged.length > 0 && (
                    <p className="font-sans text-xs text-muted-foreground mt-2">
                      Fusionnés: {rawDuplicateSummary.merged.slice(0, 8).join(', ')}
                      {rawDuplicateSummary.merged.length > 8 ? '…' : ''}
                    </p>
                  )}
                  {rawDuplicateSummary.existingNames.length > 0 && (
                    <p className="font-sans text-xs text-muted-foreground mt-2">
                      Déjà présents: {rawDuplicateSummary.existingNames.slice(0, 8).join(', ')}
                      {rawDuplicateSummary.existingNames.length > 8 ? '…' : ''}
                    </p>
                  )}
                </div>
              )}

              {rawPreview && rawPreview.length > 0 && (
                <div className="border-t border-border pt-5 space-y-3">
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                    Premières fiches générées
                  </p>
                  <div className="max-h-64 overflow-auto border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-widest">
                        <tr>
                          <th className="px-3 py-2">Nom</th>
                          <th className="px-3 py-2">Slug</th>
                          <th className="px-3 py-2">Famille</th>
                          <th className="px-3 py-2">Genre</th>
                          <th className="px-3 py-2">Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawPreview.map((item) => (
                          <tr key={item.slug} className="border-t border-border">
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">{item.slug}</td>
                            <td className="px-3 py-2">{item.category || '—'}</td>
                            <td className="px-3 py-2">{item.gender || '—'}</td>
                            <td className="px-3 py-2">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              '1. Le propriétaire prépare la liste des noms.',
              '2. On mappe les familles et les champs d’import.',
              '3. On injecte le catalogue complet dans les produits du site.',
            ].map((step, index) => (
              <div key={step} className="p-6 border border-border bg-card">
                <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] mb-3">
                  Étape {index + 1}
                </p>
                <p className="font-serif text-xl text-foreground leading-snug">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
