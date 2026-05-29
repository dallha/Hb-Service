'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Package, TrendingUp, ChevronLeft,
  Plus, Pencil, Trash2, X, Save, Search, Eye, ChevronDown,
  LayoutGrid, FolderOpen, ClipboardList, BarChart3, Upload,
  AlertTriangle, Users, Shield, ShieldCheck, Star, CheckCircle,
  Ticket, Menu, LogOut, Download, Copy, Printer, FileText,
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

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface AdminReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  product: { name: string };
}

interface AdminPromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

type AdminTab = 'analytics' | 'products' | 'collections' | 'orders' | 'invoices' | 'users' | 'reviews' | 'promos';

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

async function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(url, options);
}

// ─── Main Component ─────────────────────────────────────────────

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
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

  const fetchUsers = useCallback(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const fetchReviews = useCallback(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then(setReviews)
      .catch(console.error);
  }, []);

  const fetchPromos = useCallback(() => {
    fetch('/api/promo-codes')
      .then((r) => r.json())
      .then(setPromos)
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
        fetchUsers(),
        fetchReviews(),
        fetchPromos(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [fetchAnalytics, fetchProducts, fetchCollections, fetchOrders, fetchUsers, fetchReviews, fetchPromos]);

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

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter((r) =>
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPromos = promos.filter((p) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Tabs Config ────────────────────────────────────────────

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: 'Statistiques', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'orders', label: 'Commandes', icon: ClipboardList },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'users', label: 'Équipe', icon: Users },
    { id: 'reviews', label: 'Avis', icon: Star },
    { id: 'promos', label: 'Codes Promo', icon: Ticket },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F7F5] font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E8E0D5] fixed inset-y-0 z-30">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#E8E0D5]">
          <img src="/logo-gold.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-serif text-lg text-[#1A1A1A]">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#8C8C8C] hover:bg-[#F8F7F5] hover:text-[#1A1A1A]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#E8E0D5]">
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors rounded-md hover:bg-[#F8F7F5]"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au site
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E8E0D5] z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8E0D5]">
                <div className="flex items-center gap-2">
                  <img src="/logo-gold.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-serif text-lg text-[#1A1A1A]">Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#8C8C8C] hover:bg-[#F8F7F5] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E8E0D5] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2 text-[#1A1A1A]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl text-[#1A1A1A] hidden sm:block">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#8C8C8C] hidden sm:block">Connecté en tant qu'Administrateur</span>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm" className="text-[#8C8C8C] hover:text-[#C44536] gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
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
            {activeTab === 'invoices' && (
              <InvoicesTab
                orders={filteredOrders}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
            {activeTab === 'users' && (
              <UsersTab
                users={filteredUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchUsers}
                showToast={showToast}
              />
            )}
            {activeTab === 'reviews' && (
              <ReviewsTab
                reviews={filteredReviews}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchReviews}
                showToast={showToast}
              />
            )}
            {activeTab === 'promos' && (
              <PromoCodesTab
                promos={filteredPromos}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchPromos}
                showToast={showToast}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
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
          { label: 'CA Total', value: analytics ? formatPrice(analytics.totalRevenue) : '—', icon: DollarSign, trend: '+12%' },
          { label: 'Panier Moyen', value: analytics ? formatPrice(Math.round(analytics.aov)) : '—', icon: TrendingUp, trend: '+5%' },
          { label: 'Commandes', value: analytics?.orderCount.toString() || '—', icon: ShoppingCart, trend: '+8%' },
          { label: 'Produits Actifs', value: analytics?.productCount.toString() || '—', icon: Package },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#E8E0D5]/50 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <card.icon className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center shadow-inner">
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              </div>
              <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-[#8C8C8C]">
                {card.label}
              </span>
            </div>
            <div className="flex items-baseline gap-3 relative z-10">
              <p className="font-serif text-xl sm:text-3xl text-[#1A1A1A] font-medium">
                {card.value}
              </p>
              {card.trend && (
                <span className="font-sans text-xs font-medium text-[#4A7C59] bg-[#4A7C59]/10 px-2 py-0.5 rounded-full">
                  {card.trend}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#E8E0D5]/50">
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

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkActiveToggle = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map(id => 
        apiFetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isActive }),
        })
      ));
      showToast(`${selectedIds.length} produits mis à jour`);
      setSelectedIds([]);
      onRefresh();
    } catch {
      showToast('Erreur lors de la mise à jour massive', 'destructive');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const body: Record<string, unknown> = {
        name: `${product.name} (Copie)`,
        slug: `${product.slug}-copie-${Date.now()}`,
        description: product.description,
        inspiration: product.inspiration,
        imageUrl: product.imageUrl,
        galleryUrls: product.galleryUrls,
        relatedRitualIds: product.relatedRitualIds,
        isActive: false, // create as inactive by default
        collectionId: product.collectionId,
        notesOlfactives: product.notesOlfactives,
        variants: product.variants.map((v) => ({
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku ? `${v.sku}-COPY` : null,
        })),
      };

      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erreur lors de la duplication');
      showToast('Produit dupliqué avec succès');
      onRefresh();
    } catch {
      showToast('Erreur lors de la duplication', 'destructive');
    }
  };

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
        const res = await apiFetch('/api/products', {
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
        const res = await apiFetch('/api/products', {
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
      const res = await apiFetch(`/api/products?id=${id}`, { method: 'DELETE' });
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Select onValueChange={(val) => handleBulkActiveToggle(val === 'active')}>
              <SelectTrigger disabled={bulkProcessing} className="bg-white border-[#E8E0D5] rounded-none font-sans text-xs h-10 min-w-[150px]">
                {bulkProcessing ? 'Traitement...' : `Action pour ${selectedIds.length}`}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activer</SelectItem>
                <SelectItem value="inactive">Désactiver</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={openCreate}
            className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10 px-5 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Select All Bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <input 
            type="checkbox" 
            checked={selectedIds.length === products.length && products.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded-sm border-[#E8E0D5] text-[#1A1A1A] focus:ring-black"
          />
          <span className="text-xs text-[#8C8C8C] font-sans uppercase tracking-wider">Tout sélectionner</span>
        </div>
      )}

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
              className={`bg-white rounded-md border overflow-hidden group transition-colors relative ${selectedIds.includes(product.id) ? 'border-[#1A1A1A]' : 'border-[#E8E0D5] hover:border-[#D4AF37]'}`}
            >
              {/* Checkbox overlay */}
              <div className="absolute top-2 left-2 z-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="w-4 h-4 rounded-sm border-[#E8E0D5] text-[#1A1A1A] focus:ring-black bg-white/80 backdrop-blur-sm"
                />
              </div>

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
                <div className="absolute top-2 right-2">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-wider uppercase bg-white/80 backdrop-blur-sm ${
                    product.isActive ? 'text-[#4A7C59]' : 'text-[#C44536]'
                  }`}>
                    {product.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <Button
                    onClick={() => handleDuplicate(product)}
                    className="bg-white text-[#1A1A1A] rounded-none font-sans text-xs tracking-wider uppercase hover:bg-[#E8E0D5] h-9 px-3"
                    title="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
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
      const res = await apiFetch('/api/collections', {
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
      const res = await apiFetch(`/api/collections?id=${id}`, { method: 'DELETE' });
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

// ─── Invoices Tab ────────────────────────────────────────────────

function InvoicesTab({ orders, searchQuery, setSearchQuery }: {
  orders: Order[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const handlePrint = (orderId: string) => {
    const locale = window.location.pathname.split('/')[1] || 'fr';
    window.open(`/${locale}/admin/orders/${orderId}/invoice`, '_blank');
  };

  return (
    <motion.div
      key="invoices"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher par ID de commande, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-sm border border-[#E8E0D5] p-12 text-center">
          <FileText className="w-12 h-12 text-[#E8E0D5] mx-auto mb-4" />
          <p className="font-sans text-sm text-[#8C8C8C]">Aucune facture trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-[#E8E0D5] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-[#E8E0D5]">
                <th className="py-3 px-4 font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C]">N° Facture</th>
                <th className="py-3 px-4 font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C]">Date</th>
                <th className="py-3 px-4 font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C]">Client</th>
                <th className="py-3 px-4 font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] text-right">Montant</th>
                <th className="py-3 px-4 font-sans text-[10px] tracking-wider uppercase text-[#8C8C8C] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D5]">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-[#F8F7F5]/50 transition-colors">
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A] font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-4 font-sans text-sm text-[#8C8C8C]">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A]">{order.guestEmail || order.guestPhone || 'Inconnu'}</td>
                  <td className="py-3 px-4 font-sans text-sm text-[#1A1A1A] font-medium text-right">{formatPrice(order.totalAmount)}</td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      onClick={() => handlePrint(order.id)}
                      variant="outline"
                      size="sm"
                      className="border-[#E8E0D5] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 mr-2" />
                      Imprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Email', 'Téléphone', 'Total', 'Statut', 'Date'];
    const rows = orders.map(o => [
      o.id, 
      o.guestEmail || '', 
      o.guestPhone || '', 
      o.totalAmount.toString(), 
      statusLabels[o.status] || o.status, 
      new Date(o.createdAt).toLocaleDateString('fr-FR')
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes_hb_service_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await Promise.all(selectedIds.map(id => 
        apiFetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: newStatus }),
        })
      ));
      showToast(`${selectedIds.length} commandes mises à jour`);
      setSelectedIds([]);
      onRefresh();
    } catch {
      showToast('Erreur lors de la mise à jour massive', 'destructive');
    } finally {
      setBulkProcessing(false);
    }
  };

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

      const res = await apiFetch('/api/orders', {
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
      const res = await apiFetch(`/api/orders?id=${id}`, { method: 'DELETE' });
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher par ID, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Select onValueChange={handleBulkStatusChange}>
              <SelectTrigger disabled={bulkProcessing} className="bg-white border-[#E8E0D5] rounded-none font-sans text-xs h-10 min-w-[150px]">
                {bulkProcessing ? 'Traitement...' : `Action pour ${selectedIds.length}`}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Marquer En attente</SelectItem>
                <SelectItem value="processing">Marquer En préparation</SelectItem>
                <SelectItem value="shipped">Marquer Expédiée</SelectItem>
                <SelectItem value="delivered">Marquer Livrée</SelectItem>
                <SelectItem value="cancelled">Marquer Annulée</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleExportCSV} variant="outline" className="bg-white border-[#E8E0D5] rounded-none text-xs h-10 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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
          <div className="flex items-center gap-3 px-4 py-2">
            <input 
              type="checkbox" 
              checked={selectedIds.length === orders.length && orders.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded-sm border-[#E8E0D5] text-[#1A1A1A] focus:ring-black"
            />
            <span className="text-xs text-[#8C8C8C] font-sans uppercase tracking-wider">Tout sélectionner</span>
          </div>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-md border p-3 sm:p-4 transition-colors ${selectedIds.includes(order.id) ? 'border-[#1A1A1A]' : 'border-[#E8E0D5] hover:border-[#D4AF37]'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    className="w-4 h-4 rounded-sm border-[#E8E0D5] text-[#1A1A1A] focus:ring-black"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openOrderDetail(order)}>
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
                </div>
                <div className="flex items-center gap-4 cursor-pointer pl-8 sm:pl-0" onClick={() => openOrderDetail(order)}>
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

          <SheetFooter className="px-4 sm:px-6 py-4 border-t border-[#E8E0D5] flex flex-col sm:flex-row gap-3">
            <div className="flex gap-3 w-full sm:w-auto sm:flex-1">
              <Button
                onClick={() => {
                  const locale = window.location.pathname.split('/')[1] || 'fr';
                  window.open(`/${locale}/admin/orders/${selectedOrder!.id}/invoice`, '_blank');
                }}
                variant="outline"
                className="flex-1 rounded-none font-sans text-xs tracking-wider uppercase border-[#E8E0D5] h-10"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Facture
              </Button>
              {selectedOrder && (
                <Button
                  onClick={() => setDeleteConfirm(selectedOrder.id)}
                  variant="outline"
                  className="flex-1 rounded-none font-sans text-xs tracking-wider uppercase text-[#C44536] border-[#C44536]/30 hover:bg-[#C44536]/10 h-10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setSelectedOrder(null)}
                variant="outline"
                className="flex-1 sm:flex-none rounded-none font-sans text-xs tracking-wider uppercase border-[#E8E0D5] h-10 px-6"
              >
                Fermer
              </Button>
              <Button
                onClick={handleUpdateOrder}
                className="flex-1 sm:flex-none bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-[#F8F7F5] rounded-none font-sans text-xs tracking-wider uppercase h-10 px-6"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Sauvegarder
              </Button>
            </div>
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

// ─── Reviews Tab ────────────────────────────────────────────────

function ReviewsTab({ reviews, searchQuery, setSearchQuery, onRefresh, showToast }: {
  reviews: AdminReview[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleToggleVerify = async (reviewId: string, currentStatus: boolean) => {
    setProcessing(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      if (!res.ok) throw new Error('Erreur lors de la modification');
      showToast(currentStatus ? 'Avis masqué' : 'Avis publié avec succès');
      onRefresh();
    } catch (error) {
      showToast('Erreur lors de la modification', 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    setProcessing(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      showToast('Avis supprimé');
      onRefresh();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher par nom, produit ou commentaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#E8E0D5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#F8F7F5] border-b border-[#E8E0D5]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Date</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Produit & Client</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Note</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Commentaire</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Statut</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8C8C8C]">
                    Aucun avis trouvé
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#F8F7F5]/50 transition-colors">
                    <td className="px-4 py-3 text-[#8C8C8C]">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1A1A1A] truncate max-w-[200px]" title={review.product.name}>
                        {review.product.name}
                      </div>
                      <div className="text-xs text-[#8C8C8C]">{review.userName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex text-[#D4AF37]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-[#E8E0D5]'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#1A1A1A] max-w-[300px] truncate" title={review.comment || ''}>
                        {review.comment || <span className="text-[#8C8C8C] italic">Aucun commentaire</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs tracking-wider uppercase ${
                        review.isVerified ? 'bg-[#4A7C59]/15 text-[#4A7C59]' : 'bg-[#C44536]/15 text-[#C44536]'
                      }`}>
                        {review.isVerified ? 'Publié' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processing === review.id}
                        onClick={() => handleToggleVerify(review.id, review.isVerified)}
                        className={`h-8 px-2 ${review.isVerified ? 'text-[#8C8C8C] hover:text-[#1A1A1A]' : 'text-[#4A7C59] hover:text-[#2d4d36]'}`}
                        title={review.isVerified ? 'Masquer' : 'Publier'}
                      >
                        {review.isVerified ? <Eye className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processing === review.id}
                        onClick={() => handleDelete(review.id)}
                        className="h-8 px-2 text-[#C44536] hover:bg-[#C44536]/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Promo Codes Tab ─────────────────────────────────────────────

function PromoCodesTab({ promos, searchQuery, setSearchQuery, onRefresh, showToast }: {
  promos: AdminPromoCode[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    usageLimit: '',
    expiresAt: '',
  });

  const handleToggleActive = async (promoId: string, currentStatus: boolean) => {
    setProcessing(promoId);
    try {
      const res = await fetch(`/api/promo-codes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promoId, isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(currentStatus ? 'Code désactivé' : 'Code activé');
      onRefresh();
    } catch {
      showToast('Erreur lors de la modification', 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce code promo ?')) return;
    setProcessing(promoId);
    try {
      const res = await fetch(`/api/promo-codes?id=${promoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Code supprimé');
      onRefresh();
    } catch {
      showToast('Erreur lors de la suppression', 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountValue) return;

    setProcessing('new');
    try {
      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromo.code,
          discountType: newPromo.discountType,
          discountValue: Number(newPromo.discountValue),
          usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : null,
          expiresAt: newPromo.expiresAt || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur création');
      }
      showToast('Code promo créé avec succès');
      setIsAdding(false);
      setNewPromo({ code: '', discountType: 'percentage', discountValue: '', usageLimit: '', expiresAt: '' });
      onRefresh();
    } catch (error: any) {
      showToast(error.message, 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div
      key="promos"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher un code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-[#1A1A1A] hover:bg-[#333] text-white font-sans text-xs tracking-widest uppercase rounded-none h-10 px-6 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Code
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-sm border border-[#E8E0D5] mb-6">
          <h3 className="font-serif text-lg mb-4">Créer un code promo</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Code</label>
                <Input
                  required
                  value={newPromo.code}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: WELCOME10"
                  className="rounded-none border-[#E8E0D5]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Type</label>
                  <select
                    value={newPromo.discountType}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, discountType: e.target.value as any }))}
                    className="w-full h-10 border border-[#E8E0D5] px-3 text-sm focus:outline-none"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">FCFA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Valeur</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, discountValue: e.target.value }))}
                    className="rounded-none border-[#E8E0D5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Limite d'utilisation (Optionnel)</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Illimité"
                  value={newPromo.usageLimit}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, usageLimit: e.target.value }))}
                  className="rounded-none border-[#E8E0D5]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Date d'expiration (Optionnel)</label>
                <Input
                  type="datetime-local"
                  value={newPromo.expiresAt}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="rounded-none border-[#E8E0D5]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-none text-xs uppercase tracking-widest">
                Annuler
              </Button>
              <Button type="submit" disabled={processing === 'new'} className="bg-[#4A7C59] hover:bg-[#3d6649] text-white rounded-none text-xs uppercase tracking-widest">
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-sm border border-[#E8E0D5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#F8F7F5] border-b border-[#E8E0D5]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Code</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Réduction</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Utilisations</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Expiration</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Statut</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8C8C8C]">Aucun code promo trouvé</td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#F8F7F5]/50 transition-colors">
                    <td className="px-4 py-3 font-medium tracking-wider">{promo.code}</td>
                    <td className="px-4 py-3">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue} FCFA`}
                    </td>
                    <td className="px-4 py-3">
                      {promo.usageCount} / {promo.usageLimit || '∞'}
                    </td>
                    <td className="px-4 py-3">
                      {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs tracking-wider uppercase ${
                        promo.isActive ? 'bg-[#4A7C59]/15 text-[#4A7C59]' : 'bg-[#C44536]/15 text-[#C44536]'
                      }`}>
                        {promo.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processing === promo.id}
                        onClick={() => handleToggleActive(promo.id, promo.isActive)}
                        className={`h-8 px-2 ${promo.isActive ? 'text-[#8C8C8C] hover:text-[#1A1A1A]' : 'text-[#4A7C59] hover:text-[#2d4d36]'}`}
                        title={promo.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {promo.isActive ? <Eye className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processing === promo.id}
                        onClick={() => handleDelete(promo.id)}
                        className="h-8 px-2 text-[#C44536] hover:bg-[#C44536]/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────

function UsersTab({ users, searchQuery, setSearchQuery, onRefresh, showToast }: {
  users: AdminUser[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  showToast: (msg: string, variant?: 'default' | 'destructive') => void;
}) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/users/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: currentRole === 'ADMIN' ? 'USER' : 'ADMIN' }),
      });
      if (!res.ok) throw new Error();
      showToast('Rôle mis à jour');
      onRefresh();
    } catch {
      showToast('Erreur lors de la mise à jour', 'destructive');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#E8E0D5] rounded-none font-sans text-sm h-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-sm border border-[#E8E0D5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#F8F7F5] border-b border-[#E8E0D5]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Nom Complet</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Email</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Téléphone</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Inscription</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C]">Rôle</th>
                <th className="px-4 py-3 font-medium text-[#8C8C8C] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8C8C8C]">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#F8F7F5]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{user.fullName || '-'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone || '-'}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs tracking-wider uppercase ${
                        user.role === 'ADMIN' ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#E8E0D5] text-[#8C8C8C]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processing === user.id}
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className={`h-8 px-2 text-xs uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-[#C44536] hover:bg-[#C44536]/10' : 'text-[#4A7C59] hover:bg-[#4A7C59]/10'}`}
                        title={user.role === 'ADMIN' ? 'Retirer les droits Admin' : 'Donner les droits Admin'}
                      >
                        {user.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}


