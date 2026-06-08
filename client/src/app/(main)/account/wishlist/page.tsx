'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist } from '@/services/wishlist';
import { getProductMainImage } from '@/lib/images';
import { Heart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Wishlist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white border border-volta-line rounded-xl aspect-[3/4] animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Wishlist</h2>
        <div className="bg-white border border-volta-line rounded-xl p-12 text-center">
          <Heart size={40} className="mx-auto text-volta-ink-4 mb-4" />
          <p className="font-heading font-bold text-[18px]">Your wishlist is empty</p>
          <p className="text-volta-ink-3 text-[14px] mt-1 mb-6">Save products you love by clicking the heart icon.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-volta-ink text-white rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink-2 transition-colors">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Wishlist ({items.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((p) => {
          const img = getProductMainImage(p.images, p.slug);
          return (
            <div key={p.id} className="bg-white border border-volta-line rounded-xl overflow-hidden group">
              <Link href={`/products/${p.slug}`} className="block relative aspect-square bg-volta-bg-2">
                <Image src={img} alt={p.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-3">
                <Link href={`/products/${p.slug}`} className="font-heading font-bold text-[14px] hover:text-volta-accent-ink transition-colors line-clamp-1">{p.name}</Link>
                <p className="font-heading font-bold text-[16px] text-volta-ink mt-1">${Number(p.salePrice ?? p.basePrice).toFixed(2)}</p>
                <button
                  onClick={() => removeMutation.mutate(p.id)}
                  disabled={removeMutation.isPending}
                  className="mt-2 flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
