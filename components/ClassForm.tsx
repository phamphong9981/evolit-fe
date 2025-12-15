'use client';

import { useState, useEffect } from 'react';
import type { Class, CreateClassDto, UpdateClassDto, ClassStatus } from '@/types/class';
import { X } from 'lucide-react';

interface ClassFormProps {
  classData?: Class | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassDto | UpdateClassDto) => Promise<void>;
}

const STATUS_OPTIONS: { value: ClassStatus; label: string }[] = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'archived', label: 'Đã kết thúc' },
];

export function ClassForm({ classData, isOpen, onClose, onSubmit }: ClassFormProps) {
  const [formData, setFormData] = useState<CreateClassDto>({
    name: '',
    subjectId: 0,
    branchId: 1,
    teacherId: undefined,
    status: 'active',
    baseTuitionFee: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        subjectId: classData.subjectId,
        branchId: classData.branchId || 1,
        teacherId: classData.teacherId,
        status: classData.status,
        baseTuitionFee: classData.baseTuitionFee,
      });
    } else {
      setFormData({
        name: '',
        subjectId: 0,
        branchId: 1,
        teacherId: undefined,
        status: 'active',
        baseTuitionFee: 0,
      });
    }
    setError(null);
  }, [classData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (classData) {
        const submitData: UpdateClassDto = {
          name: formData.name,
          subjectId: formData.subjectId || undefined,
          branchId: formData.branchId || undefined,
          teacherId: formData.teacherId,
          status: formData.status,
          baseTuitionFee: formData.baseTuitionFee || undefined,
        };
        await onSubmit(submitData);
      } else {
        const submitData: CreateClassDto = {
          name: formData.name,
          subjectId: formData.subjectId,
          branchId: formData.branchId || 1,
          teacherId: formData.teacherId,
          status: formData.status || 'active',
          baseTuitionFee: formData.baseTuitionFee,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {classData ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
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
                Tên lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Toán 6 - Cơ bản"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="subjectId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="subjectId"
                required
                min="1"
                value={formData.subjectId || ''}
                onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) || 0 })}
                placeholder="ID môn học"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Tạm thời nhập ID môn học. Sẽ được thay bằng dropdown sau.
              </p>
            </div>

            <div>
              <label htmlFor="branchId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Cơ sở
              </label>
              <input
                type="number"
                id="branchId"
                min="1"
                value={formData.branchId || ''}
                onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) || 1 })}
                placeholder="ID cơ sở"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="teacherId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Giáo viên
              </label>
              <input
                type="number"
                id="teacherId"
                min="1"
                value={formData.teacherId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teacherId: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="ID giáo viên (tùy chọn)"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="baseTuitionFee" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Học phí (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="baseTuitionFee"
                required
                value={formatCurrency(formData.baseTuitionFee)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseTuitionFee: parseCurrency(e.target.value),
                  })
                }
                placeholder="1,500,000"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Trạng thái
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? 'Đang lưu...' : classData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

