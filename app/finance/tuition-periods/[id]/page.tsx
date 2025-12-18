'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTuitionPeriod, useUpdateTuitionPeriodStatus } from '@/hooks/tuition-period';
import { useOrdersByPeriod } from '@/hooks/order';
import { useCreateTransaction } from '@/hooks/transaction';
import { useGenerateBilling } from '@/hooks/billing';
import { GenerateBillingModal } from '@/components/GenerateBillingModal';
import { ConfirmPaymentModal } from '@/components/ConfirmPaymentModal';
import { CreateManualOrderItemModal } from '@/components/CreateManualOrderItemModal';
import { TuitionPeriodHeader } from '@/components/tuition-period/TuitionPeriodHeader';
import { TuitionPeriodActionBar } from '@/components/tuition-period/TuitionPeriodActionBar';
import { TuitionPeriodTabs } from '@/components/tuition-period/TuitionPeriodTabs';
import { formatCurrency, getTuitionPeriodStatusBadge, getOrderStatusBadge } from '@/utils/tuition-period';
import type { Order, CreateTransactionDto } from '@/types/order';
import type { TuitionPeriodStatus } from '@/types/tuition-period';
import type { GenerateBillingRequest, GenerateBillingResponse } from '@/types/billing';

type TabType = 'orders' | 'reconciliation' | 'audit';


export default function TuitionPeriodDetailPage() {
    const params = useParams();
    const periodId = Number(params.id);

    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid'>('all');
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | undefined>(undefined);
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    // Fetch data
    const { data: period, isLoading: isLoadingPeriod } = useTuitionPeriod(periodId);
    const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useOrdersByPeriod(periodId);

    // Mutations
    const generateBillingMutation = useGenerateBilling();
    const createTransactionMutation = useCreateTransaction();
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

    const handleConfirmPayment = async (data: CreateTransactionDto) => {
        if (!selectedOrder) return;
        await createTransactionMutation.mutateAsync(data);
        setIsPaymentModalOpen(false);
        setSelectedOrder(null);
        setSelectedOrderItemId(undefined);
        refetchOrders(); // Refresh orders to update totalPaid and status
    };

    const handleItemPaymentClick = (orderId: number, orderItemId: number) => {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setSelectedOrderItemId(orderItemId);
            setIsPaymentModalOpen(true);
        }
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

    const handleClosePeriod = async () => {
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
            <TuitionPeriodHeader
                period={period}
                stats={stats}
                formatCurrency={formatCurrency}
                getStatusBadge={getTuitionPeriodStatusBadge}
            />

            {/* Vùng B: Khu vực Hành động (Action Bar) */}
            <TuitionPeriodActionBar
                status={stats.status}
                onGenerateBilling={() => setIsGenerateModalOpen(true)}
                onClosePeriod={handleClosePeriod}
                isClosing={updateStatusMutation.isPending}
            />

            {/* Vùng C: Nội dung chính (Tabs) */}
            <TuitionPeriodTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                orders={orders}
                isLoadingOrders={isLoadingOrders}
                orderStatusFilter={orderStatusFilter}
                onFilterChange={setOrderStatusFilter}
                onCreateManualOrder={() => setIsManualOrderModalOpen(true)}
                expandedOrders={expandedOrders}
                onToggleOrder={toggleOrder}
                onPaymentClick={(order) => {
                    setSelectedOrder(order);
                    setSelectedOrderItemId(undefined);
                    setIsPaymentModalOpen(true);
                }}
                onItemPaymentClick={handleItemPaymentClick}
                formatCurrency={formatCurrency}
                getOrderStatusBadge={getOrderStatusBadge}
            />

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
                    setSelectedOrderItemId(undefined);
                }}
                onSubmit={handleConfirmPayment}
                order={selectedOrder}
                preSelectedOrderItemId={selectedOrderItemId}
            />

            <CreateManualOrderItemModal
                isOpen={isManualOrderModalOpen}
                onClose={() => setIsManualOrderModalOpen(false)}
                periodId={periodId}
                periodName={period?.name || ''}
                onSuccess={() => {
                    refetchOrders();
                }}
            />
        </div>
    );
}


