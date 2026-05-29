'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ChevronLeft,
} from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  totalRevenue: number;
  orderCount: number;
  aov: number;
  productCount: number;
  recentOrderList: {
    id: string;
    guestEmail: string | null;
    guestPhone: string | null;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
      variant: {
        product: { name: string };
        size: string;
      };
      quantity: number;
      unitPrice: number;
    }[];
  }[];
  dailyRevenue: Record<string, number>;
}

export default function DashboardView() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const { navigate } = useNavigationStore();

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, []);

  const chartData = analytics
    ? Object.entries(analytics.dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          revenue,
        }))
    : [];

  const statusColors: Record<string, string> = {
    pending: 'text-[#D4A037]',
    confirmed: 'text-[#D4AF37]',
    processing: 'text-[#D4AF37]',
    shipped: 'text-[#4A7C59]',
    delivered: 'text-[#4A7C59]',
    cancelled: 'text-[#C44536]',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ChevronLeft className="w-3 h-3" />
          Retour à l&apos;accueil
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] mb-8">
          Tableau de Bord
        </h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: 'CA Total',
              value: analytics ? formatPrice(analytics.totalRevenue) : '—',
              icon: DollarSign,
            },
            {
              label: 'Panier Moyen',
              value: analytics ? formatPrice(Math.round(analytics.aov)) : '—',
              icon: TrendingUp,
            },
            {
              label: 'Commandes',
              value: analytics?.orderCount.toString() || '—',
              icon: ShoppingCart,
            },
            {
              label: 'Produits',
              value: analytics?.productCount.toString() || '—',
              icon: Package,
            },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 sm:p-6 rounded-sm border border-[#E8E0D5]"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#F5F0E8] flex items-center justify-center rounded-none">
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
        <div className="bg-white p-3 sm:p-6 rounded-sm border border-[#E8E0D5] mb-6 sm:mb-8">
          <h2 className="font-serif text-sm sm:text-lg text-[#1A1A1A] mb-4 sm:mb-6">
            Chiffre d&apos;Affaires (30 jours)
          </h2>
          <div className="h-48 sm:h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#8C8C8C' }}
                    axisLine={{ stroke: '#E8E0D5' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8C8C8C' }}
                    axisLine={{ stroke: '#E8E0D5' }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), 'CA']}
                    contentStyle={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12,
                      border: '1px solid #E8E0D5',
                      borderRadius: 0,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{ fill: '#D4AF37', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="font-sans text-sm text-[#8C8C8C]">
                  Aucune donnée de revenu disponible
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-4 sm:p-6 rounded-sm border border-[#E8E0D5]">
          <h2 className="font-serif text-lg text-[#1A1A1A] mb-6">
            Commandes Récentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E0D5]">
                  <th className="text-left font-sans text-xs tracking-wider uppercase text-[#8C8C8C] pb-3 pr-4">
                    Commande
                  </th>
                  <th className="text-left font-sans text-xs tracking-wider uppercase text-[#8C8C8C] pb-3 pr-4">
                    Client
                  </th>
                  <th className="text-left font-sans text-xs tracking-wider uppercase text-[#8C8C8C] pb-3 pr-4">
                    Montant
                  </th>
                  <th className="text-left font-sans text-xs tracking-wider uppercase text-[#8C8C8C] pb-3 pr-4">
                    Statut
                  </th>
                  <th className="text-left font-sans text-xs tracking-wider uppercase text-[#8C8C8C] pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentOrderList.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E0D5]/50 last:border-0"
                  >
                    <td className="py-3 pr-4 font-sans text-sm text-[#1A1A1A]">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 font-sans text-sm text-[#8C8C8C]">
                      {order.guestEmail || order.guestPhone || '—'}
                    </td>
                    <td className="py-3 pr-4 font-sans text-sm text-[#1A1A1A]">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-sans text-xs tracking-wider uppercase ${
                          statusColors[order.status] || 'text-[#8C8C8C]'
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-sm text-[#8C8C8C]">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
                {(!analytics || analytics.recentOrderList.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center font-sans text-sm text-[#8C8C8C]"
                    >
                      Aucune commande pour le moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
