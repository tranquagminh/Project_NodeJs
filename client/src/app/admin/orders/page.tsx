'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '@/services/admin';
import { useToast } from '@/store/toast';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-500',
};

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
  REFUNDED: null,
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter, page],
    queryFn: () => getAdminOrders(page, statusFilter || undefined),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => updateOrderStatus(id, next),
    onSuccess: () => {
      success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: () => toastError('Failed to update order'),
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / (meta.limit || 20)) : 1;

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-volta-accent-ink mb-1">Management</p>
        <h1 className="font-heading font-bold text-[36px] tracking-[-0.025em] leading-none text-volta-ink">Orders</h1>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-white border border-volta-line rounded-[10px] p-1 mb-6 overflow-x-auto w-fit">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-mono text-[10px] tracking-[0.1em] uppercase cursor-pointer transition-all ${
              statusFilter === s ? 'bg-volta-ink text-white' : 'text-volta-ink-3 hover:text-volta-ink'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-volta-line overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-volta-ink border-t-transparent animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-volta-ink-3">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-volta-line bg-[oklch(0.97_0.005_90)]">
                <tr>
                  {['Order Code', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Next Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.12em] uppercase text-volta-ink-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-volta-line">
                {orders.map((order) => {
                  const next = NEXT_STATUS[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-[oklch(0.97_0.005_90)] transition-colors">
                      <td className="px-5 py-4 font-mono text-[12px] font-semibold text-volta-ink whitespace-nowrap">{order.orderCode}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-volta-ink">{order.user?.fullName ?? '—'}</p>
                        <p className="text-[11px] text-volta-ink-3">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-volta-ink-3 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-volta-ink-2 text-center">{order.items?.length ?? 0}</td>
                      <td className="px-5 py-4 font-heading font-bold text-volta-ink whitespace-nowrap">
                        ${parseFloat(order.total || '0').toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold whitespace-nowrap ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {next ? (
                          <button
                            onClick={() => advanceMutation.mutate({ id: order.id, next })}
                            disabled={advanceMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-volta-ink text-white rounded-lg text-[10px] font-mono tracking-[0.08em] uppercase hover:bg-volta-ink-2 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            → {next}
                          </button>
                        ) : (
                          <span className="text-[12px] text-volta-ink-3">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-volta-line bg-white hover:bg-[oklch(0.97_0.005_90)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[12px] text-volta-ink-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-volta-line bg-white hover:bg-[oklch(0.97_0.005_90)] disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
