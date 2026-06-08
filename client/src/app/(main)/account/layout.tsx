'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';

const navItems = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-volta-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-volta-accent-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-volta-bg min-h-screen">
      <div className="max-w-[1360px] mx-auto px-8 py-12">
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-volta-accent-ink">Account</p>
          <h1 className="font-heading font-bold text-[clamp(32px,4vw,48px)] tracking-[-0.02em] mt-1">
            {user.fullName}
          </h1>
          <p className="text-volta-ink-3 text-[14px] mt-1">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar nav */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-colors ${
                  pathname === href
                    ? 'bg-volta-ink text-white'
                    : 'text-volta-ink-2 hover:bg-volta-bg-2 hover:text-volta-ink'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-volta-line pt-5"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </nav>

          {/* Page content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
