import type { Student } from './student';
import type { Class } from './class';

export type AttendanceStatus = 
  | 'ON_TIME' 
  | 'LATE_LESS_10_MINUTES' 
  | 'LATE_MORE_10_MINUTES' 
  | 'ABSENT_WITH_PERMISSION' 
  | 'ABSENT_NO_PERMISSION' 
  | 'ABSENT_MIXED' 
  | 'MAKEUP' 
  | 'DRAFT';

export interface Attendance {
  id: number;
  classId: number;
  class?: Class;
  studentId: number;
  student?: Student;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  isReconciled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAttendanceDto {
  studentId: number;
  status: AttendanceStatus;
  note?: string | null;
}

export interface SubmitAttendanceDto {
  classId: number;
  date: string;
  students: StudentAttendanceDto[];
}

