'use client';

import { Receipt, FileCheck, Clock } from 'lucide-react';
import { OrdersTab } from './OrdersTab';
import { ReconciliationTab } from './ReconciliationTab';
import type { Order } from '@/types/order';
import type { TuitionPeriodStatus } from '@/types/tuition-period';

type TabType = 'orders' | 'reconciliation' | 'audit';

interface TuitionPeriodTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    periodId: number;
    periodStatus: TuitionPeriodStatus;
    orders: Order[];
    isLoadingOrders: boolean;
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

export function TuitionPeriodTabs({
    activeTab,
    onTabChange,
    periodId,
    periodStatus,
    orders,
    isLoadingOrders,
    orderStatusFilter,
    onFilterChange,
    onCreateManualOrder,
    expandedOrders,
    onToggleOrder,
    onPaymentClick,
    onItemPaymentClick,
    formatCurrency,
    getOrderStatusBadge,
}: TuitionPeriodTabsProps) {
    return (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Tab Headers */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="flex gap-1 px-6">
                    <button
                        onClick={() => onTabChange('orders')}
                        className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'orders'
                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Danh sách Hóa đơn
                        </div>
                    </button>
                    <button
                        onClick={() => onTabChange('reconciliation')}
                        className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'reconciliation'
                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Bảng kê Đối soát
                        </div>
                    </button>
                    <button
                        onClick={() => onTabChange('audit')}
                        className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'audit'
                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Giao dịch & Log
                        </div>
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'orders' && (
                    <OrdersTab
                        orders={orders}
                        isLoading={isLoadingOrders}
                        orderStatusFilter={orderStatusFilter}
                        onFilterChange={onFilterChange}
                        onCreateManualOrder={onCreateManualOrder}
                        expandedOrders={expandedOrders}
                        onToggleOrder={onToggleOrder}
                        onPaymentClick={onPaymentClick}
                        onItemPaymentClick={onItemPaymentClick}
                        formatCurrency={formatCurrency}
                        getOrderStatusBadge={getOrderStatusBadge}
                    />
                )}

                {activeTab === 'reconciliation' && (
                    <ReconciliationTab
                        periodId={periodId}
                        periodStatus={periodStatus}
                        formatCurrency={formatCurrency}
                    />
                )}

                {activeTab === 'audit' && (
                    <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                        <Clock className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                        <p>Lịch sử giao dịch & log đang được phát triển</p>
                        <p className="mt-2 text-sm">
                            Hiển thị lịch sử ai đã bấm nút "Generate", ai bấm "Chốt sổ", vào giờ nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

