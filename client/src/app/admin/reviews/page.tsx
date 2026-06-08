'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminReviews, approveReview } from '@/services/admin';
import { useToast } from '@/store/toast';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page],
    queryFn: () => getAdminReviews(page),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => approveReview(id, isApproved),
    onSuccess: (_, { isApproved }) => {
      success(isApproved ? 'Review approved and published' : 'Review rejected');
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toastError('Action failed'),
  });

  const reviews = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / (meta.limit || 20)) : 1;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-volta-accent-ink mb-1">Moderation</p>
          <h1 className="font-heading font-bold text-[36px] tracking-[-0.025em] leading-none text-volta-ink">Reviews</h1>
        </div>
        {pendingCount > 0 && (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="font-mono text-[11px] text-amber-700 font-medium">{pendingCount} pending on this page</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-volta-ink border-t-transparent animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[14px] text-volta-ink-3">No reviews yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl border p-5 flex gap-4 transition-colors ${
                review.isApproved ? 'border-volta-line' : 'border-amber-200 bg-amber-50/30'
              }`}
            >
              {/* Status dot */}
              <div className="flex-shrink-0 pt-1.5">
                <div className={`w-2 h-2 rounded-full ${review.isApproved ? 'bg-green-500' : 'bg-amber-400'}`} title={review.isApproved ? 'Published' : 'Pending'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-heading font-semibold text-[14px] text-volta-ink">{review.user?.fullName}</p>
                    <p className="text-[12px] text-volta-accent-ink font-mono mt-0.5">
                      {review.product?.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex gap-0.5 justify-end mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                    </div>
                    <p className="font-mono text-[10px] text-volta-ink-3">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-[13px] text-volta-ink-2 leading-relaxed mb-3 max-w-2xl">{review.comment}</p>
                )}

                <div className="flex gap-2 mt-2">
                  {!review.isApproved ? (
                    <>
                      <button
                        onClick={() => moderateMutation.mutate({ id: review.id, isApproved: true })}
                        disabled={moderateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-mono tracking-[0.08em] uppercase hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => moderateMutation.mutate({ id: review.id, isApproved: false })}
                        disabled={moderateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[11px] font-mono tracking-[0.08em] uppercase hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <X size={12} /> Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => moderateMutation.mutate({ id: review.id, isApproved: false })}
                      disabled={moderateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-volta-line text-volta-ink-3 rounded-lg text-[11px] font-mono tracking-[0.08em] uppercase hover:bg-volta-bg disabled:opacity-50 transition-colors"
                    >
                      <X size={12} /> Unpublish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
