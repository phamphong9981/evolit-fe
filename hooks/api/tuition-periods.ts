import type { TuitionPeriod, CreateTuitionPeriodDto, UpdateTuitionPeriodDto } from '@/types/tuition-period';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const tuitionPeriodsApi = {
  getAllTuitionPeriods: async (): Promise<TuitionPeriod[]> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods`);
    if (!response.ok) throw new Error('Failed to fetch tuition periods');
    return response.json();
  },

  getTuitionPeriodById: async (id: number): Promise<TuitionPeriod> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods/${id}`);
    if (!response.ok) throw new Error('Failed to fetch tuition period');
    return response.json();
  },

  createTuitionPeriod: async (data: CreateTuitionPeriodDto): Promise<TuitionPeriod> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create tuition period' }));
      throw new Error(error.message || 'Failed to create tuition period');
    }
    return response.json();
  },

  updateTuitionPeriod: async (id: number, data: UpdateTuitionPeriodDto): Promise<TuitionPeriod> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update tuition period' }));
      throw new Error(error.message || 'Failed to update tuition period');
    }
    return response.json();
  },

  updateTuitionPeriodStatus: async (id: number, status: 'CREATED' | 'ACTIVE' | 'CLOSED'): Promise<TuitionPeriod> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update tuition period status' }));
      throw new Error(error.message || 'Failed to update tuition period status');
    }
    return response.json();
  },

  deleteTuitionPeriod: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tuition-periods/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete tuition period' }));
      throw new Error(error.message || 'Failed to delete tuition period');
    }
  },
};

