import type { StudentClass, CreateStudentClassDto, BulkCreateStudentClassDto } from '@/types/student-class';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const studentClassesApi = {
  getAllStudentClasses: async (): Promise<StudentClass[]> => {
    const response = await fetch(`${API_BASE_URL}/student-classes`);
    if (!response.ok) throw new Error('Failed to fetch student classes');
    return response.json();
  },

  getStudentClassById: async (id: number): Promise<StudentClass> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student class');
    return response.json();
  },

  getClassesByStudent: async (studentId: number): Promise<StudentClass[]> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/by-student/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch classes by student');
    return response.json();
  },

  getStudentsByClass: async (classId: number): Promise<StudentClass[]> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/by-class/${classId}`);
    if (!response.ok) throw new Error('Failed to fetch students by class');
    return response.json();
  },

  countStudentsInClass: async (classId: number): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/count/class/${classId}`);
    if (!response.ok) throw new Error('Failed to count students in class');
    return response.json();
  },

  countClassesByStudent: async (studentId: number): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/count/student/${studentId}`);
    if (!response.ok) throw new Error('Failed to count classes by student');
    return response.json();
  },

  createStudentClass: async (data: CreateStudentClassDto): Promise<StudentClass> => {
    const response = await fetch(`${API_BASE_URL}/student-classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create student class' }));
      throw new Error(error.message || 'Failed to create student class');
    }
    return response.json();
  },

  bulkCreateStudentClasses: async (data: BulkCreateStudentClassDto): Promise<StudentClass[]> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to bulk create student classes' }));
      throw new Error(error.message || 'Failed to bulk create student classes');
    }
    return response.json();
  },

  deleteStudentClass: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete student class' }));
      throw new Error(error.message || 'Failed to delete student class');
    }
  },

  deleteStudentClassByStudentAndClass: async (studentId: number, classId: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/student-classes/by-student-and-class?studentId=${studentId}&classId=${classId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete student class' }));
      throw new Error(error.message || 'Failed to delete student class');
    }
  },

  deleteAllStudentsFromClass: async (classId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/by-class/${classId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete all students from class' }));
      throw new Error(error.message || 'Failed to delete all students from class');
    }
  },

  deleteAllClassesFromStudent: async (studentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/student-classes/by-student/${studentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete all classes from student' }));
      throw new Error(error.message || 'Failed to delete all classes from student');
    }
  },
};

