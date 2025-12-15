import type { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto, EnrollmentStatus } from '@/types/enrollment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const enrollmentsApi = {
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments`);
    if (!response.ok) throw new Error('Failed to fetch enrollments');
    return response.json();
  },

  getEnrollmentById: async (id: number): Promise<Enrollment> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`);
    if (!response.ok) throw new Error('Failed to fetch enrollment');
    return response.json();
  },

  getEnrollmentsByStudent: async (studentId: number): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/by-student/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch enrollments by student');
    return response.json();
  },

  getActiveEnrollmentsByStudent: async (studentId: number): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/by-student/${studentId}/active`);
    if (!response.ok) throw new Error('Failed to fetch active enrollments by student');
    return response.json();
  },

  getEnrollmentsByClass: async (classId: number): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/by-class/${classId}`);
    if (!response.ok) throw new Error('Failed to fetch enrollments by class');
    return response.json();
  },

  getActiveEnrollmentsByClass: async (classId: number): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/by-class/${classId}/active`);
    if (!response.ok) throw new Error('Failed to fetch active enrollments by class');
    return response.json();
  },

  getEnrollmentsByStatus: async (status: EnrollmentStatus): Promise<Enrollment[]> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/by-status?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch enrollments by status');
    return response.json();
  },

  getEnrollmentsByDateRange: async (startDate: string, endDate: string): Promise<Enrollment[]> => {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/by-date-range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) throw new Error('Failed to fetch enrollments by date range');
    return response.json();
  },

  countActiveEnrollmentsInClass: async (classId: number): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/count/class/${classId}/active`);
    if (!response.ok) throw new Error('Failed to count active enrollments in class');
    return response.json();
  },

  countActiveEnrollmentsByStudent: async (studentId: number): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/count/student/${studentId}/active`);
    if (!response.ok) throw new Error('Failed to count active enrollments by student');
    return response.json();
  },

  createEnrollment: async (data: CreateEnrollmentDto): Promise<Enrollment> => {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create enrollment' }));
      throw new Error(error.message || 'Failed to create enrollment');
    }
    return response.json();
  },

  updateEnrollment: async (id: number, data: UpdateEnrollmentDto): Promise<Enrollment> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update enrollment' }));
      throw new Error(error.message || 'Failed to update enrollment');
    }
    return response.json();
  },

  deleteEnrollment: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete enrollment' }));
      throw new Error(error.message || 'Failed to delete enrollment');
    }
  },
};

