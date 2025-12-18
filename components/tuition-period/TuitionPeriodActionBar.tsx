'use client';

import { Rocket, Lock, AlertCircle } from 'lucide-react';
import type { TuitionPeriodStatus } from '@/types/tuition-period';

interface TuitionPeriodActionBarProps {
    status: TuitionPeriodStatus;
    onGenerateBilling: () => void;
    onClosePeriod: () => void;
    isClosing: boolean;
}

export function TuitionPeriodActionBar({
    status,
    onGenerateBilling,
    onClosePeriod,
    isClosing,
}: TuitionPeriodActionBarProps) {
    if (status === 'CREATED') {
        return (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Tính toán công nợ</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Tạo hóa đơn tự động cho tất cả học sinh trong kỳ này
                        </p>
                    </div>
                    <button
                        onClick={onGenerateBilling}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                    >
                        <Rocket className="h-5 w-5" />
                        TÍNH TOÁN CÔNG NỢ
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'ACTIVE') {
        return (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Chốt sổ & Đối soát</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Xem lại điểm danh và chốt sổ kỳ học phí này
                        </p>
                    </div>
                    <button
                        onClick={onClosePeriod}
                        disabled={isClosing}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        <Lock className="h-5 w-5" />
                        {isClosing ? 'Đang xử lý...' : 'CHỐT SỔ & ĐỐI SOÁT'}
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'CLOSED') {
        return (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-zinc-400" />
                        <div>
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Kỳ đã chốt sổ</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Kỳ này đã chốt sổ. Chỉ được xem, không được sửa.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            // TODO: Implement re-open (Super Admin only)
                            alert('Chức năng mở lại kỳ chỉ dành cho Super Admin');
                        }}
                        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        Mở lại kỳ
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

