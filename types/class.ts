export type ClassStatus = 'active' | 'inactive' | 'archived';

export interface Subject {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  student?: {
    id: number;
    fullName: string;
  };
}

export interface Class {
  id: number;
  name: string;
  subjectId: number;
  subject?: Subject;
  branchId?: number;
  teacherId?: number;
  status: ClassStatus;
  baseTuitionFee: number;
  createdAt?: string;
  updatedAt?: string;
  schedules?: Schedule[];
  enrollments?: Enrollment[];
}

export interface CreateClassDto {
  name: string;
  subjectId: number;
  branchId?: number;
  teacherId?: number;
  status?: ClassStatus;
  baseTuitionFee: number;
}

export interface UpdateClassDto {
  name?: string;
  subjectId?: number;
  branchId?: number;
  teacherId?: number;
  status?: ClassStatus;
  baseTuitionFee?: number;
}

