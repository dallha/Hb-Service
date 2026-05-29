'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Package, TrendingUp, ChevronLeft,
  Plus, Pencil, Trash2, X, Save, Search, Eye, ChevronDown,
  LayoutGrid, FolderOpen, ClipboardList, BarChart3, Upload,
  AlertTriangle,
} from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

// ─── Types ──────────────────────────────────────────────────────

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  heroText: string | null;
  sortOrder: number;
  products: Product[];
}

interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
  sku: string | null;
}

interface Product {
  id: string;
  collectionId: string;
  name: string;
  slug: string;
  description: string | null;
  notesOlfactives: string | null;
  inspiration: string | null;
  imageUrl: string | null;
  galleryUrls: string | null;
  relatedRitualIds: string | null;
  isActive: boolean;
  collection?: Collection;
  variants: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
}

interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  variant: { product: { name: string }; size: string };
}

interface Payment {
  id: string;
  provider: string;
  status: string;
  reference: string | null;
}

interface Order {
  id: string;
  guestEmail: string | null;
  guestPhone: string | null;
  totalAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
}

interface Analytics {
  totalRevenue: number;
  orderCount: number;
  aov: number;
  productCount: number;
  recentOrderList: Order[];
  dailyRevenue: Record<string, number>;
}

type AdminTab = 'analytics' | 'products' | 'collections' | 'orders';

