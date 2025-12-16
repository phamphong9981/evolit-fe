import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from './api/billing';
import type { GenerateBillingRequest } from '@/types/billing';

/**
 * Hook để tạo hóa đơn tự động
 */
export function useGenerateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateBillingRequest) => billingApi.generateBilling(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'period', variables.periodId] });
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      queryClient.invalidateQueries({ queryKey: ['tuition-periods', variables.periodId] });
    },
  });
}

