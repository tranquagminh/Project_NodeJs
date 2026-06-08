'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/services/orders';
import { Package, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPING: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => getOrders(),
  });

  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div>
        <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Orders</h2>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-volta-line rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Orders</h2>
        <div className="bg-white border border-volta-line rounded-xl p-12 text-center">
          <Package size={40} className="mx-auto text-volta-ink-4 mb-4" />
          <p className="font-heading font-bold text-[18px]">No orders yet</p>
          <p className="text-volta-ink-3 text-[14px] mt-1 mb-6">When you place an order it will appear here.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-volta-ink text-white rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink-2 transition-colors">
            Shop now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Orders ({data?.meta.total})</h2>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-volta-line rounded-xl p-5 hover:border-volta-ink-4 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-ink-3">Order</p>
                <p className="font-heading font-bold text-[16px] mt-0.5">#{order.orderCode}</p>
                <p className="text-volta-ink-3 text-[12px] mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block text-[10px] font-mono tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${statusColors[order.status] ?? 'bg-volta-bg text-volta-ink-3 border-volta-line'}`}>
                  {order.status.toLowerCase()}
                </span>
                <p className="font-heading font-bold text-[18px] mt-2">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            {order.items?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {order.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative w-14 h-14 bg-volta-bg-2 rounded-lg overflow-hidden border border-volta-line flex-shrink-0">
                    <Image src={item.productImage} alt={item.productName} fill className="object-contain p-1" />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 bg-volta-bg-2 rounded-lg border border-volta-line flex items-center justify-center text-[11px] text-volta-ink-3 font-medium">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-volta-line flex justify-between items-center">
              <span className="text-[13px] text-volta-ink-3">
                {order.shippingMethod === 'EXPRESS_VELOCITY' ? 'Express Velocity' : 'Standard Delivery'}
              </span>
              <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1 text-[13px] font-medium text-volta-accent-ink hover:underline">
                View details <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
