'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Search, UserPlus } from 'lucide-react';
import { useActiveEnrollmentsByClass } from '@/hooks/enrollment';
import { useAttendancesByClassAndDate } from '@/hooks/attendance';
import { useSearchStudents } from '@/hooks/student';
import type { AttendanceStatus, StudentAttendanceDto } from '@/types/attendance';
import type { Student } from '@/types/student';
import { Calendar } from '@/components/ui/calendar';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, students: StudentAttendanceDto[]) => Promise<void>;
  classId: number;
  className?: string;
}

type UIStatus = AttendanceStatus | 'NOT_MARKED';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: 'ON_TIME', label: 'Đúng giờ', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'MAKEUP', label: 'Học bù', icon: RefreshCw, color: 'text-blue-600' },
  { value: 'LATE_LESS_10_MINUTES', label: 'Muộn dưới 10 phút', icon: Clock, color: 'text-orange-500' },
  { value: 'LATE_MORE_10_MINUTES', label: 'Muộn trên 10 phút', icon: Clock, color: 'text-orange-600' },
  { value: 'ABSENT_WITH_PERMISSION', label: 'Nghỉ có phép', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'ABSENT_NO_PERMISSION', label: 'Nghỉ không phép', icon: XCircle, color: 'text-red-600' },
  { value: 'ABSENT_MIXED', label: 'Nghỉ hỗn hợp', icon: AlertCircle, color: 'text-amber-600' },
];

// Filter out MAKEUP and NOT_MARKED from dropdown options
const DROPDOWN_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value !== 'MAKEUP'
);

// Helper function to get background color class based on status
const getStatusBackgroundClass = (status: UIStatus): string => {
  if (status === 'ON_TIME' || status === 'MAKEUP') {
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  }
  if (status === 'NOT_MARKED') {
    return 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700';
  }
  // All other statuses
  return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
};

