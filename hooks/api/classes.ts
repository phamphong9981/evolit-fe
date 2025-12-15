import type { Class, CreateClassDto, UpdateClassDto, ClassStatus } from '@/types/class';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const classesApi = {
  getAllClasses: async (): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes`);
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  getActiveClasses: async (): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/active`);
    if (!response.ok) throw new Error('Failed to fetch active classes');
    return response.json();
  },

  getClassById: async (id: number): Promise<Class> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch class');
    return response.json();
  },

  getClassesBySubject: async (subjectId: number): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/by-subject/${subjectId}`);
    if (!response.ok) throw new Error('Failed to fetch classes by subject');
    return response.json();
  },

  getClassesByBranch: async (branchId: number): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/by-branch/${branchId}`);
    if (!response.ok) throw new Error('Failed to fetch classes by branch');
    return response.json();
  },

  getClassesByTeacher: async (teacherId: number): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/by-teacher/${teacherId}`);
    if (!response.ok) throw new Error('Failed to fetch classes by teacher');
    return response.json();
  },

  getClassesByStatus: async (status: ClassStatus): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes/by-status?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch classes by status');
    return response.json();
  },

  createClass: async (data: CreateClassDto): Promise<Class> => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create class' }));
      throw new Error(error.message || 'Failed to create class');
    }
    return response.json();
  },

  updateClass: async (id: number, data: UpdateClassDto): Promise<Class> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update class' }));
      throw new Error(error.message || 'Failed to update class');
    }
    return response.json();
  },

  deleteClass: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete class' }));
      throw new Error(error.message || 'Failed to delete class');
    }
  },
};

