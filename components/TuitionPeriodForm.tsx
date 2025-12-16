'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TuitionPeriod, CreateTuitionPeriodDto, UpdateTuitionPeriodDto } from '@/types/tuition-period';

interface TuitionPeriodFormProps {
  period?: TuitionPeriod | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTuitionPeriodDto | UpdateTuitionPeriodDto) => Promise<void>;
}

export function TuitionPeriodForm({ period, isOpen, onClose, onSubmit }: TuitionPeriodFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate dates from month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    if (period) {
      setFormData({
        name: period.name,
        month: period.month,
        year: period.year,
        startDate: period.startDate,
        endDate: period.endDate,
      });
    } else {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const days = getDaysInMonth(month, year);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(days).padStart(2, '0')}`;

      setFormData({
        name: `Tháng ${month}/${year}`,
        month,
        year,
        startDate,
        endDate,
      });
    }
    setError(null);
  }, [period, isOpen]);

  // Auto-update dates when month/year changes
  useEffect(() => {
    if (!period && formData.month && formData.year) {
      const days = getDaysInMonth(formData.month, formData.year);
      const startDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-01`;
      const endDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(days).padStart(2, '0')}`;

      setFormData((prev) => ({
        ...prev,
        name: `Tháng ${formData.month}/${formData.year}`,
        startDate,
        endDate,
      }));
    }
  }, [formData.month, formData.year, period]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (period) {
        const submitData: UpdateTuitionPeriodDto = {
          name: formData.name,
          month: formData.month,
          year: formData.year,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        await onSubmit(submitData);
      } else {
        const submitData: CreateTuitionPeriodDto = {
          name: formData.name,
          month: formData.month,
          year: formData.year,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        await onSubmit(submitData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {period ? 'Chỉnh sửa kỳ học phí' : 'Tạo kỳ học phí mới'}
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

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tên kỳ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tháng 1/2024"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tháng <span className="text-red-500">*</span>
                </label>
                <select
                  id="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Năm <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="year"
                  required
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Số ngày trong kỳ: <span className="font-medium text-zinc-900 dark:text-zinc-50">{calculateDays()} ngày</span>
                </div>
              </div>
            )}
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
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? 'Đang lưu...' : period ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

