'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Star, Package, Tag, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/store/auth';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, exact: false },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, exact: false },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push('/login?redirect=/admin'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') router.push('/');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-volta-bg">
        <div className="w-8 h-8 rounded-full border-2 border-volta-ink border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.005_90)]">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-volta-ink flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-7 border-b border-white/[0.08]">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-volta-accent mb-0.5">Admin Panel</p>
          <p className="font-heading font-bold text-[22px] tracking-[-0.02em] text-white leading-none">VOLTA</p>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  active
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/40 hover:text-white/75 hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={15} className={active ? 'text-volta-accent' : 'opacity-60'} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.08] flex flex-col gap-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/40 hover:text-white/75 hover:bg-white/[0.05] transition-all"
          >
            <ExternalLink size={15} className="opacity-60" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/40 hover:text-white/75 hover:bg-white/[0.05] transition-all w-full text-left"
          >
            <LogOut size={15} className="opacity-60" />
            Sign out
          </button>
          <div className="px-3 pt-3 mt-1 border-t border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-volta-accent flex items-center justify-center text-volta-ink font-heading font-bold text-[11px] flex-shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-white/70 font-medium truncate">{user.fullName}</p>
                <p className="text-[10px] text-white/30 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content offset */}
      <main className="flex-1 ml-[220px] min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
