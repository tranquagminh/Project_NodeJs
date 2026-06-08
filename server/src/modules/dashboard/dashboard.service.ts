import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  pendingReturns: number;
  pendingReviews: number;
  lowStockVariants: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface TopCustomer {
  userId: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface StringQueueItem {
  orderId: string;
  orderCode: string;
  customerName: string;
  createdAt: Date;
  items: Array<{
    orderItemId: string;
    productName: string;
    variantName: string;
    stringName: string | null;
    tension: number | null;
    gripChoice: string | null;
    quantity: number;
  }>;
}

export interface LowStockAlert {
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  sku: string;
  stock: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REVENUE_STATUSES: Prisma.OrderWhereInput['status'] = { in: ['COMPLETED', 'DELIVERED'] };

function getPeriodStart(period?: string): Date | null {
  if (!period) return null;
  const now = new Date();
  // Work in Asia/Ho_Chi_Minh timezone
  switch (period) {
    case 'today': {
      const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'week': {
      const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const day = d.getDay(); // 0=Sun
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'month': {
      const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'year': {
      const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    default:
      return null;
  }
}

// ── getSummary ────────────────────────────────────────────────────────────────

export async function getSummary(): Promise<DashboardSummary> {
  const [
    revenueResult,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    pendingReturns,
    pendingReviews,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: REVENUE_STATUSES },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER', deletedAt: null } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.returnRequest.count({ where: { status: 'REQUESTED' } }),
    prisma.review.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 }, isActive: true } }),
  ]);

  return {
    totalRevenue: Number(revenueResult._sum.total ?? 0),
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    pendingReturns,
    pendingReviews,
    lowStockVariants,
  };
}

// ── getRevenueSeries ──────────────────────────────────────────────────────────

export async function getRevenueSeries(
  days: number,
): Promise<{ date: string; revenue: number; orderCount: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // Use raw SQL for date truncation in VN timezone
  const rows = await prisma.$queryRaw<Array<{ date: string; revenue: string; order_count: string }>>`
    SELECT
      to_char(
        (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
        'YYYY-MM-DD'
      ) as date,
      COALESCE(SUM(total), 0)::text as revenue,
      COUNT(*)::text as order_count
    FROM orders
    WHERE status IN ('COMPLETED', 'DELIVERED')
      AND created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `;

  // Fill in missing dates with zeros
  const resultMap = new Map<string, { revenue: number; orderCount: number }>();
  for (const row of rows) {
    resultMap.set(row.date, {
      revenue: parseFloat(row.revenue),
      orderCount: parseInt(row.order_count, 10),
    });
  }

  const result: { date: string; revenue: number; orderCount: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = resultMap.get(dateStr) ?? { revenue: 0, orderCount: 0 };
    result.push({ date: dateStr, ...entry });
  }

  return result;
}

// ── getOrdersByStatus ─────────────────────────────────────────────────────────

export async function getOrdersByStatus(period?: string): Promise<Record<string, number>> {
  const periodStart = getPeriodStart(period);
  const where: Prisma.OrderWhereInput = periodStart
    ? { createdAt: { gte: periodStart } }
    : {};

  const grouped = await prisma.order.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
  });

  const result: Record<string, number> = {};
  for (const row of grouped) {
    result[row.status] = row._count.status;
  }
  return result;
}

// ── getTopProducts ────────────────────────────────────────────────────────────

export async function getTopProducts(period: string, limit: number): Promise<TopProduct[]> {
  const periodStart = getPeriodStart(period);
  const whereClause = periodStart
    ? Prisma.sql`AND o.created_at >= ${periodStart}`
    : Prisma.sql``;

  const rows = await prisma.$queryRaw<Array<{
    product_id: string;
    product_name: string;
    total_sold: string;
    total_revenue: string;
  }>>`
    SELECT
      oi.product_id,
      MAX(oi.product_name) as product_name,
      SUM(oi.quantity)::text as total_sold,
      SUM(oi.line_subtotal)::text as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('COMPLETED', 'DELIVERED')
    ${whereClause}
    GROUP BY oi.product_id
    ORDER BY SUM(oi.quantity) DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    productId: r.product_id,
    productName: r.product_name,
    totalSold: parseInt(r.total_sold, 10),
    totalRevenue: parseFloat(r.total_revenue),
  }));
}

// ── getTopCustomers ───────────────────────────────────────────────────────────

export async function getTopCustomers(limit: number): Promise<TopCustomer[]> {
  const rows = await prisma.$queryRaw<Array<{
    user_id: string;
    full_name: string;
    email: string;
    total_orders: string;
    total_spent: string;
  }>>`
    SELECT
      o.user_id,
      u.full_name,
      u.email,
      COUNT(o.id)::text as total_orders,
      SUM(o.total)::text as total_spent
    FROM orders o
    JOIN users u ON u.id = o.user_id
    WHERE o.user_id IS NOT NULL
      AND o.status IN ('COMPLETED', 'DELIVERED')
    GROUP BY o.user_id, u.full_name, u.email
    ORDER BY SUM(o.total) DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    userId: r.user_id,
    fullName: r.full_name,
    email: r.email,
    totalOrders: parseInt(r.total_orders, 10),
    totalSpent: parseFloat(r.total_spent),
  }));
}

// ── getStringQueue ────────────────────────────────────────────────────────────

export async function getStringQueue(): Promise<StringQueueItem[]> {
  const orders = await prisma.order.findMany({
    where: {
      status: 'PROCESSING',
      items: { some: { stringVariantId: { not: null } } },
    },
    include: {
      items: {
        where: { stringVariantId: { not: null } },
        select: {
          id: true,
          productName: true,
          variantName: true,
          stringName: true,
          tension: true,
          gripChoice: true,
          quantity: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map((o) => ({
    orderId: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    createdAt: o.createdAt,
    items: o.items.map((item) => ({
      orderItemId: item.id,
      productName: item.productName,
      variantName: item.variantName,
      stringName: item.stringName,
      tension: item.tension !== null ? Number(item.tension) : null,
      gripChoice: item.gripChoice,
      quantity: item.quantity,
    })),
  }));
}

// ── getLowStockAlerts ─────────────────────────────────────────────────────────

export async function getLowStockAlerts(threshold: number): Promise<LowStockAlert[]> {
  const variants = await prisma.productVariant.findMany({
    where: {
      stock: { lte: threshold },
      isActive: true,
    },
    include: {
      product: { select: { id: true, name: true } },
    },
    orderBy: { stock: 'asc' },
  });

  return variants.map((v) => ({
    variantId: v.id,
    variantName: v.name,
    productId: v.product.id,
    productName: v.product.name,
    sku: v.sku,
    stock: v.stock,
  }));
}

// ── getAOV ────────────────────────────────────────────────────────────────────

export async function getAOV(
  period?: string,
): Promise<{ aov: number; orderCount: number; totalRevenue: number }> {
  const periodStart = getPeriodStart(period);
  const where: Prisma.OrderWhereInput = {
    status: REVENUE_STATUSES,
    ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
  };

  const result = await prisma.order.aggregate({
    where,
    _sum: { total: true },
    _count: true,
  });

  const totalRevenue = Number(result._sum.total ?? 0);
  const orderCount = result._count;
  const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

  return { aov, orderCount, totalRevenue };
}
