import type { Transaction, CreateTransactionDto } from '@/types/order';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const transactionsApi = {
  /**
   * Lấy tất cả transactions
   */
  getAllTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  /**
   * Lấy transactions theo order ID
   */
  getTransactionsByOrder: async (orderId: number): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/by-order/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch transactions by order');
    return response.json();
  },

  /**
   * Lấy transactions theo payment method
   */
  getTransactionsByPaymentMethod: async (
    paymentMethod: 'CASH' | 'BANK_TRANSFER'
  ): Promise<Transaction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/transactions/by-payment-method?paymentMethod=${paymentMethod}`
    );
    if (!response.ok) throw new Error('Failed to fetch transactions by payment method');
    return response.json();
  },

  /**
   * Lấy transaction theo ID
   */
  getTransactionById: async (id: number): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  /**
   * Tạo transaction mới
   * Hỗ trợ 2 chế độ:
   * - Auto allocate: không gửi allocations (hoặc array rỗng)
   * - Manual allocate: gửi allocations array với orderItemId và amount
   */
  createTransaction: async (data: CreateTransactionDto): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create transaction' }));
      throw new Error(error.message || 'Failed to create transaction');
    }
    return response.json();
  },

  /**
   * Cập nhật transaction
   */
  updateTransaction: async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update transaction' }));
      throw new Error(error.message || 'Failed to update transaction');
    }
    return response.json();
  },

  /**
   * Xóa transaction
   */
  deleteTransaction: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete transaction' }));
      throw new Error(error.message || 'Failed to delete transaction');
    }
  },
};

