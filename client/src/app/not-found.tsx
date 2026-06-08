import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-volta-bg min-h-screen flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-[480px]">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink mb-2">Error 404</p>
        <h1 className="font-heading font-bold text-[clamp(80px,14vw,160px)] tracking-[-0.04em] leading-[0.9] text-volta-ink mb-4">
          404
        </h1>
        <p className="font-heading font-bold text-[20px] tracking-[-0.01em] mb-2">Page not found</p>
        <p className="text-volta-ink-2 text-[15px] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3.5 bg-volta-ink text-white rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink-2 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/products"
            className="px-6 py-3.5 border border-volta-ink text-volta-ink rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink hover:text-white transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
