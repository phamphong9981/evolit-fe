import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statisticsApi } from './api/statistics';
import type { GetEnrollmentsParams, GetEnrollmentEventsParams } from '@/types/statistics';

/**
 * Hook để lấy danh sách tất cả student wallets
 */
export function useStudentWallets() {
  return useQuery({
    queryKey: ['statistics', 'wallets'],
    queryFn: () => statisticsApi.getAllWallets(),
  });
}

/**
 * Hook để xóa student wallet (revert refund)
 */
export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: number) => statisticsApi.deleteWallet(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics', 'wallets'] });
    },
  });
}

/**
 * Hook để lấy enrollments theo khoảng thời gian
 */
export function useEnrollmentsByDateRange(params: GetEnrollmentsParams, enabled = true) {
  return useQuery({
    queryKey: ['statistics', 'enrollments', params.startDate, params.endDate, params.status],
    queryFn: () => statisticsApi.getEnrollmentsByDateRange(params),
    enabled: enabled && !!params.startDate && !!params.endDate,
  });
}

/**
 * Hook để lấy enrollment events (đăng ký/xin nghỉ) theo khoảng thời gian
 */
export function useEnrollmentEventsByDateRange(params: GetEnrollmentEventsParams, enabled = true) {
  return useQuery({
    queryKey: ['statistics', 'enrollment-events', params.startDate, params.endDate],
    queryFn: () => statisticsApi.getEnrollmentEventsByDateRange(params),
    enabled: enabled && !!params.startDate && !!params.endDate,
  });
}

