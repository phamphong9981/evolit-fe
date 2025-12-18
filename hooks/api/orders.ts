import type { Order, OrderItem, CreateOrderDto, UpdateOrderDto, ConfirmPaymentDto, OrderStatus } from '@/types/order';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const ordersApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getOrdersByStatus: async (status: OrderStatus): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/by-status?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch orders by status');
    return response.json();
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  getOrdersByPeriod: async (periodId: number): Promise<Order[]> => {
    // This endpoint might need to be implemented on backend
    // For now, we'll filter client-side or use a different endpoint
    const response = await fetch(`${API_BASE_URL}/orders?periodId=${periodId}`);
    if (!response.ok) throw new Error('Failed to fetch orders by period');
    return response.json();
  },

  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create order' }));
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  updateOrder: async (id: number, data: UpdateOrderDto): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update order' }));
      throw new Error(error.message || 'Failed to update order');
    }
    return response.json();
  },

  confirmPayment: async (id: number, data: ConfirmPaymentDto): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to confirm payment' }));
      throw new Error(error.message || 'Failed to confirm payment');
    }
    return response.json();
  },

  deleteOrder: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete order' }));
      throw new Error(error.message || 'Failed to delete order');
    }
  },

  getAllOrderItems: async (): Promise<OrderItem[]> => {
    const response = await fetch(`${API_BASE_URL}/order-items`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    return response.json();
  },

  getOrderItemsByOrder: async (orderId: number): Promise<OrderItem[]> => {
    const response = await fetch(`${API_BASE_URL}/order-items/by-order/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    return response.json();
  },

  getOrderItemsByStudent: async (params: { studentId?: number; code?: string; search?: string }): Promise<OrderItem[]> => {
    const queryParams = new URLSearchParams();
    if (params.search) {
      queryParams.append('search', params.search);
    } else if (params.code) {
      queryParams.append('code', params.code);
    } else if (params.studentId) {
      queryParams.append('studentId', params.studentId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/order-items/by-student?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch order items by student');
    return response.json();
  },

  getOrderItemsByClass: async (classId: number): Promise<OrderItem[]> => {
    const response = await fetch(`${API_BASE_URL}/order-items/by-class/${classId}`);
    if (!response.ok) throw new Error('Failed to fetch order items by class');
    return response.json();
  },

  createOrderItem: async (data: {
    orderId?: number;
    studentId: number;
    classId?: number | null;
    tuitionPeriodId?: number | null;
    amount?: number;
    vatRate?: number;
    vatAmount?: number;
    totalLineAmount?: number;
    type?: 'TUITION' | 'MATERIAL' | 'ADJUSTMENT';
    note?: string;
  }): Promise<OrderItem> => {
    const response = await fetch(`${API_BASE_URL}/order-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create order item' }));
      throw new Error(error.message || 'Failed to create order item');
    }
    return response.json();
  },
};

