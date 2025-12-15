'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types/student';
import { StudentForm } from '@/components/StudentForm';
import {
    useStudents,
    useSearchStudents,
    useCreateStudent,
    useUpdateStudent,
    useDeleteStudent,
} from '@/hooks/student';

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Fetch all students
    const { data: students = [], isLoading } = useStudents();

    // Search students by name
    const { data: searchResults = [] } = useSearchStudents(searchQuery);

    // Filter students based on search
    const displayedStudents = useMemo(() => {
        if (searchQuery.trim()) {
            return searchResults;
        }
        return students;
    }, [students, searchResults, searchQuery]);

    // Mutations
    const createMutation = useCreateStudent();
    const updateMutation = useUpdateStudent();
    const deleteMutation = useDeleteStudent();

    const handleCreate = () => {
        setSelectedStudent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFormSubmit = async (data: CreateStudentDto | UpdateStudentDto) => {
        if (selectedStudent) {
            await updateMutation.mutateAsync({ id: selectedStudent.id, data });
            setIsFormOpen(false);
            setSelectedStudent(null);
        } else {
            await createMutation.mutateAsync(data as CreateStudentDto);
            setIsFormOpen(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Quản lý học sinh
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Quản lý thông tin học sinh trong hệ thống
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    <Plus className="h-4 w-4" />
                    Thêm học sinh
                </button>
            </div>

            {/* Search Box */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    </div>
                ) : displayedStudents.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
                        <div className="mb-4 text-6xl">👨‍🎓</div>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            {searchQuery ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào'}
                        </p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Trường
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {displayedStudents.map((student) => (
                                    <tr
                                        key={student.id}
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
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {student.currentSchool || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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

            {/* Student Form Modal */}
            <StudentForm
                student={selectedStudent}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedStudent(null);
                }}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
