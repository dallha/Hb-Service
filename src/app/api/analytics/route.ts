import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate = new Date(0); // 'all'

    const dateFilter = startDate.getTime() !== 0 ? { gte: startDate } : undefined;

    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      ordersByStatus,
      allOrdersInPeriod,
    ] = await Promise.all([
      db.order.count({ where: { createdAt: dateFilter } }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: dateFilter,
          payment: { status: 'completed' },
        },
      }),
      db.product.count(),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { variant: { include: { product: true } } } }, payment: true },
      }),
      db.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { createdAt: dateFilter }
      }),
      db.order.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Build dailyRevenue from allOrdersInPeriod
    const dailyRevenue: Record<string, number> = {};
    for (const d of allOrdersInPeriod) {
      const dateKey = d.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (d.totalAmount || 0);
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
