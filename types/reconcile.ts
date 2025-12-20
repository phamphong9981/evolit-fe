export type ReconcileMode = 'PREVIEW' | 'EXECUTE';

export interface ReconcileRequest {
    mode: ReconcileMode;
}

export interface StudentRefund {
    studentId: number;
    studentName: string;
    refundAmount: number;
    attendanceCount: number;
}

export interface ReconcileResult {
    periodId: number;
    mode: ReconcileMode;
    totalRefundAmount: number;
    attendanceCount: number;
    studentRefunds: StudentRefund[];
    executed: boolean;
}

