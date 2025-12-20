'use client';

import { StudentWalletsTab } from '@/components/tuition-period/StudentWalletsTab';
import { formatCurrency } from '@/utils/tuition-period';

export default function StudentWalletsPage() {
    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                    Thống kê dư nợ học sinh
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Xem và quản lý số dư ví của học sinh
                </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="p-6">
                    <StudentWalletsTab formatCurrency={formatCurrency} />
                </div>
            </div>
        </div>
    );
}

