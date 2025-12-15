import type { Student } from './student';
import type { Class } from './class';

export interface StudentClass {
  id: number;
  studentId: number;
  student?: Student;
  classId: number;
  class?: Class;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentClassDto {
  studentId: number;
  classId: number;
}

export interface BulkCreateStudentClassDto {
  classId: number;
  studentIds: number[];
}

