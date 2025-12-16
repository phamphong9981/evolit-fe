'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader2, Search, Eye, Clock, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import type { TuitionPeriod, CreateTuitionPeriodDto, UpdateTuitionPeriodDto, TuitionPeriodStatus } from '@/types/tuition-period';
import { TuitionPeriodForm } from '@/components/TuitionPeriodForm';
import {
    useTuitionPeriods,
    useCreateTuitionPeriod,
    useUpdateTuitionPeriod,
    useDeleteTuitionPeriod,
} from '@/hooks/tuition-period';

export default function TuitionPeriodsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<TuitionPeriodStatus | 'all'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<TuitionPeriod | null>(null);

    // Fetch all tuition periods
    const { data: periods = [], isLoading } = useTuitionPeriods();

    // Mutations
    const createMutation = useCreateTuitionPeriod();
    const updateMutation = useUpdateTuitionPeriod();
    const deleteMutation = useDeleteTuitionPeriod();

    // Get unique years
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(periods.map((p: TuitionPeriod) => p.year))) as number[];
        return uniqueYears.sort((a: number, b: number) => b - a);
    }, [periods]);

    // Filter periods
    const displayedPeriods = useMemo(() => {
        let filtered = periods;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((p: TuitionPeriod) => (p.status || 'CREATED') === statusFilter);
        }

        // Filter by year
        if (yearFilter) {
            filtered = filtered.filter((p: TuitionPeriod) => p.year === yearFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p: TuitionPeriod) =>
                    p.name.toLowerCase().includes(query) ||
                    `${p.month}/${p.year}`.includes(query)
            );
        }

        // Sort by year desc, then month desc
        return filtered.sort((a: TuitionPeriod, b: TuitionPeriod) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.month - a.month;
        });
    }, [periods, searchQuery, yearFilter, statusFilter]);

    const handleCreate = () => {
        setSelectedPeriod(null);
        setIsFormOpen(true);
    };

    const handleEdit = (period: TuitionPeriod) => {
        setSelectedPeriod(period);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kỳ học phí này?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFormSubmit = async (data: CreateTuitionPeriodDto | UpdateTuitionPeriodDto) => {
        if (selectedPeriod) {
            await updateMutation.mutateAsync({ id: selectedPeriod.id, data });
            setIsFormOpen(false);
            setSelectedPeriod(null);
        } else {
            await createMutation.mutateAsync(data as CreateTuitionPeriodDto);
            setIsFormOpen(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const getStatusBadge = (status: TuitionPeriodStatus | undefined) => {
        const actualStatus = status || 'CREATED';
        const configs = {
            CREATED: {
                label: 'Nháp',
                color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
                icon: Clock,
            },
            ACTIVE: {
                label: 'Đang thu',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                icon: CheckCircle2,
            },
            CLOSED: {
                label: 'Đã chốt',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                icon: Lock,
            },
        };

        const config = configs[actualStatus];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Quản lý Kỳ Học Phí
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Quản lý các kỳ học phí trong hệ thống
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    <Plus className="h-4 w-4" />
                    Tạo kỳ mới
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc tháng/năm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TuitionPeriodStatus | 'all')}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="CREATED">Nháp</option>
                            <option value="ACTIVE">Đang thu</option>
                            <option value="CLOSED">Đã chốt</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={yearFilter || ''}
                            onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
                        >
                            <option value="">Tất cả năm</option>
                            {years.map((year: number) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tuition Periods Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {isLoading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    </div>
                ) : displayedPeriods.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
                        <div className="mb-4 text-6xl">📅</div>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            {searchQuery || yearFilter ? 'Không tìm thấy kỳ học phí nào' : 'Chưa có kỳ học phí nào'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Tên kỳ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Tháng/Năm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Số ngày
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {displayedPeriods.map((period: TuitionPeriod) => (
                                    <tr
                                        key={period.id}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                            {period.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {period.month}/{period.year}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {calculateDays(period.startDate, period.endDate)} ngày
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(period.status)}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/finance/tuition-periods/${period.id}`}
                                                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                    title="Chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {(period.status === 'CREATED' || !period.status) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(period)}
                                                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(period.id)}
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                                            title="Xóa"
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            {deleteMutation.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tuition Period Form Modal */}
            <TuitionPeriodForm
                period={selectedPeriod}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedPeriod(null);
                }}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}

