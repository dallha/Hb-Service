import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      ordersByStatus,
      ordersByDate,
    ] = await Promise.all([
      // Total orders count
      db.order.count(),

      // Total revenue (sum of all completed orders)
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          payment: {
            status: 'completed',
          },
        },
      }),

      // Total products count
      db.product.count(),

      // Recent orders (last 5)
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
          payment: true,
        },
      }),

      // Orders grouped by status
      db.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Orders grouped by date (last 7 days)
      db.order.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { createdAt: 'desc' },
        take: 7,
      }),
    ]);

    // Build dailyRevenue from ordersByDate
    const dailyRevenue: Record<string, number> = {};
    for (const d of ordersByDate) {
      const dateKey = d.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (d._sum.totalAmount || 0);
    }

    // Calculate AOV (Average Order Value)
    const aov = totalOrders > 0 ? Math.round((totalRevenue._sum.totalAmount || 0) / totalOrders) : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      orderCount: totalOrders,
      aov,
      productCount: totalProducts,
      recentOrderList: recentOrders,
      dailyRevenue,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
