'use client';

import { useState, useEffect } from 'react';
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types/student';
import { X } from 'lucide-react';

interface StudentFormProps {
    student?: Student | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStudentDto | UpdateStudentDto) => Promise<void>;
}

export function StudentForm({ student, isOpen, onClose, onSubmit }: StudentFormProps) {
    const [formData, setFormData] = useState<CreateStudentDto>({
        code: '',
        fullName: '',
        dob: '',
        parentName: '',
        parentPhone: '',
        currentSchool: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (student) {
            setFormData({
                code: student.code,
                fullName: student.fullName,
                dob: student.dob || '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                currentSchool: student.currentSchool || '',
            });
        } else {
            setFormData({
                code: '',
                fullName: '',
                dob: '',
                parentName: '',
                parentPhone: '',
                currentSchool: '',
            });
        }
        setError(null);
    }, [student, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Remove empty strings for optional fields
            if (student) {
                const submitData: UpdateStudentDto = {
                    fullName: formData.fullName,
                    ...(formData.dob && { dob: formData.dob }),
                    ...(formData.parentName && { parentName: formData.parentName }),
                    ...(formData.parentPhone && { parentPhone: formData.parentPhone }),
                    ...(formData.currentSchool && { currentSchool: formData.currentSchool }),
                };
                await onSubmit(submitData);
            } else {
                const submitData: CreateStudentDto = {
                    code: formData.code,
                    fullName: formData.fullName,
                    ...(formData.dob && { dob: formData.dob }),
                    ...(formData.parentName && { parentName: formData.parentName }),
                    ...(formData.parentPhone && { parentPhone: formData.parentPhone }),
                    ...(formData.currentSchool && { currentSchool: formData.currentSchool }),
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {student ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
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
                        {!student && (
                            <div>
                                <label htmlFor="code" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Mã học sinh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="STU000001"
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Nguyễn Văn An"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        <div>
                            <label htmlFor="dob" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                id="dob"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        <div>
                            <label htmlFor="parentName" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Tên phụ huynh
                            </label>
                            <input
                                type="text"
                                id="parentName"
                                value={formData.parentName}
                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                placeholder="Nguyễn Văn Bố"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        <div>
                            <label htmlFor="parentPhone" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Số điện thoại phụ huynh
                            </label>
                            <input
                                type="tel"
                                id="parentPhone"
                                value={formData.parentPhone}
                                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                placeholder="0912345678"
                                pattern="0[0-9]{9,10}"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        <div>
                            <label htmlFor="currentSchool" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Trường hiện tại
                            </label>
                            <input
                                type="text"
                                id="currentSchool"
                                value={formData.currentSchool}
                                onChange={(e) => setFormData({ ...formData, currentSchool: e.target.value })}
                                placeholder="THCS Nguyễn Du"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
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
                            {isSubmitting ? 'Đang lưu...' : student ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

