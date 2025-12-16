'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Order, ConfirmPaymentDto } from '@/types/order';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConfirmPaymentDto) => Promise<void>;
  order: Order | null;
}

export function ConfirmPaymentModal({ isOpen, onClose, onSubmit, order }: ConfirmPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    method: 'BANK_TRANSFER' as 'CASH' | 'BANK_TRANSFER',
    evidence: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = order ? order.finalAmount - order.totalPaid : 0;

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      const remaining = order.finalAmount - order.totalPaid;
      setFormData({
        amount: remaining,
        method: 'BANK_TRANSFER',
        evidence: '',
      });
      setError(null);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.amount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        amount: formData.amount,
        method: formData.method,
        evidence: formData.evidence || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Xác nhận thanh toán
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-4 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Hóa đơn:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">#{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Tổng tiền:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.finalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Đã đóng:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.totalPaid)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-medium dark:border-zinc-700">
              <span className="text-zinc-900 dark:text-zinc-50">Còn lại:</span>
              <span className="text-zinc-900 dark:text-zinc-50">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Số tiền <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                required
                min="0.01"
                step="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: remaining })}
                className="mt-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Điền số tiền còn lại
              </button>
            </div>

            <div>
              <label htmlFor="method" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                id="method"
                required
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as 'CASH' | 'BANK_TRANSFER' })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              >
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>

            <div>
              <label htmlFor="evidence" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Chứng từ (URL)
              </label>
              <input
                type="text"
                id="evidence"
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.amount <= 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

