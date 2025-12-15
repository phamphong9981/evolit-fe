import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types/student';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const studentsApi = {
  getAllStudents: async (): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  getStudentById: async (id: number): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  searchStudentsByName: async (name: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/students/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Failed to search students');
    return response.json();
  },

  getStudentByCode: async (code: string): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students/by-code/${encodeURIComponent(code)}`);
    if (!response.ok) throw new Error('Failed to fetch student by code');
    return response.json();
  },

  getStudentsByPhone: async (phone: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/students/by-phone/${encodeURIComponent(phone)}`);
    if (!response.ok) throw new Error('Failed to fetch students by phone');
    return response.json();
  },

  createStudent: async (data: CreateStudentDto): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create student' }));
      throw new Error(error.message || 'Failed to create student');
    }
    return response.json();
  },

  updateStudent: async (id: number, data: UpdateStudentDto): Promise<Student> => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update student' }));
      throw new Error(error.message || 'Failed to update student');
    }
    return response.json();
  },

  deleteStudent: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete student' }));
      throw new Error(error.message || 'Failed to delete student');
    }
  },
};

