import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reconcileApi } from './api/reconcile';
import type { ReconcileRequest, ReconcileResult } from '@/types/reconcile';

/**
 * Hook để chốt sổ và đối soát kỳ học phí
 */
export function useReconcilePeriod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ periodId, mode }: { periodId: number; mode: ReconcileRequest['mode'] }) =>
            reconcileApi.reconcilePeriod(periodId, { mode }),
        onSuccess: (result: ReconcileResult, variables) => {
            // Invalidate queries to refresh data after reconcile
            queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
            queryClient.invalidateQueries({ queryKey: ['tuition-periods', variables.periodId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'period', variables.periodId] });

            // If executed, also invalidate student wallets and attendance
            if (result.executed) {
                queryClient.invalidateQueries({ queryKey: ['attendances'] });
                queryClient.invalidateQueries({ queryKey: ['students'] });
            }
        },
    });
}

