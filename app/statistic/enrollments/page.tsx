'use client';

import { EnrollmentsTab } from '@/components/tuition-period/EnrollmentsTab';
import { formatCurrency } from '@/utils/tuition-period';

export default function EnrollmentsPage() {
    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    Thống kê đăng ký lớp
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Xem danh sách học sinh tham gia hoặc nghỉ học trong khoảng thời gian
                </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="p-6">
                    <EnrollmentsTab formatCurrency={formatCurrency} />
                </div>
            </div>
        </div>
    );
}

