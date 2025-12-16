import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from './api/orders';
import type { CreateOrderDto, UpdateOrderDto, ConfirmPaymentDto, OrderStatus } from '@/types/order';

/**
 * Hook để lấy danh sách tất cả hóa đơn
 */
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAllOrders,
  });
}

/**
 * Hook để lấy hóa đơn theo trạng thái
 */
export function useOrdersByStatus(status: OrderStatus) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: () => ordersApi.getOrdersByStatus(status),
    enabled: !!status,
  });
}

/**
 * Hook để lấy hóa đơn theo kỳ học phí
 */
export function useOrdersByPeriod(periodId: number) {
  return useQuery({
    queryKey: ['orders', 'period', periodId],
    queryFn: () => ordersApi.getOrdersByPeriod(periodId),
    enabled: !!periodId,
  });
}

/**
 * Hook để lấy thông tin hóa đơn theo ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}

/**
 * Hook để tạo hóa đơn mới
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook để cập nhật hóa đơn
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderDto }) =>
      ordersApi.updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}

/**
 * Hook để xác nhận thanh toán
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmPaymentDto }) =>
      ordersApi.confirmPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}

/**
 * Hook để xóa hóa đơn
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ordersApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook để lấy danh sách order items của một order
 */
export function useOrderItemsByOrder(orderId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['order-items', 'order', orderId],
    queryFn: () => ordersApi.getOrderItemsByOrder(orderId),
    enabled: enabled && !!orderId,
  });
}

