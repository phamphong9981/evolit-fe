'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Enrollment, UpdateEnrollmentDto, EnrollmentStatus } from '@/types/enrollment';

interface EnrollmentFormProps {
  enrollment?: Enrollment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateEnrollmentDto) => Promise<void>;
}

const STATUS_OPTIONS: { value: EnrollmentStatus; label: string }[] = [
  { value: 'active', label: 'Đang học' },
  { value: 'reserved', label: 'Bảo lưu' },
  { value: 'dropped', label: 'Nghỉ học' },
  { value: 'mixed', label: 'Hỗn hợp' },
];

export function EnrollmentForm({ enrollment, isOpen, onClose, onSubmit }: EnrollmentFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState<string>('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [status, setStatus] = useState<EnrollmentStatus>('active');
  const [specificDiscount, setSpecificDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (enrollment) {
      setStartDate(enrollment.startDate);
      setEndDate(enrollment.endDate || '');
      setHasEndDate(!!enrollment.endDate);
      setStatus(enrollment.status);
      setSpecificDiscount(enrollment.specificDiscount || 0);
    }
    setError(null);
  }, [enrollment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) {
      setError('Vui lòng chọn ngày bắt đầu');
      return;
    }
    if (hasEndDate && endDate && endDate < startDate) {
      setError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        startDate,
        endDate: hasEndDate ? endDate : null,
        status,
        specificDiscount: specificDiscount > 0 ? specificDiscount : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chỉnh sửa đăng ký học
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

          {/* Student Info (Read-only) */}
          {enrollment?.student && (
            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Học sinh</div>
              <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                {enrollment.student.fullName} ({enrollment.student.code})
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => {
                    setHasEndDate(e.target.checked);
                    if (!e.target.checked) setEndDate('');
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Có ngày kết thúc
                </span>
              </label>
              {hasEndDate && (
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Trạng thái
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EnrollmentStatus)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount */}
            <div>
              <label htmlFor="discount" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Giảm giá (%)
              </label>
              <input
                type="number"
                id="discount"
                min="0"
                max="100"
                value={specificDiscount}
                onChange={(e) => setSpecificDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

