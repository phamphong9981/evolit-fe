'use client';

import { useState, useMemo } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useStudents } from '@/hooks/student';
import { useActiveClasses } from '@/hooks/class';
import type { Student } from '@/types/student';
import type { CreateEnrollmentDto, EnrollmentStatus } from '@/types/enrollment';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateEnrollmentDto) => Promise<void>;
  existingStudentIds?: number[];
  defaultClassId?: number;
  isBulk?: boolean;
}

const STATUS_OPTIONS: { value: EnrollmentStatus; label: string }[] = [
  { value: 'active', label: 'Đang học' },
  { value: 'reserved', label: 'Bảo lưu' },
  { value: 'dropped', label: 'Nghỉ học' },
];

export function EnrollmentModal({
  isOpen,
  onClose,
  onAdd,
  existingStudentIds = [],
  defaultClassId,
  isBulk = false,
}: EnrollmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number>(defaultClassId || 0);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [status, setStatus] = useState<EnrollmentStatus>('active');
  const [specificDiscount, setSpecificDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: classes = [], isLoading: isLoadingClasses } = useActiveClasses();

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.code.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Available students (not already enrolled)
  const availableStudents = useMemo(() => {
    return filteredStudents.filter((student) => !existingStudentIds.includes(student.id));
  }, [filteredStudents, existingStudentIds]);

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      setError('Vui lòng chọn học sinh');
      return;
    }
    if (!selectedClassId) {
      setError('Vui lòng chọn lớp học');
      return;
    }
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
      await onAdd({
        studentId: selectedStudentId,
        classId: selectedClassId,
        startDate,
        endDate: hasEndDate ? endDate : null,
        status,
        specificDiscount: specificDiscount > 0 ? specificDiscount : undefined,
      });
      // Reset form
      setSelectedStudentId(null);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setHasEndDate(false);
      setStatus('active');
      setSpecificDiscount(0);
      setSearchQuery('');
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
            Đăng ký học sinh vào lớp
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Class Selection */}
            <div>
              <label htmlFor="classId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Lớp học <span className="text-red-500">*</span>
              </label>
              {isLoadingClasses ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Đang tải...</span>
                </div>
              ) : (
                <select
                  id="classId"
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                >
                  <option value={0}>Chọn lớp học</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.subject?.name ? `- ${cls.subject.name}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Student Search */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Học sinh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {searchQuery ? 'Không tìm thấy học sinh nào' : 'Tất cả học sinh đã đăng ký'}
                </div>
              ) : (
                availableStudents.map((student) => (
                  <label
                    key={student.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedStudentId === student.id
                        ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="student"
                      checked={selectedStudentId === student.id}
                      onChange={() => setSelectedStudentId(student.id)}
                      className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {student.fullName}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{student.code}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

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
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStudentId || !selectedClassId}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

