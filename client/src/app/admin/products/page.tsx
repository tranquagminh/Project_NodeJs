'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Star } from 'lucide-react';
import { getAdminProducts, updateProduct } from '@/services/admin';
import { useToast } from '@/store/toast';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-400',
  ACTIVE: 'bg-green-100 text-green-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-600',
  DISCONTINUED: 'bg-orange-100 text-orange-600',
  ARCHIVED: 'bg-gray-200 text-gray-500',
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => getAdminProducts(page),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateProduct(id, { status }),
    onSuccess: (_, { status }) => {
      success(`Product ${status === 'ACTIVE' ? 'published' : 'unpublished'}`);
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: () => toastError('Failed to update product'),
  });

  const products = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / (meta.limit || 20)) : 1;

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-volta-accent-ink mb-1">Catalog</p>
        <h1 className="font-heading font-bold text-[36px] tracking-[-0.025em] leading-none text-volta-ink">Products</h1>
      </div>

      <div className="bg-white rounded-xl border border-volta-line overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-volta-ink border-t-transparent animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-[14px] text-volta-ink-3">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-volta-line bg-[oklch(0.97_0.005_90)]">
                <tr>
                  {['Product', 'Brand / Category', 'Price', 'Stock', 'Rating', 'Sold', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.12em] uppercase text-volta-ink-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-volta-line">
                {products.map((product) => {
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
                  const isActive = product.status === 'ACTIVE';

                  return (
                    <tr key={product.id} className="hover:bg-[oklch(0.97_0.005_90)] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-volta-ink">{product.name}</p>
                        <p className="text-[10px] text-volta-ink-3 font-mono mt-0.5">{product.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-volta-ink-2">{product.brand?.name ?? '—'}</p>
                        <p className="text-[11px] text-volta-ink-3">{product.category?.name ?? '—'}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {product.salePrice ? (
                          <>
                            <p className="font-heading font-bold text-volta-ink">${parseFloat(product.salePrice).toFixed(0)}</p>
                            <p className="text-[11px] text-volta-ink-3 line-through">${parseFloat(product.basePrice).toFixed(0)}</p>
                          </>
                        ) : (
                          <p className="font-heading font-bold text-volta-ink">${parseFloat(product.basePrice).toFixed(0)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-mono text-[13px] font-semibold ${
                          totalStock === 0 ? 'text-red-600' : totalStock < 5 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {product.avgRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-volta-ink-2">{Number(product.avgRating).toFixed(1)}</span>
                            <span className="text-[11px] text-volta-ink-3">({product.totalReviews})</span>
                          </div>
                        ) : (
                          <span className="text-volta-ink-3">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-volta-ink-2 text-center">{product.totalSold ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${STATUS_COLORS[product.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleMutation.mutate({ id: product.id, status: isActive ? 'ARCHIVED' : 'ACTIVE' })}
                          disabled={toggleMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-volta-line rounded-lg text-[10px] font-mono tracking-[0.08em] uppercase hover:bg-[oklch(0.97_0.005_90)] disabled:opacity-50 transition-colors text-volta-ink-2 whitespace-nowrap"
                        >
                          {isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                          {isActive ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
