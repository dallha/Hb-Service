import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total revenue
    const orders = await db.order.findMany({
      where: { status: { not: 'cancelled' } },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Order count
    const orderCount = orders.length;

    // Average order value (AOV)
    const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await db.order.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Product count
    const productCount = await db.product.count({ where: { isActive: true } });

    // Collection count
    const collectionCount = await db.collection.count();

    // Recent orders for dashboard
    const recentOrderList = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
        payment: true,
      },
    });

    // Daily revenue for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const allRecentOrders = await db.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' },
      },
      select: { createdAt: true, totalAmount: true },
    });

    // Group by day
    const dailyRevenue: Record<string, number> = {};
    allRecentOrders.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + o.totalAmount;
    });

    return NextResponse.json({
      totalRevenue,
      orderCount,
      aov,
      recentOrders,
      productCount,
      collectionCount,
      recentOrderList,
      dailyRevenue,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