// ─── Status Helpers ─────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'bg-[#D4A037]/15 text-[#D4A037]',
  confirmed: 'bg-[#D4AF37]/15 text-[#D4AF37]',
  processing: 'bg-[#D4AF37]/15 text-[#D4AF37]',
  shipped: 'bg-[#4A7C59]/15 text-[#4A7C59]',
  delivered: 'bg-[#4A7C59]/15 text-[#4A7C59]',
  cancelled: 'bg-[#C44536]/15 text-[#C44536]',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-[#D4A037]/15 text-[#D4A037]',
  processing: 'bg-[#D4AF37]/15 text-[#D4AF37]',
  completed: 'bg-[#4A7C59]/15 text-[#4A7C59]',
  failed: 'bg-[#C44536]/15 text-[#C44536]',
  refunded: 'bg-[#8C8C8C]/15 text-[#8C8C8C]',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const paymentProviderLabels: Record<string, string> = {
  stripe: 'Carte bancaire',
  wave: 'Wave',
  orange_money: 'Orange Money',
  cash: 'Paiement à la livraison',
  pending: 'Non défini',
};

// ─── Main Component ─────────────────────────────────────────────

export default function DashboardView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigationStore();
  const { toast } = useToast();

  // ─── Data Fetching ──────────────────────────────────────────

  const fetchAnalytics = useCallback(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, []);

  const fetchProducts = useCallback(() => {
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const fetchCollections = useCallback(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then(setCollections)
      .catch(console.error);
  }, []);

  const fetchOrders = useCallback(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchAnalytics(),
        fetchProducts(),
        fetchCollections(),
        fetchOrders(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [fetchAnalytics, fetchProducts, fetchCollections, fetchOrders]);

  // ─── Toast Helper ───────────────────────────────────────────

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({ title: message, variant });
  };

  // ─── Chart Data ─────────────────────────────────────────────

  const chartData = analytics
    ? Object.entries(analytics.dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          revenue,
        }))
    : [];

  // ─── Filtered Data ──────────────────────────────────────────

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.guestEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.guestPhone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Tabs Config ────────────────────────────────────────────

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: 'Statistiques', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-20 sm:pt-24 pb-16 bg-[#F8F7F5]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] hover:text-[#D4AF37] transition-colors mb-4 sm:mb-6"
        >
          <ChevronLeft className="w-3 h-3" />
          Retour à l&apos;accueil
        </button>

        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A]">
            Administration
          </h1>
          <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-[#8C8C8C]">
            HB_Service
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 font-sans text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap transition-all duration-300 rounded-sm ${
                activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-[#F8F7F5]'
                  : 'bg-white text-[#8C8C8C] border border-[#E8E0D5] hover:border-[#D4AF37] hover:text-[#1A1A1A]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <AnalyticsTab
              analytics={analytics}
              chartData={chartData}
              loading={loading}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              products={filteredProducts}
              collections={collections}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRefresh={fetchProducts}
              showToast={showToast}
            />
          )}
          {activeTab === 'collections' && (
            <CollectionsTab
              collections={collections}
              onRefresh={fetchCollections}
              showToast={showToast}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={filteredOrders}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRefresh={fetchOrders}
              showToast={showToast}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Analytics Tab ──────────────────────────────────────────────

function AnalyticsTab({ analytics, chartData, loading }: {
  analytics: Analytics | null;
  chartData: { date: string; revenue: number }[];
  loading: boolean;
}) {
  if (loading) return <LoadingSkeleton />;

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[
          { label: 'CA Total', value: analytics ? formatPrice(analytics.totalRevenue) : '—', icon: DollarSign },
          { label: 'Panier Moyen', value: analytics ? formatPrice(Math.round(analytics.aov)) : '—', icon: TrendingUp },
          { label: 'Commandes', value: analytics?.orderCount.toString() || '—', icon: ShoppingCart },
          { label: 'Produits Actifs', value: analytics?.productCount.toString() || '—', icon: Package },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white p-3 sm:p-6 rounded-sm border border-[#E8E0D5]"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#F5F0E8] flex items-center justify-center">
                <card.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
              </div>
              <span className="font-sans text-[9px] sm:text-xs tracking-wider uppercase text-[#8C8C8C]">
                {card.label}
              </span>
            </div>
            <p className="font-serif text-base sm:text-2xl text-[#1A1A1A]">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-3 sm:p-6 rounded-sm border border-[#E8E0D5]">
        <h2 className="font-serif text-sm sm:text-lg text-[#1A1A1A] mb-4 sm:mb-6">
          Chiffre d&apos;Affaires (30 jours)
        </h2>
        <div className="h-48 sm:h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={{ stroke: '#E8E0D5' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8C8C8C' }} axisLine={{ stroke: '#E8E0D5' }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), 'CA']}
                  contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, border: '1px solid #E8E0D5', borderRadius: 0 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="font-sans text-sm text-[#8C8C8C]">Aucune donnée de revenu disponible</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Products Tab ───────────────────────────────────────────────

function ProductsTab({ products, collections, searchQuery, setSearchQuery, onRefresh, showToast }: {
  products: Product[];
  collections: Collection[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', description: '', notesOlfactives: '', inspiration: '',
    imageUrl: '', galleryUrls: '', relatedRitualIds: '', collectionId: '', isActive: true,
  });
  const [formVariants, setFormVariants] = useState<{ size: string; price: number; stock: number; sku: string }[]>([
    { size: '50ml', price: 0, stock: 0, sku: '' },
  ]);

  const openCreate = () => {
    setIsCreateMode(true);
    setEditingProduct(null);
    setForm({
      name: '', slug: '', description: '', notesOlfactives: '', inspiration: '',
      imageUrl: '', galleryUrls: '', relatedRitualIds: '', collectionId: collections[0]?.id || '', isActive: true,
    });
    setFormVariants([{ size: '50ml', price: 0, stock: 0, sku: '' }]);
  };

  const openEdit = (product: Product) => {
    setIsCreateMode(false);
    setEditingProduct(product);
    let notesStr = '';
    if (product.notesOlfactives) {
      try {
        const parsed = JSON.parse(product.notesOlfactives);
        notesStr = Object.entries(parsed)
          .map(([key, arr]) => `${key}: ${(arr as string[]).join(', ')}`)
          .join('\n');
      } catch { notesStr = product.notesOlfactives; }
    }
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      notesOlfactives: notesStr,
      inspiration: product.inspiration || '',
      imageUrl: product.imageUrl || '',
      galleryUrls: product.galleryUrls ? (JSON.parse(product.galleryUrls) as string[]).join(', ') : '',
      relatedRitualIds: product.relatedRitualIds ? (JSON.parse(product.relatedRitualIds) as string[]).join(', ') : '',
      collectionId: product.collectionId,
      isActive: product.isActive,
    });
    setFormVariants(
      product.variants.length > 0
        ? product.variants.map((v) => ({ size: v.size, price: v.price, stock: v.stock, sku: v.sku || '' }))
        : [{ size: '50ml', price: 0, stock: 0, sku: '' }]
    );
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ô]/g, 'o').replace(/[îï]/g, 'i')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.collectionId) {
      showToast('Nom, slug et collection sont requis', 'destructive');
      return;
    }

    const body: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      inspiration: form.inspiration || null,
      imageUrl: form.imageUrl || null,
      galleryUrls: form.galleryUrls ? JSON.stringify(form.galleryUrls.split(',').map((s) => s.trim())) : null,
      relatedRitualIds: form.relatedRitualIds ? JSON.stringify(form.relatedRitualIds.split(',').map((s) => s.trim())) : null,
      isActive: form.isActive,
      collectionId: form.collectionId,
      variants: formVariants.filter((v) => v.size && v.price > 0).map((v) => ({
        size: v.size,
        price: v.price,
        stock: v.stock,
        sku: v.sku || null,
      })),
    };

    // Parse notesOlfactives into structured JSON
    if (form.notesOlfactives) {
      const notes: Record<string, string[]> = {};
      form.notesOlfactives.split('\n').forEach((line) => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
          const label = key.trim().toLowerCase() === 'head' ? 'head' : key.trim().toLowerCase() === 'heart' ? 'heart' : key.trim().toLowerCase() === 'base' ? 'base' : key.trim();
          notes[label] = rest.join(':').split(',').map((s) => s.trim()).filter(Boolean);
        }
      });
      body.notesOlfactives = Object.keys(notes).length > 0 ? JSON.stringify(notes) : null;
    } else {
      body.notesOlfactives = null;
    }

    try {
      if (isCreateMode) {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur lors de la création');
        }
        showToast('Produit créé avec succès');
      } else if (editingProduct) {
        body.id = editingProduct.id;
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur lors de la mise à jour');
        }
        showToast('Produit mis à jour');
      }
      setEditingProduct(null);
      setIsCreateMode(false);
      onRefresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur', 'destructive');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      showToast('Produit supprimé');
      setDeleteConfirm(null);
      setEditingProduct(null);
      onRefresh();
    } catch {
      showToast('Erreur lors de la suppression', 'destructive');
    }
  };

  const addVariant = () => {
    setFormVariants([...formVariants, { size: '', price: 0, stock: 0, sku: '' }]);
  };

  const removeVariant = (index: number) => {
    setFormVariants(formVariants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...formVariants];
    updated[index] = { ...updated[index], [field]: value };
    setFormVariants(updated);
  };

  return (
    <motion.div
      key="products"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-sm border border-[#E8E0D5] p-12 text-center">
          <Package className="w-12 h-12 text-[#E8E0D5] mx-auto mb-4" />
          <p className="font-sans text-sm text-[#8C8C8C]">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-sm border border-[#E8E0D5] overflow-hidden group hover:border-[#D4AF37] transition-colors"
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 bg-[#F5F0E8] overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-10 h-10 text-[#E8E0D5]" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-wider uppercase ${
                    product.isActive ? 'bg-[#4A7C59]/15 text-[#4A7C59]' : 'bg-[#C44536]/15 text-[#C44536]'
                  }`}>
                    {product.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    onClick={() => openEdit(product)}
                    className="bg-white text-[#1A1A1A] rounded-none font-sans text-xs tracking-wider uppercase hover:bg-[#D4AF37] hover:text-[#1A1A1A] h-9 px-4"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-sm sm:text-base text-[#1A1A1A] leading-tight">
                    {product.name}
                  </h3>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="text-[#8C8C8C] hover:text-[#C44536] transition-colors shrink-0 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-sans text-[10px] sm:text-xs text-[#8C8C8C] mb-2">
                  {product.collection?.name || '—'}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {product.variants.map((v) => (
                    <span key={v.id} className="inline-block px-2 py-0.5 bg-[#F5F0E8] text-[10px] font-sans text-[#1A1A1A]">
                      {v.size} — {formatPrice(v.price)}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] text-[#8C8C8C]">
                    Stock total: {product.variants.reduce((s, v) => s + v.stock, 0)}
                  </span>
                  <button
                    onClick={() => openEdit(product)}
                    className="font-sans text-[10px] sm:text-xs text-[#D4AF37] hover:text-[#B8962E] transition-colors tracking-wider uppercase"
                  >
                    Éditer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Edit Sheet */}
      <Sheet open={!!editingProduct || isCreateMode} onOpenChange={(open) => { if (!open) { setEditingProduct(null); setIsCreateMode(false); } }}>
        <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-[540px] bg-[#F8F7F5] p-0 overflow-y-auto">
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-[#E8E0D5]">
            <SheetTitle className="font-serif text-xl text-[#1A1A1A]">
              {isCreateMode ? 'Nouveau Produit' : `Modifier — ${editingProduct?.name}`}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 sm:px-6 py-6 space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Nom *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) });
                    }}
                    className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                    placeholder="Sillage d'Or"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                    placeholder="sillage-dor"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Collection *</label>
                <Select value={form.collectionId} onValueChange={(v) => setForm({ ...form, collectionId: v })}>
                  <SelectTrigger className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10">
                    <SelectValue placeholder="Sélectionner une collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm min-h-[100px]"
                  placeholder="Description du produit..."
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Notes Olfactives</label>
                <Textarea
                  value={form.notesOlfactives}
                  onChange={(e) => setForm({ ...form, notesOlfactives: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm min-h-[80px]"
                  placeholder={"head: Bergamote, Mandarine, Safran\nheart: Rose de Damas, Jasmin\nbase: Ambre, Musc blanc"}
                />
                <p className="font-sans text-[9px] text-[#8C8C8C] mt-1">Format: head: note1, note2 / heart: ... / base: ...</p>
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Inspiration</label>
                <Textarea
                  value={form.inspiration}
                  onChange={(e) => setForm({ ...form, inspiration: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm min-h-[60px]"
                  placeholder="L'histoire derrière ce produit..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Image URL</label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                    placeholder="/images/products/perfume.png"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">IDs Rituel (séparés par virgule)</label>
                  <Input
                    value={form.relatedRitualIds}
                    onChange={(e) => setForm({ ...form, relatedRitualIds: e.target.value })}
                    className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                    placeholder="id1, id2, id3"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Galerie URLs (séparées par virgule)</label>
                <Input
                  value={form.galleryUrls}
                  onChange={(e) => setForm({ ...form, galleryUrls: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                  placeholder="/img1.png, /img2.png"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="font-sans text-sm text-[#1A1A1A]">Produit actif</span>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm text-[#1A1A1A]">Variantes (Tailles & Prix)</h3>
                <Button
                  onClick={addVariant}
                  variant="ghost"
                  size="sm"
                  className="text-[#D4AF37] hover:text-[#B8962E] font-sans text-xs rounded-none"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3">
                {formVariants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white p-3 border border-[#E8E0D5]">
                    <div className="col-span-3">
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Taille</label>
                      <Input
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="border-[#E8E0D5] rounded-none font-sans text-sm h-8"
                        placeholder="50ml"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Prix FCFA</label>
                      <Input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                        className="border-[#E8E0D5] rounded-none font-sans text-sm h-8"
                        placeholder="35000"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Stock</label>
                      <Input
                        type="number"
                        value={variant.stock || ''}
                        onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                        className="border-[#E8E0D5] rounded-none font-sans text-sm h-8"
                        placeholder="25"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">SKU</label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="border-[#E8E0D5] rounded-none font-sans text-sm h-8"
                        placeholder="SGO-50"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {formVariants.length > 1 && (
                        <button onClick={() => removeVariant(index)} className="text-[#C44536] hover:text-[#C44536]/70 p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 sm:px-6 py-4 border-t border-[#E8E0D5] flex-row gap-3">
            <Button
              onClick={() => { setEditingProduct(null); setIsCreateMode(false); }}
              variant="outline"
              className="flex-1 rounded-none font-sans text-xs tracking-wider uppercase border-[#E8E0D5] h-10"
            >
              Annuler
            </Button>
            {!isCreateMode && editingProduct && (
              <Button
                onClick={() => handleDelete(editingProduct.id)}
                variant="outline"
                className="rounded-none font-sans text-xs tracking-wider uppercase text-[#C44536] border-[#C44536]/30 hover:bg-[#C44536]/10 h-10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isCreateMode ? 'Créer' : 'Sauvegarder'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#F8F7F5] border-[#E8E0D5] rounded-none max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#1A1A1A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C44536]" />
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-[#8C8C8C]">
            Cette action est irréversible. Le produit et toutes ses variantes seront supprimés.
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="rounded-none font-sans text-xs">
              Annuler
            </Button>
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-[#C44536] hover:bg-[#C44536]/90 text-white rounded-none font-sans text-xs">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Collections Tab ────────────────────────────────────────────

function CollectionsTab({ collections, onRefresh, showToast }: {
  collections: Collection[];
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', imageUrl: '', heroText: '', sortOrder: 0,
  });

  const openCreate = () => {
    setIsCreateMode(true);
    setEditingCollection(null);
    setForm({ name: '', slug: '', description: '', imageUrl: '', heroText: '', sortOrder: 0 });
  };

  const openEdit = (collection: Collection) => {
    setIsCreateMode(false);
    setEditingCollection(collection);
    setForm({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      imageUrl: collection.imageUrl || '',
      heroText: collection.heroText || '',
      sortOrder: collection.sortOrder,
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ô]/g, 'o').replace(/[îï]/g, 'i')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      showToast('Nom et slug sont requis', 'destructive');
      return;
    }

    const body = {
      ...(isCreateMode ? {} : { id: editingCollection?.id }),
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      heroText: form.heroText || null,
      sortOrder: form.sortOrder,
    };

    try {
      const res = await fetch('/api/collections', {
        method: isCreateMode ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      showToast(isCreateMode ? 'Collection créée' : 'Collection mise à jour');
      setEditingCollection(null);
      setIsCreateMode(false);
      onRefresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur', 'destructive');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
      showToast('Collection supprimée');
      setDeleteConfirm(null);
      setEditingCollection(null);
      setIsCreateMode(false);
      onRefresh();
    } catch {
      showToast('Erreur lors de la suppression', 'destructive');
    }
  };

  return (
    <motion.div
      key="collections"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-sans text-sm text-[#8C8C8C]">
          {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </p>
        <Button
          onClick={openCreate}
          className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="bg-white rounded-sm border border-[#E8E0D5] p-12 text-center">
          <FolderOpen className="w-12 h-12 text-[#E8E0D5] mx-auto mb-4" />
          <p className="font-sans text-sm text-[#8C8C8C]">Aucune collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-sm border border-[#E8E0D5] overflow-hidden hover:border-[#D4AF37] transition-colors"
            >
              {/* Image */}
              <div className="relative h-36 sm:h-44 bg-[#F5F0E8] overflow-hidden">
                {collection.imageUrl ? (
                  <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="w-10 h-10 text-[#E8E0D5]" />
                  </div>
                )}
                {collection.heroText && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1A1A]/60 to-transparent p-4">
                    <p className="font-serif text-sm text-white/90 italic">{collection.heroText}</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-serif text-base text-[#1A1A1A]">{collection.name}</h3>
                    <p className="font-sans text-[10px] text-[#8C8C8C]">/{collection.slug}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(collection)}
                      className="p-1.5 text-[#8C8C8C] hover:text-[#D4AF37] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(collection.id)}
                      className="p-1.5 text-[#8C8C8C] hover:text-[#C44536] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {collection.description && (
                  <p className="font-sans text-xs text-[#8C8C8C] line-clamp-2 mb-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5]">
                  <span className="font-sans text-[10px] text-[#8C8C8C]">
                    {collection.products?.length || 0} produit{(collection.products?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="font-sans text-[10px] text-[#8C8C8C]">
                    Ordre: {collection.sortOrder}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Collection Edit Sheet */}
      <Sheet open={!!editingCollection || isCreateMode} onOpenChange={(open) => { if (!open) { setEditingCollection(null); setIsCreateMode(false); } }}>
        <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] bg-[#F8F7F5] p-0 overflow-y-auto">
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-[#E8E0D5]">
            <SheetTitle className="font-serif text-xl text-[#1A1A1A]">
              {isCreateMode ? 'Nouvelle Collection' : `Modifier — ${editingCollection?.name}`}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 sm:px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Nom *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                  placeholder="Collection Signature"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Slug *</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                  placeholder="signature"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm min-h-[100px]"
                placeholder="Description de la collection..."
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Texte Hero</label>
              <Input
                value={form.heroText}
                onChange={(e) => setForm({ ...form, heroText: e.target.value })}
                className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                placeholder="L'élégance absolue, redéfinie"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Image URL</label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                  placeholder="/images/collections/..."
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-1.5">Ordre de tri</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 sm:px-6 py-4 border-t border-[#E8E0D5] flex-row gap-3">
            <Button
              onClick={() => { setEditingCollection(null); setIsCreateMode(false); }}
              variant="outline"
              className="flex-1 rounded-none font-sans text-xs tracking-wider uppercase border-[#E8E0D5] h-10"
            >
              Annuler
            </Button>
            {!isCreateMode && editingCollection && (
              <Button
                onClick={() => handleDelete(editingCollection.id)}
                variant="outline"
                className="rounded-none font-sans text-xs tracking-wider uppercase text-[#C44536] border-[#C44536]/30 hover:bg-[#C44536]/10 h-10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isCreateMode ? 'Créer' : 'Sauvegarder'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#F8F7F5] border-[#E8E0D5] rounded-none max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#1A1A1A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C44536]" />
              Supprimer la collection ?
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-[#8C8C8C]">
            Tous les produits de cette collection seront également supprimés. Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="rounded-none font-sans text-xs">
              Annuler
            </Button>
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-[#C44536] hover:bg-[#C44536]/90 text-white rounded-none font-sans text-xs">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Orders Tab ─────────────────────────────────────────────────

function OrdersTab({ orders, searchQuery, setSearchQuery, onRefresh, showToast }: {
  orders: Order[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [payProvider, setPayProvider] = useState('');
  const [payReference, setPayReference] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setPayStatus(order.payment?.status || 'pending');
    setPayProvider(order.payment?.provider || 'pending');
    setPayReference(order.payment?.reference || '');
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const body: Record<string, string> = { id: selectedOrder.id };
      if (orderStatus) body.status = orderStatus;

      const paymentBody: Record<string, string> = {};
      if (payStatus) paymentBody.paymentStatus = payStatus;
      if (payProvider) paymentBody.paymentProvider = payProvider;
      if (payReference) paymentBody.paymentReference = payReference;

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, ...paymentBody }),
      });
      if (!res.ok) throw new Error('Erreur');
      showToast('Commande mise à jour');
      setSelectedOrder(null);
      onRefresh();
    } catch {
      showToast('Erreur lors de la mise à jour', 'destructive');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
      showToast('Commande supprimée');
      setDeleteConfirm(null);
      setSelectedOrder(null);
      onRefresh();
    } catch {
      showToast('Erreur lors de la suppression', 'destructive');
    }
  };

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher par ID, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-sm border border-[#E8E0D5] p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#E8E0D5] mx-auto mb-4" />
          <p className="font-sans text-sm text-[#8C8C8C]">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-sm border border-[#E8E0D5] p-3 sm:p-4 hover:border-[#D4AF37] transition-colors cursor-pointer"
              onClick={() => openOrderDetail(order)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-sm font-medium text-[#1A1A1A]">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-wider uppercase ${statusColors[order.status] || 'bg-[#8C8C8C]/15 text-[#8C8C8C]'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    {order.payment && (
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-wider uppercase ${paymentStatusColors[order.payment.status] || ''}`}>
                        {paymentProviderLabels[order.payment.provider] || order.payment.provider}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#8C8C8C]">
                    {order.guestEmail || order.guestPhone || 'Client inconnu'}
                    {' · '}
                    {order.items.length} article{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-base text-[#1A1A1A]">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className="font-sans text-[10px] text-[#8C8C8C] hidden sm:block">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <Eye className="w-4 h-4 text-[#8C8C8C]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-[540px] bg-[#F8F7F5] p-0 overflow-y-auto">
          <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-[#E8E0D5]">
            <SheetTitle className="font-serif text-xl text-[#1A1A1A]">
              Commande #{selectedOrder?.id.slice(-8).toUpperCase()}
            </SheetTitle>
          </SheetHeader>

          {selectedOrder && (
            <div className="px-4 sm:px-6 py-6 space-y-6">
              {/* Client Info */}
              <div>
                <h4 className="font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-2">Client</h4>
                <div className="bg-white p-3 border border-[#E8E0D5] space-y-1">
                  {selectedOrder.guestEmail && (
                    <p className="font-sans text-sm text-[#1A1A1A]">{selectedOrder.guestEmail}</p>
                  )}
                  {selectedOrder.guestPhone && (
                    <p className="font-sans text-sm text-[#1A1A1A]">{selectedOrder.guestPhone}</p>
                  )}
                  <p className="font-sans text-xs text-[#8C8C8C]">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-2">Articles</h4>
                <div className="bg-white border border-[#E8E0D5] divide-y divide-[#E8E0D5]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-sans text-sm text-[#1A1A1A]">{item.variant.product.name}</p>
                        <p className="font-sans text-xs text-[#8C8C8C]">{item.variant.size} × {item.quantity}</p>
                      </div>
                      <p className="font-sans text-sm text-[#1A1A1A]">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="px-3 py-3 flex items-center justify-between bg-[#F5F0E8]">
                    <span className="font-serif text-sm text-[#1A1A1A]">Total</span>
                    <span className="font-serif text-base text-[#1A1A1A]">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedOrder.note && (
                <div>
                  <h4 className="font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-2">Note</h4>
                  <div className="bg-white p-3 border border-[#E8E0D5]">
                    <p className="font-sans text-sm text-[#1A1A1A]">{selectedOrder.note}</p>
                  </div>
                </div>
              )}

              {/* Edit Status */}
              <div>
                <h4 className="font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] mb-2">Modifier le statut</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Statut Commande</label>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                      <SelectTrigger className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Moyen de Paiement</label>
                      <Select value={payProvider} onValueChange={setPayProvider}>
                        <SelectTrigger className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentProviderLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Statut Paiement</label>
                      <Select value={payStatus} onValueChange={setPayStatus}>
                        <SelectTrigger className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentStatusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[9px] tracking-wider uppercase text-[#8C8C8C] mb-1">Référence Paiement</label>
                    <Input
                      value={payReference}
                      onChange={(e) => setPayReference(e.target.value)}
                      className="bg-white border-[#E8E0D5] rounded-none font-sans text-sm"
                      placeholder="WAV-XXXX ou REF..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="px-4 sm:px-6 py-4 border-t border-[#E8E0D5] flex-row gap-3">
            <Button
              onClick={() => setSelectedOrder(null)}
              variant="outline"
              className="flex-1 rounded-none font-sans text-xs tracking-wider uppercase border-[#E8E0D5] h-10"
            >
              Fermer
            </Button>
            {selectedOrder && (
              <Button
                onClick={() => setDeleteConfirm(selectedOrder.id)}
                variant="outline"
                className="rounded-none font-sans text-xs tracking-wider uppercase text-[#C44536] border-[#C44536]/30 hover:bg-[#C44536]/10 h-10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
            )}
            <Button
              onClick={handleUpdateOrder}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Sauvegarder
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-[#F8F7F5] border-[#E8E0D5] rounded-none max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-[#1A1A1A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C44536]" />
              Supprimer cette commande ?
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-[#8C8C8C]">
            Cette action est irréversible. La commande et son paiement seront définitivement supprimés.
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="rounded-none font-sans text-xs">
              Annuler
            </Button>
            <Button onClick={() => deleteConfirm && handleDeleteOrder(deleteConfirm)} className="bg-[#C44536] hover:bg-[#C44536]/90 text-white rounded-none font-sans text-xs">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#F5F0E8]" />
              <div className="h-3 w-20 bg-[#F5F0E8]" />
            </div>
            <div className="h-6 w-28 bg-[#F5F0E8]" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-sm border border-[#E8E0D5] h-80">
        <div className="h-4 w-48 bg-[#F5F0E8] mb-6" />
        <div className="h-full bg-[#F5F0E8]" />
      </div>
    </div>
  );
}
