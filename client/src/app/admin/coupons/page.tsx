'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { getAdminCoupons, createCoupon, toggleCoupon, deleteCoupon } from '@/services/admin';
import { useToast } from '@/store/toast';

const todayStr = new Date().toISOString().split('T')[0];
const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const EMPTY_FORM = {
  code: '', type: 'PERCENTAGE', value: '',
  minOrderAmount: '', maxDiscount: '',
  usageLimit: '0', startDate: todayStr, endDate: nextYearStr,
};

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: getAdminCoupons,
  });

  const f = (key: keyof typeof EMPTY_FORM, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const createMutation = useMutation({
    mutationFn: () =>
      createCoupon({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        usageLimit: parseInt(form.usageLimit) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    onSuccess: () => {
      success('Coupon created');
      setShowForm(false);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (err: any) => toastError(err?.response?.data?.message || 'Failed to create coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCoupon(id, isActive),
    onSuccess: (_, { isActive }) => {
      success(isActive ? 'Coupon enabled' : 'Coupon disabled');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toastError('Failed to delete coupon'),
  });

  const inputCls = 'w-full py-2.5 px-3 border border-volta-line rounded-lg text-[13px] bg-white text-volta-ink outline-none focus:border-volta-accent-ink transition-colors';
  const labelCls = 'block font-mono text-[9px] tracking-[0.14em] uppercase text-volta-ink-3 mb-1.5';

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-volta-accent-ink mb-1">Marketing</p>
          <h1 className="font-heading font-bold text-[36px] tracking-[-0.025em] leading-none text-volta-ink">Coupons</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-volta-ink text-white rounded-[10px] font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-volta-ink-2 transition-colors"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-volta-line p-6 mb-6">
          <h2 className="font-heading font-bold text-[18px] tracking-[-0.01em] text-volta-ink mb-5">New Coupon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={labelCls}>Code</label>
              <input value={form.code} onChange={(e) => f('code', e.target.value)} placeholder="VOLTA20" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={(e) => f('type', e.target.value)} className={inputCls}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value ({form.type === 'PERCENTAGE' ? '%' : '$'})</label>
              <input type="number" value={form.value} onChange={(e) => f('value', e.target.value)} placeholder={form.type === 'PERCENTAGE' ? '20' : '15'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Min order ($)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => f('minOrderAmount', e.target.value)} placeholder="100" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max discount ($)</label>
              <input type="number" value={form.maxDiscount} onChange={(e) => f('maxDiscount', e.target.value)} placeholder="50" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Usage limit (0 = ∞)</label>
              <input type="number" value={form.usageLimit} onChange={(e) => f('usageLimit', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Start date</label>
              <input type="date" value={form.startDate} onChange={(e) => f('startDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End date</label>
              <input type="date" value={form.endDate} onChange={(e) => f('endDate', e.target.value)} className={inputCls} />
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.code || !form.value}
            className="px-6 py-2.5 bg-volta-ink text-white rounded-[10px] font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-volta-ink-2 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? 'Creating…' : 'Create coupon'}
          </button>
        </div>
      )}

      {/* Coupon list */}
      <div className="bg-white rounded-xl border border-volta-line overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-volta-ink border-t-transparent animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-volta-ink-3 mb-2">No coupons yet</p>
            <button onClick={() => setShowForm(true)} className="text-[13px] text-volta-accent-ink hover:underline">Create your first coupon →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-volta-line bg-[oklch(0.97_0.005_90)]">
                <tr>
                  {['Code', 'Discount', 'Min order', 'Usage', 'Valid period', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.12em] uppercase text-volta-ink-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-volta-line">
                {coupons.map((coupon) => {
                  const expired = new Date(coupon.endDate) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-[oklch(0.97_0.005_90)] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-[13px] font-bold text-volta-ink tracking-[0.04em]">{coupon.code}</p>
                      </td>
                      <td className="px-5 py-4 font-heading font-bold text-volta-ink whitespace-nowrap">
                        {coupon.type === 'PERCENTAGE'
                          ? `${parseFloat(coupon.value)}% off`
                          : `$${parseFloat(coupon.value).toFixed(2)} off`}
                        {coupon.maxDiscount && (
                          <p className="text-[11px] text-volta-ink-3 font-sans font-normal">max ${parseFloat(coupon.maxDiscount).toFixed(0)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-volta-ink-2">
                        {coupon.minOrderAmount ? `$${parseFloat(coupon.minOrderAmount).toFixed(0)}` : '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-[12px] text-volta-ink-2">
                        {coupon.usedCount} / {coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-volta-ink-3 whitespace-nowrap">
                        <p>{new Date(coupon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p>→ {new Date(coupon.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                          expired ? 'bg-gray-100 text-gray-400' :
                          coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                            disabled={toggleMutation.isPending || expired}
                            title={coupon.isActive ? 'Disable coupon' : 'Enable coupon'}
                            className="p-1.5 rounded-lg border border-volta-line hover:bg-[oklch(0.97_0.005_90)] disabled:opacity-40 transition-colors"
                          >
                            {coupon.isActive
                              ? <X size={13} className="text-volta-ink-3" />
                              : <Check size={13} className="text-green-600" />}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) {
                                deleteMutation.mutate(coupon.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Delete coupon"
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 disabled:opacity-40 transition-colors"
                          >
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
