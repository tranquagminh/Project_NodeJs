'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Star, Package, TrendingUp } from 'lucide-react';
import { getAdminOrders, getAdminReviews, getAdminProducts } from '@/services/admin';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
};

export default function AdminDashboard() {
  const { data: allOrders } = useQuery({ queryKey: ['admin', 'orders', 'all'], queryFn: () => getAdminOrders(1) });
  const { data: pendingOrders } = useQuery({ queryKey: ['admin', 'orders', 'PENDING'], queryFn: () => getAdminOrders(1, 'PENDING') });
  const { data: reviewsData } = useQuery({ queryKey: ['admin', 'reviews', 1], queryFn: () => getAdminReviews(1) });
  const { data: productsData } = useQuery({ queryKey: ['admin', 'products', 1], queryFn: () => getAdminProducts(1) });

  const totalOrders = allOrders?.meta?.total ?? 0;
  const pendingCount = pendingOrders?.meta?.total ?? 0;
  const totalProducts = productsData?.meta?.total ?? 0;
  const pendingReviews = reviewsData?.data?.filter((r) => !r.isApproved).length ?? 0;
  const totalReviews = reviewsData?.meta?.total ?? 0;
  const recentRevenue = (allOrders?.data ?? [])
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);

  const kpis = [
    {
      label: 'Recent Revenue',
      value: `$${recentRevenue.toFixed(2)}`,
      sub: 'last 20 orders',
      icon: TrendingUp,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      href: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      sub: `${pendingCount} awaiting action`,
      icon: ShoppingBag,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      href: '/admin/orders',
    },
    {
      label: 'Review Queue',
      value: pendingReviews,
      sub: `${totalReviews} total submitted`,
      icon: Star,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      href: '/admin/reviews',
    },
    {
      label: 'Products',
      value: totalProducts,
      sub: 'in catalog',
      icon: Package,
      iconColor: 'text-volta-accent-ink',
      iconBg: 'bg-volta-accent-soft',
      href: '/admin/products',
    },
  ];

  const recentOrders = allOrders?.data?.slice(0, 8) ?? [];

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-volta-accent-ink mb-1">Overview</p>
        <h1 className="font-heading font-bold text-[36px] tracking-[-0.025em] leading-none text-volta-ink">Dashboard</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} className="bg-white rounded-xl border border-volta-line p-5 hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${kpi.iconBg} flex items-center justify-center mb-4`}>
                <Icon size={18} className={kpi.iconColor} />
              </div>
              <p className="font-heading font-bold text-[30px] tracking-[-0.025em] text-volta-ink leading-none mb-2">
                {kpi.value}
              </p>
              <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-volta-accent-ink mb-0.5">{kpi.label}</p>
              <p className="text-[12px] text-volta-ink-3">{kpi.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl border border-volta-line overflow-hidden">
        <div className="px-6 py-4 border-b border-volta-line flex items-center justify-between">
          <h2 className="font-heading font-bold text-[17px] tracking-[-0.01em] text-volta-ink">Recent Orders</h2>
          <Link href="/admin/orders" className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-accent-ink hover:underline">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-volta-ink-3">No orders yet</p>
        ) : (
          <div className="divide-y divide-volta-line">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-[oklch(0.97_0.005_90)] transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-[12px] font-semibold text-volta-ink">{order.orderCode}</p>
                    <p className="text-[12px] text-volta-ink-3">{order.user?.fullName ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-[12px] text-volta-ink-3">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {order.status}
                  </span>
                  <p className="font-heading font-bold text-[15px] text-volta-ink w-20 text-right">
                    ${parseFloat(order.total || '0').toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
