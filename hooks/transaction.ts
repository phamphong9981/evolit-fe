import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from './api/transactions';
import type { Transaction, CreateTransactionDto } from '@/types/order';

/**
 * Hook để lấy tất cả transactions
 */
export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: transactionsApi.getAllTransactions,
    });
}

/**
 * Hook để lấy transactions theo order ID
 */
export function useTransactionsByOrder(orderId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['transactions', 'by-order', orderId],
        queryFn: () => transactionsApi.getTransactionsByOrder(orderId),
        enabled: enabled && !!orderId,
    });
}

/**
 * Hook để lấy transactions theo payment method
 */
export function useTransactionsByPaymentMethod(
    paymentMethod: 'CASH' | 'BANK_TRANSFER',
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['transactions', 'by-payment-method', paymentMethod],
        queryFn: () => transactionsApi.getTransactionsByPaymentMethod(paymentMethod),
        enabled: enabled && !!paymentMethod,
    });
}

/**
 * Hook để lấy transaction theo ID
 */
export function useTransaction(id: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['transactions', id],
        queryFn: () => transactionsApi.getTransactionById(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook để tạo transaction mới
 * Hỗ trợ cả 2 chế độ:
 * - Auto allocate: không gửi allocations (hoặc array rỗng)
 * - Manual allocate: gửi allocations array với orderItemId và amount
 */
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransactionDto) => transactionsApi.createTransaction(data),
        onSuccess: (_, variables) => {
            // Invalidate transactions queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', 'by-order', variables.orderId] });

            // Invalidate orders queries để cập nhật totalPaid và status
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });

            // Invalidate order items để cập nhật paidAmount
            queryClient.invalidateQueries({ queryKey: ['order-items'] });
            queryClient.invalidateQueries({ queryKey: ['order-items', 'order', variables.orderId] });
        },
    });
}

/**
 * Hook để cập nhật transaction
 */
export function useUpdateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) =>
            transactionsApi.updateTransaction(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] });
        },
    });
}

/**
 * Hook để xóa transaction
 */
export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => transactionsApi.deleteTransaction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}

