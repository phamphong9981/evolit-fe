'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Eye, Lock } from 'lucide-react';
import { useReconcilePeriod } from '@/hooks/reconcile';
import type { ReconcileResult, StudentRefund } from '@/types/reconcile';

interface ReconciliationTabProps {
    periodId: number;
    periodStatus: 'CREATED' | 'ACTIVE' | 'CLOSED';
    formatCurrency: (value: number) => string;
}

export function ReconciliationTab({ periodId, periodStatus, formatCurrency }: ReconciliationTabProps) {
    const [reconcileResult, setReconcileResult] = useState<ReconcileResult | null>(null);
    const reconcileMutation = useReconcilePeriod();

    const isPeriodClosed = periodStatus === 'CLOSED';
    const isPeriodActive = periodStatus === 'ACTIVE';

    const handlePreview = async () => {
        try {
            const result = await reconcileMutation.mutateAsync({ periodId, mode: 'PREVIEW' });
            setReconcileResult(result);
        } catch (error) {
            console.error('Preview failed:', error);
        }
    };

    const handleExecute = async () => {
        if (
            !confirm(
                'Bạn có chắc chắn muốn chốt sổ kỳ này?\n' +
                'Sau khi chốt sổ, kỳ sẽ không thể chỉnh sửa và sẽ tự động hoàn tiền cho học sinh nghỉ có phép.\n\n' +
                'Hành động này không thể hoàn tác!'
            )
        ) {
            return;
        }

        try {
            const result = await reconcileMutation.mutateAsync({ periodId, mode: 'EXECUTE' });
            setReconcileResult(result);
        } catch (error) {
            console.error('Execute failed:', error);
        }
    };

    const isLoading = reconcileMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Chốt Sổ và Đối Soát Kỳ Học Phí
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Tính toán và hoàn tiền cho học sinh nghỉ có phép trong kỳ học phí
                </p>
            </div>

            {/* Status Warning */}
            {isPeriodClosed && (
                <div className="rounded-lg border border-zinc-200 bg-yellow-50 p-4 dark:border-zinc-800 dark:bg-yellow-900/20">
                    <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                            <p className="font-medium text-yellow-900 dark:text-yellow-200">
                                Kỳ học phí đã được chốt sổ
                            </p>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                Kỳ này đã được chốt sổ và không thể thay đổi hoặc chốt sổ lại.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!isPeriodActive && !isPeriodClosed && (
                <div className="rounded-lg border border-zinc-200 bg-blue-50 p-4 dark:border-zinc-800 dark:bg-blue-900/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="font-medium text-blue-900 dark:text-blue-200">
                                Kỳ học phí chưa được kích hoạt
                            </p>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                Vui lòng tạo hóa đơn để kích hoạt kỳ học phí trước khi chốt sổ.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {isPeriodActive && !isPeriodClosed && (
                <div className="flex gap-4">
                    <button
                        onClick={handlePreview}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-lg bg-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tính toán...
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                Xem Trước
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleExecute}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang chốt sổ...
                            </>
                        ) : (
                            <>
                                <Lock className="h-4 w-4" />
                                Thực Thi Chốt Sổ
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {reconcileMutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="font-medium text-red-900 dark:text-red-200">Lỗi</p>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                {reconcileMutation.error instanceof Error
                                    ? reconcileMutation.error.message
                                    : 'Có lỗi xảy ra khi thực hiện đối soát'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Section */}
            {reconcileResult && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Result Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {reconcileResult.executed
                                ? '✅ Đã chốt sổ thành công!'
                                : '📋 Kết quả xem trước'}
                        </h4>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${reconcileResult.executed
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}
                        >
                            {reconcileResult.executed ? 'Đã thực thi' : 'Xem trước'}
                        </span>
                    </div>

                    {/* Summary Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Tổng tiền hoàn lại</p>
                            <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(reconcileResult.totalRefundAmount)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Số buổi nghỉ</p>
                            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                {reconcileResult.attendanceCount}
                            </p>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Số học sinh</p>
                            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                {reconcileResult.studentRefunds.length}
                            </p>
                        </div>
                    </div>

                    {/* Student Refunds Table */}
                    {reconcileResult.studentRefunds.length > 0 ? (
                        <div>
                            <h5 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
                                Chi tiết hoàn tiền theo học sinh:
                            </h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-100 dark:bg-zinc-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                                                Học sinh
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">
                                                Số buổi nghỉ
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                                                Số tiền hoàn lại
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {reconcileResult.studentRefunds.map((refund: StudentRefund) => (
                                            <tr key={refund.studentId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                                                    {refund.studentName}
                                                </td>
                                                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                                                    {refund.attendanceCount}
                                                </td>
                                                <td className="px-4 py-2 text-right font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(refund.refundAmount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-50 font-bold dark:bg-zinc-800">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                                                Tổng cộng:
                                            </td>
                                            <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">
                                                {formatCurrency(reconcileResult.totalRefundAmount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
                            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Không có học sinh nào cần hoàn tiền
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Info Note */}
            {!reconcileResult && !isPeriodClosed && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        <strong>Lưu ý:</strong> Luôn sử dụng <strong>Xem Trước</strong> trước để kiểm tra kết quả
                        trước khi thực thi chốt sổ. Sau khi chốt sổ, kỳ học phí sẽ không thể chỉnh sửa và hệ thống sẽ
                        tự động hoàn tiền cho học sinh nghỉ có phép.
                    </p>
                </div>
            )}
        </div>
    );
}

