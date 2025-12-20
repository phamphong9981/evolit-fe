import type { ReconcileRequest, ReconcileResult } from '@/types/reconcile';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const reconcileApi = {
    reconcilePeriod: async (periodId: number, data: ReconcileRequest): Promise<ReconcileResult> => {
        const response = await fetch(`${API_BASE_URL}/reconcile/period/${periodId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to reconcile period' }));
            throw new Error(error.message || 'Failed to reconcile period');
        }

        return response.json();
    },
};

