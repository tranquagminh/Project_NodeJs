'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderCode = params.get('order');

  return (
    <div className="bg-volta-bg min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-[480px] w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-volta-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-volta-accent-ink" />
        </div>

        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">
          Order placed
        </p>
        <h1 className="font-heading font-bold text-[clamp(36px,5vw,56px)] tracking-[-0.02em] leading-none mb-4">
          Thank you!
        </h1>
        <p className="text-volta-ink-2 text-[15px] leading-relaxed mb-6">
          Your order has been confirmed and is being prepared. You&apos;ll receive an email confirmation shortly.
        </p>

        {orderCode && (
          <div className="bg-white border border-volta-line rounded-xl p-4 mb-8 inline-flex items-center gap-3">
            <Package size={18} className="text-volta-ink-3 flex-shrink-0" />
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-volta-ink-3">Order code</p>
              <p className="font-heading font-bold text-[16px] mt-0.5">{orderCode}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-volta-ink text-white rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink-2 transition-colors"
          >
            View orders <ArrowRight size={14} />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-volta-ink text-volta-ink rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink hover:text-white transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
