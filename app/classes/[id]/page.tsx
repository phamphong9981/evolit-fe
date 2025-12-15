'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2, Edit } from 'lucide-react';
import { useClass } from '@/hooks/class';
import {
  useStudentsByClass,
  useCreateStudentClass,
  useBulkCreateStudentClasses,
  useDeleteStudentClassByStudentAndClass,
} from '@/hooks/student-class';
import { AddStudentsToClassModal } from '@/components/AddStudentsToClassModal';
import { ClassForm } from '@/components/ClassForm';
import { useUpdateClass } from '@/hooks/class';
import type { UpdateClassDto } from '@/types/class';

const STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động',
  inactive: 'Tạm dừng',
  archived: 'Đã kết thúc',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
};

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Fetch class data
  const { data: classData, isLoading: isLoadingClass } = useClass(classId);
  const { data: studentsInClass = [], isLoading: isLoadingStudents } = useStudentsByClass(classId);

  // Mutations
  const createMutation = useCreateStudentClass();
  const bulkCreateMutation = useBulkCreateStudentClasses();
  const deleteMutation = useDeleteStudentClassByStudentAndClass();
  const updateMutation = useUpdateClass();

  const handleAddStudent = async (studentIds: number[]) => {
    if (studentIds.length === 1) {
      await createMutation.mutateAsync({
        studentId: studentIds[0],
        classId,
      });
    } else {
      await bulkCreateMutation.mutateAsync({
        classId,
        studentIds,
      });
    }
  };

  const handleRemoveStudent = (studentId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?')) {
      deleteMutation.mutate({ studentId, classId });
    }
  };

  const handleEditClass = async (data: UpdateClassDto) => {
    await updateMutation.mutateAsync({ id: classId, data });
    setIsEditFormOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (isLoadingClass) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Không tìm thấy lớp học</p>
        <button
          onClick={() => router.push('/classes')}
          className="mt-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const existingStudentIds = studentsInClass.map((sc) => sc.studentId);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/classes')}
          className="mb-4 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-4">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {classData.name}
              </h1>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[classData.status]}`}
              >
                {STATUS_LABELS[classData.status]}
              </span>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {classData.subject?.name || 'Chưa có môn học'}
            </p>
          </div>
          <button
            onClick={() => setIsEditFormOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Học phí</div>
          <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(classData.baseTuitionFee)}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Số học sinh</div>
          <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {studentsInClass.length}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Môn học</div>
          <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {classData.subject?.name || '-'}
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Danh sách học sinh ({studentsInClass.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Thêm học sinh
            </button>
            <button
              onClick={() => setIsBulkAddModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Thêm nhiều
            </button>
          </div>
        </div>

        {isLoadingStudents ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : studentsInClass.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">👨‍🎓</div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Chưa có học sinh nào trong lớp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Mã code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Ngày sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Phụ huynh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    SĐT
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {studentsInClass.map((studentClass) => {
                  const student = studentClass.student;
                  if (!student) return null;

                  return (
                    <tr
                      key={studentClass.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {student.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                        {student.fullName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(student.dob)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {student.parentName || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {student.parentPhone || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          title="Xóa khỏi lớp"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStudentsToClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStudent}
        existingStudentIds={existingStudentIds}
        isBulk={false}
      />

      <AddStudentsToClassModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onAdd={handleAddStudent}
        existingStudentIds={existingStudentIds}
        isBulk={true}
      />

      <ClassForm
        classData={classData}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleEditClass}
      />
    </div>
  );
}

