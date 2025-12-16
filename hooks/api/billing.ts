import type { GenerateBillingRequest, GenerateBillingResponse } from '@/types/billing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const billingApi = {
  generateBilling: async (data: GenerateBillingRequest): Promise<GenerateBillingResponse> => {
    const response = await fetch(`${API_BASE_URL}/billing/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate billing' }));
      throw new Error(error.message || 'Failed to generate billing');
    }
    return response.json();
  },
};

