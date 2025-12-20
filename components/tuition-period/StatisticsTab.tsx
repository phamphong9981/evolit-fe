'use client';

import { useState } from 'react';
import { Wallet, Users } from 'lucide-react';
import { StudentWalletsTab } from './StudentWalletsTab';
import { EnrollmentsTab } from './EnrollmentsTab';

type StatisticsViewMode = 'wallets' | 'enrollments';

interface StatisticsTabProps {
    formatCurrency: (value: number) => string;
}

export function StatisticsTab({ formatCurrency }: StatisticsTabProps) {
    const [viewMode, setViewMode] = useState<StatisticsViewMode>('wallets');

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setViewMode('wallets')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                        viewMode === 'wallets'
                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                    }`}
                >
                    <Wallet className="h-4 w-4" />
                    Thống kê dư nợ học sinh
                </button>
                <button
                    onClick={() => setViewMode('enrollments')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                        viewMode === 'enrollments'
                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Thống kê đăng ký lớp
                </button>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'wallets' ? (
                <StudentWalletsTab formatCurrency={formatCurrency} />
            ) : (
                <EnrollmentsTab formatCurrency={formatCurrency} />
            )}
        </div>
    );
}

