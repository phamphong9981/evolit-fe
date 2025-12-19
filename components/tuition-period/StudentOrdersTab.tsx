'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2, User, X, Clock } from 'lucide-react';
import { useAllOrderItems } from '@/hooks/order';
import type { OrderItem } from '@/types/order';

interface StudentOrdersTabProps {
    formatCurrency: (value: number) => string;
    onItemPaymentClick?: (orderId: number, orderItemId: number) => void;
}

interface OrderItemsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: OrderItem[];
    studentName: string;
    studentCode: string;
    className: string;
    formatCurrency: (value: number) => string;
    onItemPaymentClick?: (orderId: number, orderItemId: number) => void;
}

function OrderItemsDetailModal({
    isOpen,
    onClose,
    items,
    studentName,
    studentCode,
    className,
    formatCurrency,
    onItemPaymentClick,
}: OrderItemsDetailModalProps) {
    if (!isOpen) return null;

    const getOrderItemTypeLabel = (type: OrderItem['type']) => {
        const labels = {
            TUITION: 'Học phí',
            MATERIAL: 'Tài liệu',
            ADJUSTMENT: 'Điều chỉnh',
        };
        return labels[type];
    };

    const getOrderItemTypeColor = (type: OrderItem['type']) => {
        const colors = {
            TUITION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            MATERIAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            ADJUSTMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        };
        return colors[type];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                            Chi tiết OrderItems
                        </h2>
                        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {studentName} ({studentCode}) - {className}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {items.map((item) => {
                            const totalLineAmount = item.totalLineAmount ?? item.amount;
                            const paidAmount = item.paidAmount ?? 0;
                            const remainingDebt = item.remainingAmount ?? (totalLineAmount - paidAmount);

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderItemTypeColor(item.type)}`}
                                                >
                                                    {getOrderItemTypeLabel(item.type)}
                                                </span>
                                                {remainingDebt > 0 && (
                                                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                        Còn nợ
                                                    </span>
                                                )}
                                                {remainingDebt <= 0 && paidAmount > 0 && (
                                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                        Đã trả đủ
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                {item.tuitionPeriod && (
                                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{item.tuitionPeriod.name}</span>
                                                    </div>
                                                )}
                                                {item.note && (
                                                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                        {item.note}
                                                    </div>
                                                )}
                                                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                    Hóa đơn: #{item.orderId}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <div
                                                className={`text-lg font-bold ${item.amount < 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-zinc-900 dark:text-zinc-50'
                                                    }`}
                                            >
                                                {formatCurrency(totalLineAmount)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 gap-2 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-700 sm:grid-cols-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">Đã thanh toán:</span>
                                            <span className={paidAmount > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                                                {formatCurrency(paidAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">Còn nợ:</span>
                                            <span
                                                className={`font-semibold ${remainingDebt > 0
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-green-600 dark:text-green-400'
                                                    }`}
                                            >
                                                {formatCurrency(remainingDebt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">Tiến độ:</span>
                                            <span>
                                                {totalLineAmount > 0
                                                    ? `${Math.round((paidAmount / totalLineAmount) * 100)}%`
                                                    : '0%'}
                                            </span>
                                        </div>
                                        {remainingDebt > 0 && onItemPaymentClick && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemPaymentClick(item.orderId, item.id);
                                                        onClose();
                                                    }}
                                                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                                                >
                                                    Thanh toán
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StudentOrdersTab({ formatCurrency, onItemPaymentClick }: StudentOrdersTabProps) {
    const [studentCodeFilter, setStudentCodeFilter] = useState<string>('');
    const [studentCodeFilterValue, setStudentCodeFilterValue] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

    // Fetch all order items
    const { data: orderItems = [], isLoading } = useAllOrderItems(true);

    // Debounce student code filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setStudentCodeFilter(studentCodeFilterValue.trim());
        }, 300); // 300ms debounce delay

        return () => clearTimeout(timer);
    }, [studentCodeFilterValue]);

    // Get unique student codes and classes for filters
    const uniqueStudentCodes = useMemo(() => {
        const codes = new Set<string>();
        orderItems.forEach(item => {
            if (item.student?.code) {
                codes.add(item.student.code);
            }
        });
        return Array.from(codes).sort();
    }, [orderItems]);

    const uniqueClasses = useMemo(() => {
        const classes = new Map<number, { id: number; name: string }>();
        orderItems.forEach(item => {
            if (item.classId && item.class) {
                classes.set(item.classId, { id: item.classId, name: item.class.name });
            }
        });
        return Array.from(classes.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [orderItems]);

    // Filter order items
    const filteredOrderItems = useMemo(() => {
        return orderItems.filter(item => {
            if (studentCodeFilter) {
                const itemCode = item.student?.code || '';
                if (!itemCode.toLowerCase().includes(studentCodeFilter.toLowerCase())) {
                    return false;
                }
            }
            if (selectedClassId !== null && item.classId !== selectedClassId) {
                return false;
            }
            return true;
        });
    }, [orderItems, studentCodeFilter, selectedClassId]);

    // Group items by student.code and class.id
    const itemsByStudentAndClass = useMemo(() => {
        return filteredOrderItems.reduce((acc, item) => {
            const studentCode = item.student?.code || `student_${item.studentId}`;
            const classId = item.classId || 'no_class';
            const key = `${studentCode}_${classId}`;

            if (!acc[key]) {
                acc[key] = {
                    student: item.student,
                    class: item.class,
                    items: [],
                };
            }
            acc[key].items.push(item);
            return acc;
        }, {} as Record<string, { student?: OrderItem['student']; class?: OrderItem['class']; items: OrderItem[] }>);
    }, [filteredOrderItems]);

    // Calculate totals for each row
    const tableRows = useMemo(() => {
        return Object.entries(itemsByStudentAndClass).map(([key, data]) => {
            const { student, class: classData, items } = data;
            const totalAmount = items.reduce((sum: number, item: OrderItem) => sum + (item.totalLineAmount ?? item.amount), 0);
            const totalPaid = items.reduce((sum: number, item: OrderItem) => sum + (item.paidAmount ?? 0), 0);
            const totalRemaining = totalAmount - totalPaid;

            return {
                key,
                studentName: student?.fullName || `Học sinh #${items[0].studentId}`,
                studentCode: student?.code || '-',
                className: classData?.name || '-',
                totalAmount,
                totalPaid,
                totalRemaining,
                items,
            };
        });
    }, [itemsByStudentAndClass]);

    const selectedRowData = useMemo(() => {
        if (!selectedRowKey) return null;
        return itemsByStudentAndClass[selectedRowKey];
    }, [selectedRowKey, itemsByStudentAndClass]);

    return (
        <div>
            {/* Filters */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Lọc theo mã học sinh
                    </label>
                    <input
                        type="text"
                        value={studentCodeFilterValue}
                        onChange={(e) => setStudentCodeFilterValue(e.target.value)}
                        placeholder="Nhập mã học sinh để lọc..."
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Lọc theo lớp
                    </label>
                    <select
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                    >
                        <option value="">Tất cả lớp</option>
                        {uniqueClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : tableRows.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                    <User className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                    <p>Không tìm thấy kết quả</p>
                </div>
            ) : (
                <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <div className="relative max-h-[600px] overflow-y-auto">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Tên học sinh
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Mã học sinh
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Tên lớp
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Tổng tiền
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Đã đóng
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                            Còn nợ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {tableRows.map((row) => (
                                        <tr
                                            key={row.key}
                                            onClick={() => setSelectedRowKey(row.key)}
                                            className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                                {row.studentName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                {row.studentCode}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                {row.className}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                {formatCurrency(row.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                                {formatCurrency(row.totalPaid)}
                                            </td>
                                            <td className={`px-4 py-3 text-right text-sm font-semibold ${row.totalRemaining > 0
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                {formatCurrency(row.totalRemaining)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tableRows.length > 0 && (
                            <div className="border-t border-zinc-200 dark:border-zinc-800">
                                <table className="w-full border-collapse">
                                    <tfoot className="bg-zinc-50 dark:bg-zinc-900/50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                                Tổng cộng:
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                                {formatCurrency(tableRows.reduce((sum, row) => sum + row.totalAmount, 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(tableRows.reduce((sum, row) => sum + row.totalPaid, 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {formatCurrency(tableRows.reduce((sum, row) => sum + row.totalRemaining, 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* OrderItems Detail Modal */}
            {selectedRowData && (
                <OrderItemsDetailModal
                    isOpen={!!selectedRowKey}
                    onClose={() => setSelectedRowKey(null)}
                    items={selectedRowData.items}
                    studentName={selectedRowData.student?.fullName || 'Học sinh'}
                    studentCode={selectedRowData.student?.code || '-'}
                    className={selectedRowData.class?.name || '-'}
                    formatCurrency={formatCurrency}
                    onItemPaymentClick={onItemPaymentClick}
                />
            )}
        </div>
    );
}

