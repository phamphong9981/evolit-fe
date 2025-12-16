import type { Attendance, SubmitAttendanceDto } from '@/types/attendance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const attendancesApi = {
  submitAttendance: async (data: SubmitAttendanceDto): Promise<Attendance[]> => {
    const response = await fetch(`${API_BASE_URL}/attendances/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit attendance' }));
      throw new Error(error.message || 'Failed to submit attendance');
    }
    return response.json();
  },

  getAttendancesByClassAndDate: async (classId: number, date: string): Promise<Attendance[]> => {
    const response = await fetch(
      `${API_BASE_URL}/attendances/by-class-and-date?classId=${classId}&date=${encodeURIComponent(date)}`
    );
    if (!response.ok) throw new Error('Failed to fetch attendances');
    return response.json();
  },
};