export function AttendanceModal({ isOpen, onClose, onSubmit, classId, className }: AttendanceModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [studentAttendances, setStudentAttendances] = useState<Record<number, StudentAttendanceDto>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [externalStudents, setExternalStudents] = useState<Student[]>([]); // Students added from outside
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Search students
  const { data: searchResults = [], isLoading: isSearching } = useSearchStudents(searchQuery);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSearchResults && !target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);

  // Initialize student attendances from enrollments and existing attendance
  useEffect(() => {
    if (enrollments.length > 0 || existingAttendances.length > 0) {
      const initial: Record<number, StudentAttendanceDto> = {};
      const external: Student[] = [];
      const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId).filter(Boolean));

      // First, populate from existing attendance if available
      existingAttendances.forEach((attendance) => {
        if (attendance.studentId) {
          initial[attendance.studentId] = {
            studentId: attendance.studentId,
            status: attendance.status,
            note: attendance.note || null,
          };

          // If student is not enrolled and has student data, add to external students
          if (!enrolledStudentIds.has(attendance.studentId) && attendance.student) {
            external.push(attendance.student);
          }
        }
      });

      // Don't auto-add missing students - they will remain as "NOT_MARKED"
      // They will only be added when user explicitly sets a status

      setStudentAttendances(initial);
      if (external.length > 0) {
        setExternalStudents(external);
      }
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

  const handleAddExternalStudent = (student: Student) => {
    // Add student to external students list if not already added
    if (!externalStudents.find((s) => s.id === student.id)) {
      setExternalStudents((prev) => [...prev, student]);
    }
    // Add student attendance with MAKEUP status
    setStudentAttendances((prev) => ({
      ...prev,
      [student.id]: {
        studentId: student.id,
        status: 'MAKEUP',
        note: null,
      },
    }));
    // Clear search and hide results
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleBulkStatus = (status: AttendanceStatus) => {
    const updated: Record<number, StudentAttendanceDto> = {};
    // Apply to all enrolled students, not just those already in studentAttendances
    students.forEach((student) => {
      updated[student.id] = {
        ...studentAttendances[student.id],
        studentId: student.id,
        status,
        note: studentAttendances[student.id]?.note || null,
      };
    });
    setStudentAttendances(updated);
  };

  const handleSubmit = async () => {
    // Only submit students that have a valid status (not NOT_MARKED)
    const studentsToSubmit = Object.values(studentAttendances).filter(
      (attendance) => attendance.status !== 'NOT_MARKED' as any
    ) as StudentAttendanceDto[];

    if (studentsToSubmit.length === 0) {
      setError('Vui lòng điểm danh ít nhất một học sinh');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(selectedDateString, studentsToSubmit);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi điểm danh');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Get enrolled students
  const enrolledStudents = enrollments
    .map((e) => e.student)
    .filter((s): s is NonNullable<typeof s> => !!s);

  // Combine enrolled students with external students
  const students = useMemo(() => {
    const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
    const external = externalStudents.filter((s) => !enrolledIds.has(s.id));
    return [...enrolledStudents, ...external];
  }, [enrolledStudents, externalStudents]);

  // Filter search results to exclude students already in the list
  const availableSearchResults = useMemo(() => {
    const studentIds = new Set(students.map((s) => s.id));
    return searchResults.filter((student) => !studentIds.has(student.id));
  }, [searchResults, students]);

  // Create a map for status order (excluding NOT_MARKED which will be at the end)
  const statusOrderMap = useMemo(() => {
    const map = new Map<UIStatus, number>();
    STATUS_OPTIONS.forEach((option, index) => {
      map.set(option.value, index);
    });
    // NOT_MARKED gets the highest index to be sorted last
    map.set('NOT_MARKED', STATUS_OPTIONS.length);
    return map;
  }, []);

  // Sort students by status order
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const statusA: UIStatus = studentAttendances[a.id]?.status || 'NOT_MARKED';
      const statusB: UIStatus = studentAttendances[b.id]?.status || 'NOT_MARKED';
      const orderA = statusOrderMap.get(statusA) ?? STATUS_OPTIONS.length;
      const orderB = statusOrderMap.get(statusB) ?? STATUS_OPTIONS.length;

      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same status, sort by name
      return a.fullName.localeCompare(b.fullName);
    });
  }, [students, studentAttendances, statusOrderMap]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    let onTimeCount = 0;
    let makeupCount = 0;
    let totalCount = 0; // Total excluding MAKEUP

    Object.values(studentAttendances).forEach((attendance) => {
      if (attendance.status === 'ON_TIME' || attendance.status === 'LATE_LESS_10_MINUTES' || attendance.status === 'LATE_MORE_10_MINUTES') {
        onTimeCount++;
        totalCount++;
      } else if (attendance.status === 'MAKEUP') {
        makeupCount++;
      } else {
        totalCount++;
      }
    });

    return { onTimeCount, makeupCount, totalCount };
  }, [studentAttendances]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Điểm danh lớp học {className}
            </h2>
            <p className="mt-1 text-sx text-zinc-600 dark:text-zinc-400">Sĩ số ({attendanceStats.onTimeCount} / {students.length - attendanceStats.makeupCount})
              {attendanceStats.makeupCount > 0 && (
                <span className="text-blue-600 dark:text-blue-400">
                  {' '}(+ {attendanceStats.makeupCount} học sinh học bù)
                </span>
              )}</p>
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
                        onClick={() => handleBulkStatus('ON_TIME')}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Tất cả đúng giờ
                      </button>
                      <button
                        onClick={() => handleBulkStatus('ABSENT_WITH_PERMISSION')}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Tất cả nghỉ có phép
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Students List Section */}
            <div className="lg:col-span-2">
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>

                  </div>
                </div>

                {/* Search Bar for External Students */}
                <div className="relative search-container">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(e.target.value.trim().length > 0);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim().length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                      placeholder="Tìm kiếm học sinh để thêm học bù..."
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        </div>
                      ) : availableSearchResults.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                          {searchQuery.trim().length === 0
                            ? 'Nhập tên học sinh để tìm kiếm'
                            : 'Không tìm thấy học sinh'}
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto">
                          {availableSearchResults.map((student) => (
                            <button
                              key={student.id}
                              onClick={() => handleAddExternalStudent(student)}
                              className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors border-b border-zinc-100 last:border-b-0 dark:border-zinc-700"
                            >
                              <div className="flex items-center gap-3">
                                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <div className="flex-1">
                                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                    {student.fullName}
                                  </div>
                                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {student.code}
                                  </div>
                                </div>
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  Thêm học bù
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                  {sortedStudents.map((student) => {
                    const attendance = studentAttendances[student.id];
                    const currentStatus = attendance?.status;
                    const uiStatus: UIStatus = currentStatus || 'NOT_MARKED';
                    const note = attendance?.note || '';
                    const isNotMarked = !attendance;
                    const isMakeup = currentStatus === 'MAKEUP';

                    return (
                      <div
                        key={student.id}
                        className={`rounded-lg border p-3 ${getStatusBackgroundClass(uiStatus)}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Student Info */}
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                  {student.fullName}
                                </span>
                                {isMakeup && (
                                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    <RefreshCw className="h-2.5 w-2.5" />
                                    Học bù
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                  {student.code}
                                </span>
                                {isNotMarked && (
                                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                                    • Chưa điểm danh
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status and Note */}
                          <div className="flex flex-1 items-center gap-2">
                            {/* Status Dropdown */}
                            <div className="flex-1">
                              <select
                                value={uiStatus}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  // Only allow changing to statuses that are not MAKEUP or NOT_MARKED
                                  if (newStatus !== 'MAKEUP' && newStatus !== 'NOT_MARKED') {
                                    handleStatusChange(student.id, newStatus as AttendanceStatus);
                                  }
                                }}
                                disabled={isMakeup}
                                className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                              >
                                {/* Show current status if it's MAKEUP or NOT_MARKED */}
                                {isMakeup && (
                                  <option value="MAKEUP" disabled>
                                    Học bù
                                  </option>
                                )}
                                {isNotMarked && (
                                  <option value="NOT_MARKED" disabled>
                                    Chưa điểm danh
                                  </option>
                                )}
                                {/* Show all selectable options */}
                                {DROPDOWN_STATUS_OPTIONS.map((option) => {
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
                            <div className="flex-1">
                              <input
                                type="text"
                                value={note}
                                onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                placeholder="Ghi chú..."
                                className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
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

