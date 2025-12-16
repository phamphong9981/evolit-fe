import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tuitionPeriodsApi } from './api/tuition-periods';
import type { CreateTuitionPeriodDto, UpdateTuitionPeriodDto, TuitionPeriodStatus } from '@/types/tuition-period';

/**
 * Hook để lấy danh sách tất cả kỳ học phí
 */
export function useTuitionPeriods(status?: TuitionPeriodStatus) {
  return useQuery({
    queryKey: ['tuition-periods', status].filter(Boolean),
    queryFn: () => {
      if (status) {
        // If backend supports status filter in query params
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tuition-periods?status=${status}`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch tuition periods');
            return res.json();
          });
      }
      return tuitionPeriodsApi.getAllTuitionPeriods();
    },
  });
}

/**
 * Hook để lấy thông tin kỳ học phí theo ID
 */
export function useTuitionPeriod(id: number) {
  return useQuery({
    queryKey: ['tuition-periods', id],
    queryFn: () => tuitionPeriodsApi.getTuitionPeriodById(id),
    enabled: !!id,
  });
}

/**
 * Hook để tạo kỳ học phí mới
 */
export function useCreateTuitionPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTuitionPeriodDto) => tuitionPeriodsApi.createTuitionPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
    },
  });
}

/**
 * Hook để cập nhật kỳ học phí
 */
export function useUpdateTuitionPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTuitionPeriodDto }) =>
      tuitionPeriodsApi.updateTuitionPeriod(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      queryClient.invalidateQueries({ queryKey: ['tuition-periods', variables.id] });
    },
  });
}

/**
 * Hook để cập nhật trạng thái kỳ học phí
 */
export function useUpdateTuitionPeriodStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TuitionPeriodStatus }) =>
      tuitionPeriodsApi.updateTuitionPeriodStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      queryClient.invalidateQueries({ queryKey: ['tuition-periods', variables.id] });
    },
  });
}

/**
 * Hook để xóa kỳ học phí
 */
export function useDeleteTuitionPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tuitionPeriodsApi.deleteTuitionPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
    },
  });
}

