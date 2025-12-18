import React from 'react';
import { Clock, CheckCircle2, Lock } from 'lucide-react';
import type { TuitionPeriodStatus } from '@/types/tuition-period';
import type { Order } from '@/types/order';

/**
 * Format currency value to Vietnamese Dong
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
}

/**
 * Get status badge for tuition period
 */
export function getTuitionPeriodStatusBadge(status: TuitionPeriodStatus): React.ReactElement {
    const configs = {
        CREATED: {
            label: 'MỚI TẠO',
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            icon: Clock,
        },
        ACTIVE: {
            label: 'ĐANG THU',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            icon: CheckCircle2,
        },
        CLOSED: {
            label: 'ĐÃ CHỐT',
            color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
            icon: Lock,
        },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}

/**
 * Get status badge for order
 */
export function getOrderStatusBadge(status: Order['status']): React.ReactElement {
    const configs = {
        pending: {
            label: 'Chưa đóng',
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        },
        partial: {
            label: 'Đóng thiếu',
            color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        },
        paid: {
            label: 'Đã đóng',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        },
        cancelled: {
            label: 'Đã hủy',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        },
    };

    const config = configs[status];

    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
}

