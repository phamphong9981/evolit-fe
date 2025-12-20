import type { Student } from './student';
import type { Enrollment } from './enrollment';

export interface StudentWallet {
  id: number;
  studentId: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
  student?: Student;
}

export interface GetEnrollmentsParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status?: 'active' | 'reserved' | 'dropped' | 'mixed';
}

export interface GetEnrollmentEventsParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface EnrollmentEvent {
  enrollment: Enrollment;
  eventType: 'register' | 'unregister';
  eventDate: string; // ISO 8601
}

