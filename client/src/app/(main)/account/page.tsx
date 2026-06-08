'use client';

import { useState } from 'react';
import { useAuth } from '@/store/auth';
import { api } from '@/services/api';
import { Check } from 'lucide-react';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/users/profile', { fullName, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading font-bold text-[22px] tracking-[-0.01em] mb-6">Profile</h2>

      <div className="bg-white border border-volta-line rounded-xl p-6 max-w-[560px]">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full py-3 px-4 border border-volta-line rounded-lg text-[14px] bg-white text-volta-ink focus:border-volta-accent-ink outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full py-3 px-4 border border-volta-line rounded-lg text-[14px] bg-volta-bg text-volta-ink-3 cursor-not-allowed"
            />
            <p className="text-[11px] text-volta-ink-3 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full py-3 px-4 border border-volta-line rounded-lg text-[14px] bg-white text-volta-ink focus:border-volta-accent-ink outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-600 text-[13px]">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start px-6 py-3 bg-volta-ink text-white rounded-lg font-heading font-medium text-[13px] hover:bg-volta-ink-2 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saved ? <><Check size={15} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="mt-6 bg-white border border-volta-line rounded-xl p-6 max-w-[560px]">
        <h3 className="font-heading font-semibold text-[16px] mb-4">Account details</h3>
        <div className="flex flex-col gap-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-volta-ink-3">Role</span>
            <span className="font-medium capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-volta-ink-3">Member since</span>
            <span className="font-medium">2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
