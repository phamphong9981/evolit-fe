'use client';

import type { TuitionPeriod, TuitionPeriodStatus } from '@/types/tuition-period';
import { Clock, CheckCircle2, Lock } from 'lucide-react';

interface TuitionPeriodHeaderProps {
    period: TuitionPeriod;
    stats: {
        totalOrders: number;
        expectedRevenue: number;
        collectedAmount: number;
        collectionPercentage: number;
        expectedRefund: number;
        actualRefund: number;
        status: TuitionPeriodStatus;
    };
    formatCurrency: (value: number) => string;
    getStatusBadge: (status: TuitionPeriodStatus) => React.ReactElement;
}

export function TuitionPeriodHeader({
    period,
    stats,
    formatCurrency,
    getStatusBadge,
}: TuitionPeriodHeaderProps) {
    return (
        <div className="sticky top-0 z-10 mb-6 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Kỳ thu phí {period.name}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(period.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(period.endDate).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    {getStatusBadge(stats.status)}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Tổng hóa đơn</div>
                    <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {stats.totalOrders} đơn
                    </div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Doanh thu dự kiến</div>
                    <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(stats.expectedRevenue)}
                    </div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Đã thu</div>
                    <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(stats.collectedAmount)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        ({stats.collectionPercentage.toFixed(1)}%)
                    </div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Tiền hoàn</div>
                    <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(stats.actualRefund)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        Dự kiến: {formatCurrency(stats.expectedRefund)}
                    </div>
                </div>
            </div>
        </div>
    );
}

