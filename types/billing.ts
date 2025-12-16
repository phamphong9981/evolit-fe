export interface GenerateBillingRequest {
  periodId: number;
  isDraft?: boolean;
}

export interface BillingPreviewDetail {
  payerName: string;
  payerPhone: string;
  studentNames: string[];
  totalAmount: number;
  walletDeduction: number;
  finalAmount: number;
  notes: string[];
}

export interface GenerateBillingResponse {
  periodId: number;
  isDraft: boolean;
  ordersCreated: number;
  itemsCreated: number;
  totalFinalAmount: number;
  details?: BillingPreviewDetail[];
}

export type TuitionPeriodStatus = 'CREATED' | 'ACTIVE' | 'CLOSED';

export interface TuitionPeriodStats {
  totalOrders: number;
  expectedRevenue: number;
  collectedAmount: number;
  collectionPercentage: number;
  expectedRefund: number;
  actualRefund: number;
  status: TuitionPeriodStatus;
}

