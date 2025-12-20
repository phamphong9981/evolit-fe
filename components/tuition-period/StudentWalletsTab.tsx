'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertCircle, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useStudentWallets, useDeleteWallet } from '@/hooks/statistics';
import type { StudentWallet } from '@/types/statistics';

interface StudentWalletsTabProps {
    formatCurrency: (value: number) => string;
}

export function StudentWalletsTab({ formatCurrency }: StudentWalletsTabProps) {
    const { data: wallets = [], isLoading, error } = useStudentWallets();
    const deleteWalletMutation = useDeleteWallet();

    const [balanceFilter, setBalanceFilter] = useState<'all' | 'positive' | 'negative' | 'zero'>('all');

    // Filter và tính toán stats
    const filteredWallets = useMemo(() => {
        switch (balanceFilter) {
            case 'positive':
                return wallets.filter((w) => w.balance > 0);
            case 'negative':
                return wallets.filter((w) => w.balance < 0);
            case 'zero':
                return wallets.filter((w) => w.balance === 0);
            default:
                return wallets;
        }
    }, [wallets, balanceFilter]);

    const stats = useMemo(() => {
        const totalPositive = wallets.filter((w) => w.balance > 0).reduce((sum, w) => sum + w.balance, 0);
        const totalNegative = Math.abs(wallets.filter((w) => w.balance < 0).reduce((sum, w) => sum + w.balance, 0));
        const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
        const studentsWithDebt = wallets.filter((w) => w.balance < 0).length;
        const studentsWithCredit = wallets.filter((w) => w.balance > 0).length;

        return {
            totalPositive,
            totalNegative,
            totalBalance,
            studentsWithDebt,
            studentsWithCredit,
            totalStudents: wallets.length,
        };
    }, [wallets]);

    const handleDeleteWallet = async (walletId: number, studentName: string) => {
        if (
            !confirm(
                `Bạn có chắc chắn muốn xóa ví của học sinh "${studentName}"?\n\n` +
                'Hành động này sẽ reset số dư về 0 và không thể hoàn tác.'
            )
        ) {
            return;
        }

        try {
            await deleteWalletMutation.mutateAsync(walletId);
        } catch (error) {
            console.error('Delete wallet failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="font-medium text-red-900 dark:text-red-200">Lỗi</p>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                            {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Tổng số dư</p>
                            <p className={`mt-1 text-2xl font-bold ${stats.totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(stats.totalBalance)}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-zinc-400" />
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Học sinh có nợ</p>
                            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                                {stats.studentsWithDebt}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatCurrency(stats.totalNegative)} tổng nợ
                            </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-400" />
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Học sinh có thừa</p>
                            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.studentsWithCredit}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatCurrency(stats.totalPositive)} tổng thừa
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lọc theo số dư:</span>
                <select
                    value={balanceFilter}
                    onChange={(e) => setBalanceFilter(e.target.value as typeof balanceFilter)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                    <option value="all">Tất cả ({stats.totalStudents})</option>
                    <option value="positive">Có thừa ({stats.studentsWithCredit})</option>
                    <option value="negative">Có nợ ({stats.studentsWithDebt})</option>
                    <option value="zero">Bằng 0 ({stats.totalStudents - stats.studentsWithCredit - stats.studentsWithDebt})</option>
                </select>
            </div>

            {/* Wallets Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Học sinh
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Số dư
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Cập nhật
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {filteredWallets.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            filteredWallets.map((wallet: StudentWallet) => (
                                <tr
                                    key={wallet.id}
                                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                                {wallet.student?.fullName || `Học sinh #${wallet.studentId}`}
                                            </p>
                                            {wallet.student?.phone && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {wallet.student.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`font-semibold ${
                                                wallet.balance > 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : wallet.balance < 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            {formatCurrency(wallet.balance)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        {wallet.updatedAt
                                            ? new Date(wallet.updatedAt).toLocaleDateString('vi-VN')
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() =>
                                                handleDeleteWallet(wallet.id, wallet.student?.fullName || `#${wallet.studentId}`)
                                            }
                                            disabled={deleteWalletMutation.isPending}
                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            title="Xóa ví (Hoàn phí)"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

