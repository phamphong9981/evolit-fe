'use client';

import { useState, useMemo } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useStudents } from '@/hooks/student';
import type { Student } from '@/types/student';

interface AddStudentsToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (studentIds: number[]) => Promise<void>;
  existingStudentIds?: number[];
  isBulk?: boolean;
}

export function AddStudentsToClassModal({
  isOpen,
  onClose,
  onAdd,
  existingStudentIds = [],
  isBulk = false,
}: AddStudentsToClassModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: students = [], isLoading } = useStudents();

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

  // Available students (not already in class)
  const availableStudents = useMemo(() => {
    return filteredStudents.filter((student) => !existingStudentIds.includes(student.id));
  }, [filteredStudents, existingStudentIds]);

  const handleToggleStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === availableStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(availableStudents.map((s) => s.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedStudentIds.size === 0) {
      setError('Vui lòng chọn ít nhất một học sinh');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onAdd(Array.from(selectedStudentIds));
      setSelectedStudentIds(new Set());
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
      <div className="relative w-full max-w-3xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {isBulk ? 'Thêm nhiều học sinh' : 'Thêm học sinh vào lớp'}
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

          {/* Search */}
          <div className="mb-4">
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

          {/* Select All */}
          {isBulk && availableStudents.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {selectedStudentIds.size === availableStudents.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </button>
            </div>
          )}

          {/* Students List */}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                {searchQuery ? 'Không tìm thấy học sinh nào' : 'Tất cả học sinh đã có trong lớp'}
              </div>
            ) : (
              availableStudents.map((student) => (
                <label
                  key={student.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <input
                    type={isBulk ? 'checkbox' : 'radio'}
                    checked={selectedStudentIds.has(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
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

          {/* Selected Count */}
          {selectedStudentIds.size > 0 && (
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Đã chọn: {selectedStudentIds.size} học sinh
            </div>
          )}

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
              disabled={isSubmitting || selectedStudentIds.size === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

