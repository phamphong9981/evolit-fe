'use client';

import { useState } from 'react';
import { Plus, Users, UserSearch, BookOpen } from 'lucide-react';
import { ParentOrdersTab } from './ParentOrdersTab';
import { StudentOrdersTab } from './StudentOrdersTab';
import type { Order } from '@/types/order';

type OrdersViewMode = 'by-parent' | 'by-student';

interface OrdersTabProps {
    orders: Order[];
    isLoading: boolean;
    orderStatusFilter: 'all' | 'pending' | 'partial' | 'paid';
    onFilterChange: (filter: 'all' | 'pending' | 'partial' | 'paid') => void;
    onCreateManualOrder: () => void;
    expandedOrders: Set<number>;
    onToggleOrder: (orderId: number) => void;
    onPaymentClick: (order: Order) => void;
    onItemPaymentClick?: (orderId: number, orderItemId: number) => void;
    formatCurrency: (value: number) => string;
    getOrderStatusBadge: (status: Order['status']) => React.ReactElement;
}

export function OrdersTab({
    orders,
    isLoading,
    orderStatusFilter,
    onFilterChange,
    onCreateManualOrder,
    expandedOrders,
    onToggleOrder,
    onPaymentClick,
    onItemPaymentClick,
    formatCurrency,
    getOrderStatusBadge,
}: OrdersTabProps) {
    const [viewMode, setViewMode] = useState<OrdersViewMode>('by-parent');

    return (
        <div>
            {/* View Mode Tabs */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('by-parent')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'by-parent'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Quản lý theo phụ huynh
                    </button>
                    <button
                        onClick={() => setViewMode('by-student')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'by-student'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <UserSearch className="h-4 w-4" />
                        Quản lý theo học sinh
                    </button>
                </div>
                <button
                    onClick={onCreateManualOrder}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Tạo hóa đơn lẻ
                </button>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'by-parent' ? (
                <ParentOrdersTab
                    orders={orders}
                    isLoading={isLoading}
                    orderStatusFilter={orderStatusFilter}
                    onFilterChange={onFilterChange}
                    expandedOrders={expandedOrders}
                    onToggleOrder={onToggleOrder}
                    onPaymentClick={onPaymentClick}
                    onItemPaymentClick={onItemPaymentClick}
                    formatCurrency={formatCurrency}
                    getOrderStatusBadge={getOrderStatusBadge}
                />
            ) : (
                <StudentOrdersTab
                    formatCurrency={formatCurrency}
                    onItemPaymentClick={onItemPaymentClick}
                />
            )}
        </div>
    );
}

