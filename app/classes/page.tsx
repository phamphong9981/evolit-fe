'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Eye, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import type { Class, CreateClassDto, UpdateClassDto, ClassStatus, ClassType } from '@/types/class';
import { ClassForm } from '@/components/ClassForm';
import { AttendanceModal } from '@/components/AttendanceModal';
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from '@/hooks/class';
import { useSubmitAttendance } from '@/hooks/attendance';
import type { StudentAttendanceDto } from '@/types/attendance';

const STATUS_LABELS: Record<ClassStatus, string> = {
  active: 'Đang hoạt động',
  inactive: 'Tạm dừng',
  archived: 'Đã kết thúc',
};

const STATUS_COLORS: Record<ClassStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
};

const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  regular: 'Thường',
  vip: 'VIP',
  vip_1_1: 'VIP 1-1',
};

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<Class | null>(null);

  // Fetch all classes
  const { data: classes = [], isLoading } = useClasses();

  // Mutations
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();
  const submitAttendanceMutation = useSubmitAttendance();

  // Filter classes based on search and status
  const displayedClasses = useMemo(() => {
    let filtered = classes;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((cls) => cls.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(query) ||
          CLASS_TYPE_LABELS[cls.type]?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [classes, searchQuery, statusFilter]);

  const handleCreate = () => {
    setSelectedClass(null);
    setIsFormOpen(true);
  };

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = async (data: CreateClassDto | UpdateClassDto) => {
    if (selectedClass) {
      await updateMutation.mutateAsync({ id: selectedClass.id, data });
      setIsFormOpen(false);
      setSelectedClass(null);
    } else {
      await createMutation.mutateAsync(data as CreateClassDto);
      setIsFormOpen(false);
    }
  };

  const handleOpenAttendance = (classItem: Class) => {
    setSelectedClassForAttendance(classItem);
    setIsAttendanceModalOpen(true);
  };

  const handleSubmitAttendance = async (date: string, students: StudentAttendanceDto[]) => {
    if (!selectedClassForAttendance) return;
    await submitAttendanceMutation.mutateAsync({
      classId: selectedClassForAttendance.id,
      date,
      students,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatSchedule = (schedules?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) => {
    if (!schedules || schedules.length === 0) {
      return [];
    }

    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    // Format time (assume format is HH:mm:ss or HH:mm)
    const formatTime = (time: string) => {
      return time.substring(0, 5); // Get HH:mm from HH:mm:ss or HH:mm
    };

    return schedules.map((schedule) => {
      const dayName = dayNames[schedule.dayOfWeek] || `Thứ ${schedule.dayOfWeek + 1}`;
      return `${dayName} (${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)})`;
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-2 py-8 sm:px-3 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Quản lý lớp học
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Quản lý các lớp học trong hệ thống
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Thêm lớp học
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp hoặc loại lớp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === status
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
            >
              {status === 'all' ? 'Tất cả' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : displayedClasses.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">📚</div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Không tìm thấy lớp học nào'
                : 'Chưa có lớp học nào'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Tên lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Loại lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Học phí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Lịch học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Điểm danh
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {displayedClasses.map((classItem) => (
                  <tr
                    key={classItem.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {classItem.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {CLASS_TYPE_LABELS[classItem.type] || classItem.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(classItem.baseTuitionFee)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="max-w-xs">
                        {formatSchedule(classItem.schedules)?.map((schedule: string) => (
                          <div key={schedule}>
                            {schedule}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[classItem.status]}`}
                      >
                        {STATUS_LABELS[classItem.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenAttendance(classItem)}
                        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        title="Điểm danh"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Điểm danh
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/classes/${classItem.id}`}
                          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(classItem)}
                          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(classItem.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          title="Xóa"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Form Modal */}
      <ClassForm
        classData={selectedClass}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClass(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedClassForAttendance(null);
        }}
        onSubmit={handleSubmitAttendance}
        classId={selectedClassForAttendance?.id || 0}
        className={selectedClassForAttendance?.name}
      />
    </div>
  );
}

