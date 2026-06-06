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
      allOrderItems,
      totalUsers,
      cartSessions,
      lowStockVariants,
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
      db.orderItem.findMany({
        where: {
          order: {
            createdAt: dateFilter,
            status: { not: 'cancelled' }
          }
        },
        include: {
          variant: {
            include: {
              product: {
                include: { collection: { select: { name: true } } }
              }
            }
          }
        }
      }),
      db.user.count(),
      db.cartSession.groupBy({ by: ['status'], _count: { id: true } }),
      db.productVariant.findMany({ where: { stock: { lt: 5 } }, include: { product: { select: { name: true } } }, orderBy: { stock: 'asc' }, take: 10 }),
    ]);

    // Build dailyRevenue from allOrdersInPeriod
    const dailyRevenue: Record<string, number> = {};
    for (const d of allOrdersInPeriod) {
      const dateKey = d.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (d.totalAmount || 0);
    }

    // Top Products and Collections Calculation
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const collectionStats: Record<string, { name: string; revenue: number }> = {};
    
    for (const item of allOrderItems) {
      const pName = item.variant?.product?.name || 'Produit inconnu';
      const cName = item.variant?.product?.collection?.name || 'Sans collection';
      const itemRev = item.quantity * item.unitPrice;
      
      if (!productStats[pName]) productStats[pName] = { name: pName, quantity: 0, revenue: 0 };
      productStats[pName].quantity += item.quantity;
      productStats[pName].revenue += itemRev;
      
      if (!collectionStats[cName]) collectionStats[cName] = { name: cName, revenue: 0 };
      collectionStats[cName].revenue += itemRev;
    }
    const topProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const salesByCollection = Object.values(collectionStats);

    // Calculate AOV (Average Order Value)
    const aov = totalOrders > 0 ? Math.round((totalRevenue._sum.totalAmount || 0) / totalOrders) : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      orderCount: totalOrders,
      aov,
      productCount: totalProducts,
      recentOrderList: recentOrders,
      dailyRevenue,
      ordersByStatus,
      topProducts,
      salesByCollection,
      totalUsers,
      cartSessions,
      lowStockVariants,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
