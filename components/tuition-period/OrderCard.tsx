'use client';

import { Loader2, ChevronDown, ChevronUp, User, BookOpen, Clock } from 'lucide-react';
import { useOrderItemsByOrder } from '@/hooks/order';
import type { Order, OrderItem } from '@/types/order';

interface OrderCardProps {
    order: Order;
    isExpanded: boolean;
    onToggle: () => void;
    onPaymentClick: () => void;
    onItemPaymentClick?: (orderId: number, orderItemId: number) => void;
    formatCurrency: (value: number) => string;
    getOrderStatusBadge: (status: Order['status']) => React.ReactElement;
}

export function OrderCard({
    order,
    isExpanded,
    onToggle,
    onPaymentClick,
    onItemPaymentClick,
    formatCurrency,
    getOrderStatusBadge,
}: OrderCardProps) {
    const { data: orderItems, isLoading: isLoadingItems } = useOrderItemsByOrder(
        order.id,
        isExpanded
    );

    const getOrderItemTypeLabel = (type: OrderItem['type']) => {
        const labels = {
            TUITION: 'Học phí',
            MATERIAL: 'Tài liệu',
            ADJUSTMENT: 'Điều chỉnh',
        };
        return labels[type];
    };

    const getOrderItemTypeColor = (type: OrderItem['type']) => {
        const colors = {
            TUITION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            MATERIAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            ADJUSTMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        };
        return colors[type];
    };

    return (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Order Header - Clickable */}
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-4">
                        <div className="flex items-center gap-2">
                            {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                    #{order.id}
                                </span>
                                {getOrderStatusBadge(order.status)}
                            </div>
                            <div className="mt-1 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-zinc-500" />
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        {order.payerName}
                                    </span>
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                        {order.payerPhone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {formatCurrency(order.finalAmount)}
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                Đã đóng: {formatCurrency(order.totalPaid)}
                            </div>
                        </div>
                        {order.status !== 'paid' && order.status !== 'cancelled' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPaymentClick();
                                }}
                                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                Thanh toán
                            </button>
                        )}
                    </div>
                </div>
            </button>

            {/* Order Items - Expandable Content */}
            {isExpanded && (
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                    {isLoadingItems ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                        </div>
                    ) : !orderItems || orderItems.length === 0 ? (
                        <div className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                            Không có chi tiết hóa đơn
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Chi tiết hóa đơn ({orderItems.length} mục)
                            </div>
                            {orderItems.map((item) => {
                                const totalLineAmount = item.totalLineAmount ?? item.amount;
                                const paidAmount = item.paidAmount ?? 0;
                                // Use remainingAmount from API if available, otherwise calculate
                                const remainingDebt = item.remainingAmount ?? (totalLineAmount - paidAmount);
                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderItemTypeColor(item.type)}`}
                                                    >
                                                        {getOrderItemTypeLabel(item.type)}
                                                    </span>
                                                    {remainingDebt > 0 && (
                                                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                            Còn nợ
                                                        </span>
                                                    )}
                                                    {remainingDebt <= 0 && paidAmount > 0 && (
                                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                            Đã trả đủ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    {item.student && (
                                                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                                                            <User className="h-3.5 w-3.5 text-zinc-500" />
                                                            <span className="font-medium">{item.student.fullName}</span>
                                                            {item.student.code && (
                                                                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                                                    ({item.student.code})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.class && (
                                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                            <BookOpen className="h-3.5 w-3.5" />
                                                            <span className="text-sm">{item.class.name}</span>
                                                        </div>
                                                    )}
                                                    {item.tuitionPeriod && (
                                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span className="text-sm">{item.tuitionPeriod.name}</span>
                                                        </div>
                                                    )}
                                                    {item.note && (
                                                        <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                                            {item.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <div
                                                    className={`text-lg font-bold ${item.amount < 0
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-zinc-900 dark:text-zinc-50'
                                                        }`}
                                                >
                                                    {formatCurrency(totalLineAmount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-50">Tiền hàng:</span>
                                                <span>{formatCurrency(item.amount)}</span>
                                            </div>
                                            {typeof item.vatRate !== 'undefined' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">VAT:</span>
                                                    <span>{item.vatRate}% ({formatCurrency(item.vatAmount ?? 0)})</span>
                                                </div>
                                            )}
                                            {typeof item.totalLineAmount !== 'undefined' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">Tổng dòng:</span>
                                                    <span>{formatCurrency(totalLineAmount)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Payment Status */}
                                        <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                                            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">Đã thanh toán:</span>
                                                    <span className={paidAmount > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                                                        {formatCurrency(paidAmount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">Còn nợ:</span>
                                                    <span
                                                        className={`font-semibold ${remainingDebt > 0
                                                            ? 'text-orange-600 dark:text-orange-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                            }`}
                                                    >
                                                        {formatCurrency(remainingDebt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">Tiến độ:</span>
                                                    <span>
                                                        {totalLineAmount > 0
                                                            ? `${Math.round((paidAmount / totalLineAmount) * 100)}%`
                                                            : '0%'}
                                                    </span>
                                                </div>
                                                {remainingDebt > 0 && onItemPaymentClick && (
                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onItemPaymentClick(order.id, item.id);
                                                            }}
                                                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                                                        >
                                                            Thanh toán mục này
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                            {/* Order Summary */}
                            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="grid grid-cols-1 gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            Tiền hàng (chưa VAT):
                                        </span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            {formatCurrency(order.subTotal ?? order.totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            VAT:
                                        </span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                            {formatCurrency(order.taxTotal ?? 0)}
                                        </span>
                                    </div>
                                </div>
                                {order.discountTotal > 0 && (
                                    <div className="flex items-center justify-between border-b border-zinc-200 py-2 dark:border-zinc-700">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Giảm giá:</span>
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            -{formatCurrency(order.discountTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                        Thành tiền:
                                    </span>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                        {formatCurrency(order.finalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

