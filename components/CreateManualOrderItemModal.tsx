'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Loader2, AlertCircle, Search, User, BookOpen, Calculator, ListFilter } from 'lucide-react';
import { useStudents } from '@/hooks/student';
import { useActiveClasses } from '@/hooks/class';
import { useCreateOrderItem } from '@/hooks/order';
import type { Student } from '@/types/student';
import type { Class } from '@/types/class';

interface CreateManualOrderItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    periodId: number;
    periodName: string;
    onSuccess?: () => void;
}

const ITEM_TYPE_OPTIONS: Array<{ value: 'TUITION' | 'MATERIAL' | 'ADJUSTMENT'; label: string }> = [
    { value: 'TUITION', label: 'Học phí' },
    { value: 'MATERIAL', label: 'Tài liệu' },
    { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
];

export function CreateManualOrderItemModal({
    isOpen,
    onClose,
    periodId,
    periodName,
    onSuccess,
}: CreateManualOrderItemModalProps) {
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [vatRate, setVatRate] = useState(10);
    const [itemType, setItemType] = useState<'TUITION' | 'MATERIAL' | 'ADJUSTMENT'>('TUITION');
    const [note, setNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: students = [], isLoading: isLoadingStudents } = useStudents();
    const { data: classes = [], isLoading: isLoadingClasses } = useActiveClasses();
    const createOrderItemMutation = useCreateOrderItem();

    // Filter students by search
    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return [];
        const searchLower = studentSearch.toLowerCase();
        return students.filter(
            (s) =>
                s.fullName.toLowerCase().includes(searchLower) ||
                s.code.toLowerCase().includes(searchLower) ||
                s.parentPhone?.toLowerCase().includes(searchLower)
        );
    }, [students, studentSearch]);

    // Filter classes by selected student (if student has enrollments)
    const availableClasses = useMemo(() => {
        if (!selectedStudent) return classes;
        // If student has enrollments, filter by enrolled classes
        if (selectedStudent.enrollments && selectedStudent.enrollments.length > 0) {
            const enrolledClassIds = selectedStudent.enrollments.map((e) => e.classId);
            return classes.filter((c) => enrolledClassIds.includes(c.id));
        }
        return classes;
    }, [classes, selectedStudent]);

    // Auto-fill amount when selecting class (optional)
    useEffect(() => {
        if (selectedClass) {
            setAmount(selectedClass.baseTuitionFee || 0);
        }
    }, [selectedClass]);

    // Calculate fees
    const calculation = useMemo(() => {
        const baseAmount = amount || 0;
        const vatAmount = (baseAmount * vatRate) / 100;
        const totalAmount = baseAmount + vatAmount;

        return {
            baseAmount,
            vatAmount,
            totalAmount,
        };
    }, [amount, vatRate]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const handleSubmit = async () => {
        setError(null);

        if (!selectedStudent) {
            setError('Vui lòng chọn học sinh');
            return;
        }

        if (!selectedClass) {
            setError('Vui lòng chọn lớp');
            return;
        }

        if (!amount || amount <= 0) {
            setError('Vui lòng nhập số tiền > 0');
            return;
        }

        try {
            await createOrderItemMutation.mutateAsync({
                studentId: selectedStudent.id,
                classId: selectedClass?.id,
                tuitionPeriodId: periodId,
                amount: calculation.baseAmount,
                vatRate: vatRate,
                vatAmount: calculation.vatAmount,
                totalLineAmount: calculation.totalAmount,
                type: itemType,
                note: note || `Học phí ${selectedClass?.name ?? ''} - ${periodName}`,
            });

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo hóa đơn');
        }
    };

    const handleClose = () => {
        setStudentSearch('');
        setSelectedStudent(null);
        setSelectedClass(null);
        setAmount(0);
        setVatRate(10);
        setItemType('TUITION');
        setNote('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 shrink-0">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        Tạo Order Item
                    </h2>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div>{error}</div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Period Info */}
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Kỳ học phí: <span className="font-medium text-zinc-900 dark:text-zinc-50">{periodName}</span>
                            </p>
                        </div>

                        {/* Student Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Chọn học sinh <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => {
                                        setStudentSearch(e.target.value);
                                        setSelectedStudent(null);
                                    }}
                                    placeholder="Tìm kiếm theo tên, mã học sinh hoặc SĐT phụ huynh..."
                                    className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                                />
                            </div>

                            {/* Student Search Results */}
                            {studentSearch && !selectedStudent && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                                    {isLoadingStudents ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                        </div>
                                    ) : filteredStudents.length === 0 ? (
                                        <div className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                                            Không tìm thấy học sinh
                                        </div>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setStudentSearch(`${student.fullName} (${student.code})`);
                                                }}
                                                className="w-full border-b border-zinc-200 px-4 py-3 text-left hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-zinc-500" />
                                                    <div>
                                                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                                            {student.fullName}
                                                        </div>
                                                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                                            {student.code} {student.parentPhone && `• ${student.parentPhone}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Selected Student */}
                            {selectedStudent && (
                                <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                                    {selectedStudent.fullName}
                                                </div>
                                                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                                    {selectedStudent.code} • {selectedStudent.parentName} ({selectedStudent.parentPhone})
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(null);
                                                setStudentSearch('');
                                                setSelectedClass(null);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Class Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Chọn lớp <span className="text-red-500">*</span>
                            </label>
                            {isLoadingClasses ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                </div>
                            ) : (
                                <select
                                    value={selectedClass?.id || ''}
                                    onChange={(e) => {
                                        const classId = Number(e.target.value);
                                        const class_ = classes.find((c) => c.id === classId);
                                        setSelectedClass(class_ || null);
                                    }}
                                    required
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-400"
                                >
                                    <option value="">-- Chọn lớp --</option>
                                    {availableClasses.map((class_) => (
                                        <option key={class_.id} value={class_.id}>
                                            {class_.name} {class_.subject?.name && `(${class_.subject.name})`} - {formatCurrency(class_.baseTuitionFee)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Item Type */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Loại item <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                                <ListFilter className="h-4 w-4 text-zinc-500" />
                                <select
                                    value={itemType}
                                    onChange={(e) => setItemType(e.target.value as typeof itemType)}
                                    className="w-full bg-transparent text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
                                >
                                    {ITEM_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Số tiền (chưa VAT) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                min="0"
                                step="1000"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        {/* VAT Rate */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Tỷ lệ VAT (%)
                            </label>
                            <input
                                type="number"
                                value={vatRate}
                                onChange={(e) => setVatRate(Number(e.target.value))}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>

                        {/* Calculation Summary */}
                        {selectedClass && (
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-3 flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        Tính toán
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Số tiền:</span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            {formatCurrency(calculation.baseAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">VAT ({vatRate}%):</span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            {formatCurrency(calculation.vatAmount)}
                                        </span>
                                    </div>
                                    <div className="border-t border-zinc-200 pt-2 dark:border-zinc-700">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">Tổng cộng:</span>
                                            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                                {formatCurrency(calculation.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Ghi chú
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                placeholder="Ghi chú cho hóa đơn..."
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800 shrink-0">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={createOrderItemMutation.isPending || !selectedStudent || !selectedClass || !amount || amount <= 0}
                            className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {createOrderItemMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo Order Item'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

