import type { Student } from './student';
import type { Class } from './class';

export type EnrollmentStatus = 'active' | 'reserved' | 'dropped';

export interface Enrollment {
  id: number;
  studentId: number;
  student?: Student;
  classId: number;
  class?: Class;
  startDate: string;
  endDate?: string | null;
  status: EnrollmentStatus;
  specificDiscount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnrollmentDto {
  studentId: number;
  classId: number;
  startDate: string;
  endDate?: string | null;
  status?: EnrollmentStatus;
  specificDiscount?: number;
}

export interface UpdateEnrollmentDto {
  startDate?: string;
  endDate?: string | null;
  status?: EnrollmentStatus;
  specificDiscount?: number;
}

