'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Calendar as CalendarIcon, Search, UserPlus, UserMinus, List } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useEnrollmentsByDateRange, useEnrollmentEventsByDateRange } from '@/hooks/statistics';
import type { EnrollmentStatus } from '@/types/enrollment';
import type { Enrollment } from '@/types/enrollment';
import type { EnrollmentEvent } from '@/types/statistics';

type ViewMode = 'enrollments' | 'events';

interface EnrollmentsTabProps {
    formatCurrency: (value: number) => string;
}

const getEnrollmentStatusLabel = (status: EnrollmentStatus): string => {
    const labels: Record<EnrollmentStatus, string> = {
        active: 'Đang học',
        reserved: 'Bảo lưu',
        dropped: 'Nghỉ học',
        mixed: 'Học một nửa',
    };
    return labels[status] || status;
};

const getEnrollmentStatusBadge = (status: EnrollmentStatus): string => {
    const badges: Record<EnrollmentStatus, string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        dropped: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        mixed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };
    return badges[status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';
};

export function EnrollmentsTab({ formatCurrency }: EnrollmentsTabProps) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [viewMode, setViewMode] = useState<ViewMode>('enrollments');
    const [startDate, setStartDate] = useState<Date | undefined>(firstDayOfMonth);
    const [endDate, setEndDate] = useState<Date | undefined>(lastDayOfMonth);
    const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const startCalendarRef = useRef<HTMLDivElement>(null);
    const endCalendarRef = useRef<HTMLDivElement>(null);
    const startInputRef = useRef<HTMLDivElement>(null);
    const endInputRef = useRef<HTMLDivElement>(null);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                startCalendarRef.current &&
                !startCalendarRef.current.contains(event.target as Node) &&
                startInputRef.current &&
                !startInputRef.current.contains(event.target as Node)
            ) {
                setShowStartCalendar(false);
            }
            if (
                endCalendarRef.current &&
                !endCalendarRef.current.contains(event.target as Node) &&
                endInputRef.current &&
                !endInputRef.current.contains(event.target as Node)
            ) {
                setShowEndCalendar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Convert Date to string format for API
    const startDateString = startDate?.toISOString().split('T')[0] || firstDayOfMonth.toISOString().split('T')[0];
    const endDateString = endDate?.toISOString().split('T')[0] || lastDayOfMonth.toISOString().split('T')[0];

    const enrollmentsParams = {
        startDate: startDateString,
        endDate: endDateString,
        status: statusFilter !== 'all' ? statusFilter : undefined,
    };

    const eventsParams = {
        startDate: startDateString,
        endDate: endDateString,
    };

    const { data: enrollments = [], isLoading: isLoadingEnrollments, error: enrollmentsError } = useEnrollmentsByDateRange(
        enrollmentsParams,
        viewMode === 'enrollments'
    );

    const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useEnrollmentEventsByDateRange(
        eventsParams,
        viewMode === 'events'
    );

    const isLoading = viewMode === 'enrollments' ? isLoadingEnrollments : isLoadingEvents;
    const error = viewMode === 'enrollments' ? enrollmentsError : eventsError;

    // Group events by type for summary
    const eventsSummary = useMemo(() => {
        const registerCount = events.filter((e) => e.eventType === 'register').length;
        const unregisterCount = events.filter((e) => e.eventType === 'unregister').length;
        return { registerCount, unregisterCount, total: events.length };
    }, [events]);

    const handleSearch = () => {
        // Query will automatically refetch when params change
    };

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
            {/* View Mode Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setViewMode('enrollments')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'enrollments'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                >
                    <List className="h-4 w-4" />
                    Danh sách đăng ký
                </button>
                <button
                    onClick={() => setViewMode('events')}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'events'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                >
                    <CalendarIcon className="h-4 w-4" />
                    Sự kiện đăng ký/xin nghỉ
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className={`grid grid-cols-1 gap-4 ${viewMode === 'enrollments' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                    <div className="relative">
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Từ ngày
                        </label>
                        <div
                            ref={startInputRef}
                            onClick={() => {
                                setShowStartCalendar(!showStartCalendar);
                                setShowEndCalendar(false);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm hover:border-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                        >
                            <CalendarIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                            <span className="flex-1 text-zinc-900 dark:text-zinc-50">
                                {startDate ? startDate.toLocaleDateString('vi-VN') : 'Chọn ngày'}
                            </span>
                        </div>
                        {showStartCalendar && (
                            <div
                                ref={startCalendarRef}
                                className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setShowStartCalendar(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Đến ngày
                        </label>
                        <div
                            ref={endInputRef}
                            onClick={() => {
                                setShowEndCalendar(!showEndCalendar);
                                setShowStartCalendar(false);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm hover:border-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                        >
                            <CalendarIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                            <span className="flex-1 text-zinc-900 dark:text-zinc-50">
                                {endDate ? endDate.toLocaleDateString('vi-VN') : 'Chọn ngày'}
                            </span>
                        </div>
                        {showEndCalendar && (
                            <div
                                ref={endCalendarRef}
                                className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setShowEndCalendar(false);
                                    }}
                                    disabled={(date) => startDate ? date < startDate : false}
                                />
                            </div>
                        )}
                    </div>
                    {viewMode === 'enrollments' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Trạng thái
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as EnrollmentStatus | 'all')}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang học</option>
                                <option value="reserved">Bảo lưu</option>
                                <option value="dropped">Nghỉ học</option>
                                <option value="mixed">Học một nửa</option>
                            </select>
                        </div>
                    )}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || !startDate || !endDate}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                        >
                            <Search className="h-4 w-4" />
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                {viewMode === 'enrollments' ? (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-zinc-400" />
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Tìm thấy <span className="font-semibold text-zinc-900 dark:text-zinc-50">{enrollments.length}</span> đăng ký
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-green-500" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-green-600 dark:text-green-400">{eventsSummary.registerCount}</span> đăng ký
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserMinus className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-red-600 dark:text-red-400">{eventsSummary.unregisterCount}</span> xin nghỉ
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-zinc-400" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Tổng <span className="font-semibold text-zinc-900 dark:text-zinc-50">{eventsSummary.total}</span> sự kiện
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Table Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : viewMode === 'enrollments' ? (
                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Học sinh
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Lớp học
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Ngày bắt đầu
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Ngày kết thúc
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Học phí cơ bản
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((enrollment: Enrollment) => (
                                    <tr
                                        key={enrollment.id}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                                    {enrollment.student?.fullName || `Học sinh #${enrollment.studentId}`}
                                                </p>
                                                {enrollment.student?.parentPhone && (
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        {enrollment.student.parentPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                                {enrollment.class?.name || `Lớp #${enrollment.classId}`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {new Date(enrollment.startDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {enrollment.endDate
                                                ? new Date(enrollment.endDate).toLocaleDateString('vi-VN')
                                                : 'Đang học'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getEnrollmentStatusBadge(enrollment.status)}`}
                                            >
                                                {getEnrollmentStatusLabel(enrollment.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                                            {enrollment.class?.baseTuitionFee
                                                ? formatCurrency(enrollment.class.baseTuitionFee)
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Loại sự kiện
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Ngày sự kiện
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Học sinh
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Lớp học
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Ngày bắt đầu
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Ngày kết thúc
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                events.map((event: EnrollmentEvent, index: number) => (
                                    <tr
                                        key={`${event.enrollment.id}-${event.eventType}-${index}`}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${event.eventType === 'register'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}
                                            >
                                                {event.eventType === 'register' ? (
                                                    <>
                                                        <UserPlus className="h-3.5 w-3.5" />
                                                        Đăng ký
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserMinus className="h-3.5 w-3.5" />
                                                        Xin nghỉ
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                            {new Date(event.eventDate).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                                    {event.enrollment.student?.fullName || `Học sinh #${event.enrollment.studentId}`}
                                                </p>
                                                {event.enrollment.student?.parentPhone && (
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        {event.enrollment.student.parentPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-zinc-900 dark:text-zinc-50">
                                                {event.enrollment.class?.name || `Lớp #${event.enrollment.classId}`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {new Date(event.enrollment.startDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {event.enrollment.endDate
                                                ? new Date(event.enrollment.endDate).toLocaleDateString('vi-VN')
                                                : 'Đang học'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getEnrollmentStatusBadge(event.enrollment.status)}`}
                                            >
                                                {getEnrollmentStatusLabel(event.enrollment.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

