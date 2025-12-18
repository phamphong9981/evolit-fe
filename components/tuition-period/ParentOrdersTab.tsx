'use client';

import { Loader2 } from 'lucide-react';
import { OrderCard } from './OrderCard';
import type { Order } from '@/types/order';

interface ParentOrdersTabProps {
    orders: Order[];
    isLoading: boolean;
    orderStatusFilter: 'all' | 'pending' | 'partial' | 'paid';
    onFilterChange: (filter: 'all' | 'pending' | 'partial' | 'paid') => void;
    expandedOrders: Set<number>;
    onToggleOrder: (orderId: number) => void;
    onPaymentClick: (order: Order) => void;
    onItemPaymentClick?: (orderId: number, orderItemId: number) => void;
    formatCurrency: (value: number) => string;
    getOrderStatusBadge: (status: Order['status']) => React.ReactElement;
}

export function ParentOrdersTab({
    orders,
    isLoading,
    orderStatusFilter,
    onFilterChange,
    expandedOrders,
    onToggleOrder,
    onPaymentClick,
    onItemPaymentClick,
    formatCurrency,
    getOrderStatusBadge,
}: ParentOrdersTabProps) {
    const filteredOrders = orderStatusFilter === 'all'
        ? orders
        : orders.filter((o) => o.status === orderStatusFilter);

    return (
        <>
            {/* Filter & Action Bar */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    {(['all', 'pending', 'partial', 'paid'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => onFilterChange(status)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${orderStatusFilter === status
                                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {status === 'all'
                                ? 'Tất cả'
                                : status === 'pending'
                                    ? 'Chưa đóng'
                                    : status === 'partial'
                                        ? 'Đóng thiếu'
                                        : 'Đã đóng'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                    Chưa có hóa đơn nào
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedOrders.has(order.id);
                        return (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isExpanded={isExpanded}
                                onToggle={() => onToggleOrder(order.id)}
                                onPaymentClick={() => onPaymentClick(order)}
                                onItemPaymentClick={onItemPaymentClick}
                                formatCurrency={formatCurrency}
                                getOrderStatusBadge={getOrderStatusBadge}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

