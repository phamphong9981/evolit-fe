export type OrderStatus = 'pending' | 'partial' | 'paid' | 'cancelled';

export interface Transaction {
    id: number;
    orderId: number;
    amount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER';
    evidenceImage?: string | null;
    transactionDate: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    studentId: number;
    classId?: number | null;
    tuitionPeriodId?: number | null;
    amount: number;
    vatRate?: number;
    vatAmount?: number;
    totalLineAmount?: number;
    paidAmount?: number; // Số tiền đã thanh toán cho item này
    remainingAmount?: number; // Số tiền còn nợ (computed, luôn có trong API response)
    isFullyPaid?: boolean; // Đã thanh toán đủ chưa (computed, luôn có trong API response)
    type: 'TUITION' | 'MATERIAL' | 'ADJUSTMENT';
    note?: string | null;
    createdAt?: string;
    updatedAt?: string;
    student?: {
        id: number;
        fullName: string;
        code: string;
        parentPhone?: string;
    };
    class?: {
        id: number;
        name: string;
    };
    tuitionPeriod?: {
        id: number;
        name: string;
    };
}

export interface Order {
    id: number;
    payerName: string;
    payerPhone: string;
    totalAmount: number;
    subTotal?: number;
    taxTotal?: number;
    discountTotal: number;
    finalAmount: number;
    totalPaid: number;
    status: OrderStatus;
    createdBy?: string | null;
    note?: string | null;
    createdAt?: string;
    updatedAt?: string;
    items?: OrderItem[];
    transactions?: Transaction[];
}

export interface CreateOrderDto {
    payerName: string;
    payerPhone: string;
    totalAmount: number;
    subTotal?: number;
    taxTotal?: number;
    discountTotal?: number;
    finalAmount: number;
    status?: OrderStatus;
    createdBy?: string;
    note?: string;
}

export interface UpdateOrderDto {
    payerName?: string;
    payerPhone?: string;
    note?: string;
}

export interface ConfirmPaymentDto {
    amount: number;
    method: 'CASH' | 'BANK_TRANSFER';
    evidence?: string;
}

// Transaction API Types
export interface CreateTransactionDto {
    orderId: number;
    totalAmount: number;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER';
    evidenceImage?: string;
    allocations?: TransactionAllocationDto[];
}

export interface TransactionAllocationDto {
    orderItemId: number;
    amount: number;
}

