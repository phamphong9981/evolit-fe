'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useActiveEnrollmentsByClass } from '@/hooks/enrollment';
import { useAttendancesByClassAndDate } from '@/hooks/attendance';
import type { AttendanceStatus, StudentAttendanceDto } from '@/types/attendance';
import { Calendar } from '@/components/ui/calendar';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, students: StudentAttendanceDto[]) => Promise<void>;
  classId: number;
  className?: string;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: 'PRESENT', label: 'Có mặt', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'ABSENT_WITH_PERMISSION', label: 'Vắng có phép', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'ABSENT_NO_PERMISSION', label: 'Vắng không phép', icon: XCircle, color: 'text-red-600' },
  { value: 'LATE', label: 'Muộn', icon: Clock, color: 'text-orange-600' },
];

export function AttendanceModal({ isOpen, onClose, onSubmit, classId, className }: AttendanceModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [studentAttendances, setStudentAttendances] = useState<Record<number, StudentAttendanceDto>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDateString = useMemo(
    () => (selectedDate ? selectedDate.toISOString().split('T')[0] : ''),
    [selectedDate]
  );

  // Fetch enrolled students
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useActiveEnrollmentsByClass(classId);
  
  // Fetch existing attendance for selected date
  const { data: existingAttendances = [], isLoading: isLoadingAttendance } = useAttendancesByClassAndDate(
    classId,
    selectedDateString
  );

  // Initialize student attendances from enrollments and existing attendance
  useEffect(() => {
    if (enrollments.length > 0) {
      const initial: Record<number, StudentAttendanceDto> = {};
      
      // First, populate from existing attendance if available
      existingAttendances.forEach((attendance) => {
        if (attendance.studentId) {
          initial[attendance.studentId] = {
            studentId: attendance.studentId,
            status: attendance.status,
            note: attendance.note || null,
          };
        }
      });

      // Then, add any missing students from enrollments
      enrollments.forEach((enrollment) => {
        if (enrollment.studentId && !initial[enrollment.studentId]) {
          initial[enrollment.studentId] = {
            studentId: enrollment.studentId,
            status: 'PRESENT',
            note: null,
          };
        }
      });

      setStudentAttendances(initial);
    }
  }, [enrollments, existingAttendances, selectedDateString]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setStudentAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: number, note: string) => {
    setStudentAttendances((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        note: note || null,
      },
    }));
  };

  const handleBulkStatus = (status: AttendanceStatus) => {
    const updated: Record<number, StudentAttendanceDto> = {};
    Object.keys(studentAttendances).forEach((key) => {
      const studentId = Number(key);
      updated[studentId] = {
        ...studentAttendances[studentId],
        status,
      };
    });
    setStudentAttendances(updated);
  };

  const handleSubmit = async () => {
    if (Object.keys(studentAttendances).length === 0) {
      setError('Chưa có học sinh nào để điểm danh');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const students = Object.values(studentAttendances);
      await onSubmit(selectedDateString, students);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi điểm danh');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const students = enrollments
    .map((e) => e.student)
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Điểm danh lớp học
            </h2>
            {className && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{className}</p>
            )}
          </div>
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Calendar Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Chọn ngày điểm danh
                  </label>
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setSelectedDate(date ?? new Date())}
                      className="w-full"
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Ngày đã chọn: {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}
                  </p>
                </div>

                {/* Bulk Actions */}
                {students.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Thao tác nhanh
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleBulkStatus('PRESENT')}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Tất cả có mặt
                      </button>
                      <button
                        onClick={() => handleBulkStatus('ABSENT_WITH_PERMISSION')}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Tất cả vắng có phép
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Students List Section */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  Danh sách học sinh ({students.length})
                </h3>
              </div>

              {isLoadingEnrollments || isLoadingAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                  Chưa có học sinh nào trong lớp
                </div>
              ) : (
                <div className="max-h-[500px] space-y-3 overflow-y-auto">
                  {students.map((student) => {
                    const attendance = studentAttendances[student.id];
                    const status = attendance?.status || 'PRESENT';
                    const note = attendance?.note || '';

                    return (
                      <div
                        key={student.id}
                        className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-zinc-900 dark:text-zinc-50">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                              {student.code}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col gap-3">
                            {/* Status Dropdown */}
                            <div>
                              <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">
                                Trạng thái
                              </label>
                              <select
                                value={status}
                                onChange={(e) =>
                                  handleStatusChange(student.id, e.target.value as AttendanceStatus)
                                }
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                              >
                                {STATUS_OPTIONS.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Note Input */}
                            <div>
                              <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">
                                Ghi chú
                              </label>
                              <input
                                type="text"
                                value={note}
                                onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                placeholder="Nhập ghi chú (tùy chọn)"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || students.length === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu điểm danh'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

