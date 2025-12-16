'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
    Loader2,
    Rocket,
    Lock,
    Receipt,
    FileCheck,
    Clock,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    User,
    BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useTuitionPeriod, useUpdateTuitionPeriodStatus } from '@/hooks/tuition-period';
import { useOrdersByPeriod, useConfirmPayment, useOrderItemsByOrder } from '@/hooks/order';
import { useGenerateBilling } from '@/hooks/billing';
import { GenerateBillingModal } from '@/components/GenerateBillingModal';
import { ConfirmPaymentModal } from '@/components/ConfirmPaymentModal';
import type { Order, OrderItem, ConfirmPaymentDto } from '@/types/order';
import type { TuitionPeriodStatus } from '@/types/tuition-period';
import type { GenerateBillingRequest, GenerateBillingResponse } from '@/types/billing';

type TabType = 'orders' | 'reconciliation' | 'audit';

interface OrderCardProps {
    order: Order;
    isExpanded: boolean;
    onToggle: () => void;
    onPaymentClick: () => void;
    formatCurrency: (value: number) => string;
    getOrderStatusBadge: (status: Order['status']) => React.ReactElement;
}

function OrderCard({
    order,
    isExpanded,
    onToggle,
    onPaymentClick,
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
                            {orderItems.map((item) => (
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
                                                {formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Order Summary */}
                            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        Tổng tiền:
                                    </span>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
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

export default function TuitionPeriodDetailPage() {
    const params = useParams();
    const periodId = Number(params.id);

    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid'>('all');
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    // Fetch data
    const { data: period, isLoading: isLoadingPeriod } = useTuitionPeriod(periodId);
    const { data: orders = [], isLoading: isLoadingOrders } = useOrdersByPeriod(periodId);

    // Mutations
    const generateBillingMutation = useGenerateBilling();
    const confirmPaymentMutation = useConfirmPayment();
    const updateStatusMutation = useUpdateTuitionPeriodStatus();

    // Calculate stats
    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const expectedRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
        const collectedAmount = orders.reduce((sum, o) => sum + o.totalPaid, 0);
        const collectionPercentage = expectedRevenue > 0 ? (collectedAmount / expectedRevenue) * 100 : 0;
        const expectedRefund = 0; // TODO: Calculate from attendance
        const actualRefund = 0; // TODO: Calculate from actual refunds

        // Get status from period (from backend)
        const status = (period?.status || 'CREATED') as TuitionPeriodStatus;

        return {
            totalOrders,
            expectedRevenue,
            collectedAmount,
            collectionPercentage,
            expectedRefund,
            actualRefund,
            status,
        };
    }, [orders, period]);

    // Filter orders
    const filteredOrders = useMemo(() => {
        if (orderStatusFilter === 'all') return orders;
        return orders.filter((o) => o.status === orderStatusFilter);
    }, [orders, orderStatusFilter]);

    const handleGenerateBilling = async (data: GenerateBillingRequest): Promise<GenerateBillingResponse> => {
        return await generateBillingMutation.mutateAsync(data);
    };

    const handleConfirmCreate = async (data: GenerateBillingRequest) => {
        const result = await generateBillingMutation.mutateAsync(data);
        setIsGenerateModalOpen(false);

        // If billing generated successfully, update status to ACTIVE
        if (result.ordersCreated > 0) {
            await updateStatusMutation.mutateAsync({
                id: periodId,
                status: 'ACTIVE',
            });
        }
    };

    const handleConfirmPayment = async (data: ConfirmPaymentDto) => {
        if (!selectedOrder) return;
        await confirmPaymentMutation.mutateAsync({ id: selectedOrder.id, data });
        setIsPaymentModalOpen(false);
        setSelectedOrder(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const toggleOrder = (orderId: number) => {
        setExpandedOrders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const getStatusBadge = (status: TuitionPeriodStatus) => {
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
    };

    const getOrderStatusBadge = (status: Order['status']) => {
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
    };

    if (isLoadingPeriod) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!period) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <XCircle className="mb-4 h-12 w-12 text-red-500" />
                <p className="text-lg text-zinc-600 dark:text-zinc-400">Không tìm thấy kỳ học phí</p>
                <Link
                    href="/finance/tuition-periods"
                    className="mt-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link
                href="/finance/tuition-periods"
                className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
            </Link>

            {/* Vùng A: Header & Thống kê nhanh (Sticky Top) */}
            <div className="sticky top-0 z-10 mb-6 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                Kỳ thu phí {period.name}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                {new Date(period.startDate).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(period.endDate).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        {getStatusBadge(stats.status)}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Tổng hóa đơn</div>
                        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {stats.totalOrders} đơn
                        </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Doanh thu dự kiến</div>
                        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(stats.expectedRevenue)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Đã thu</div>
                        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(stats.collectedAmount)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            ({stats.collectionPercentage.toFixed(1)}%)
                        </div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Tiền hoàn</div>
                        <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(stats.actualRefund)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            Dự kiến: {formatCurrency(stats.expectedRefund)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vùng B: Khu vực Hành động (Action Bar) */}
            <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                {stats.status === 'CREATED' && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Tính toán công nợ</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Tạo hóa đơn tự động cho tất cả học sinh trong kỳ này
                            </p>
                        </div>
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                        >
                            <Rocket className="h-5 w-5" />
                            TÍNH TOÁN CÔNG NỢ
                        </button>
                    </div>
                )}

                {stats.status === 'ACTIVE' && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Chốt sổ & Đối soát</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Xem lại điểm danh và chốt sổ kỳ học phí này
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                if (window.confirm('Bạn có chắc chắn muốn chốt sổ kỳ này? Hành động này không thể hoàn tác.')) {
                                    try {
                                        await updateStatusMutation.mutateAsync({
                                            id: periodId,
                                            status: 'CLOSED',
                                        });
                                    } catch (error) {
                                        alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi chốt sổ');
                                    }
                                }
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            <Lock className="h-5 w-5" />
                            {updateStatusMutation.isPending ? 'Đang xử lý...' : 'CHỐT SỔ & ĐỐI SOÁT'}
                        </button>
                    </div>
                )}

                {stats.status === 'CLOSED' && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-zinc-400" />
                            <div>
                                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Kỳ đã chốt sổ</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Kỳ này đã chốt sổ. Chỉ được xem, không được sửa.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                // TODO: Implement re-open (Super Admin only)
                                alert('Chức năng mở lại kỳ chỉ dành cho Super Admin');
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            Mở lại kỳ
                        </button>
                    </div>
                )}
            </div>

            {/* Vùng C: Nội dung chính (Tabs) */}
            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {/* Tab Headers */}
                <div className="border-b border-zinc-200 dark:border-zinc-800">
                    <nav className="flex gap-1 px-6">
                        <button
                            onClick={() => setActiveTab('orders')}
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
                            onClick={() => setActiveTab('reconciliation')}
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
                            onClick={() => setActiveTab('audit')}
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
                        <div>
                            {/* Filter */}
                            <div className="mb-4 flex gap-2">
                                {(['all', 'pending', 'partial', 'paid'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setOrderStatusFilter(status)}
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

                            {/* Orders List */}
                            {isLoadingOrders ? (
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
                                                onToggle={() => toggleOrder(order.id)}
                                                onPaymentClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsPaymentModalOpen(true);
                                                }}
                                                formatCurrency={formatCurrency}
                                                getOrderStatusBadge={getOrderStatusBadge}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reconciliation' && (
                        <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
                            <FileCheck className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                            <p>Bảng kê đối soát đang được phát triển</p>
                            <p className="mt-2 text-sm">
                                Hiển thị danh sách học sinh có phát sinh tiền hoàn (nghỉ có phép)
                            </p>
                        </div>
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

            {/* Modals */}
            <GenerateBillingModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSubmit={handleGenerateBilling}
                onConfirmCreate={handleConfirmCreate}
                periodId={periodId}
                periodName={period.name}
            />

            <ConfirmPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleConfirmPayment}
                order={selectedOrder}
            />
        </div>
    );
}

