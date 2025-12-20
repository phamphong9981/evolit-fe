import type { StudentWallet, GetEnrollmentsParams, GetEnrollmentEventsParams, EnrollmentEvent } from '@/types/statistics';
import type { Enrollment } from '@/types/enrollment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const statisticsApi = {
  /**
   * Lấy danh sách tất cả student wallets
   */
  getAllWallets: async (): Promise<StudentWallet[]> => {
    const response = await fetch(`${API_BASE_URL}/statistics/wallets`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch student wallets' }));
      throw new Error(error.message || 'Failed to fetch student wallets');
    }
    return response.json();
  },

  /**
   * Xóa student wallet (revert refund)
   */
  deleteWallet: async (walletId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/statistics/refunds/${walletId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete wallet' }));
      throw new Error(error.message || 'Failed to delete wallet');
    }
  },

  /**
   * Lấy danh sách enrollments theo khoảng thời gian
   */
  getEnrollmentsByDateRange: async (params: GetEnrollmentsParams): Promise<Enrollment[]> => {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const response = await fetch(`${API_BASE_URL}/statistics/enrollments?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch enrollments' }));
      throw new Error(error.message || 'Failed to fetch enrollments');
    }
    return response.json();
  },

  /**
   * Lấy danh sách enrollment events (đăng ký/xin nghỉ) theo khoảng thời gian
   */
  getEnrollmentEventsByDateRange: async (params: GetEnrollmentEventsParams): Promise<EnrollmentEvent[]> => {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    const response = await fetch(`${API_BASE_URL}/statistics/enrollment-events?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch enrollment events' }));
      throw new Error(error.message || 'Failed to fetch enrollment events');
    }
    return response.json();
  },
};

