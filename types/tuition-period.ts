export type TuitionPeriodStatus = 'CREATED' | 'ACTIVE' | 'CLOSED';

export interface TuitionPeriod {
    id: number;
    name: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
    status?: TuitionPeriodStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTuitionPeriodDto {
    name: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
}

export interface UpdateTuitionPeriodDto {
    name?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
}

