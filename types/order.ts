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
    type: 'TUITION' | 'MATERIAL' | 'ADJUSTMENT';
    note?: string | null;
    createdAt?: string;
    updatedAt?: string;
    student?: {
        id: number;
        fullName: string;
        code: string;
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

