import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendancesApi } from './api/attendances';
import type { SubmitAttendanceDto } from '@/types/attendance';

/**
 * Hook để lấy attendances theo lớp và ngày
 */
export function useAttendancesByClassAndDate(classId: number, date: string) {
  return useQuery({
    queryKey: ['attendances', 'class', classId, 'date', date],
    queryFn: () => attendancesApi.getAttendancesByClassAndDate(classId, date),
    enabled: !!classId && !!date,
  });
}

/**
 * Hook để submit attendance
 */
export function useSubmitAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAttendanceDto) => attendancesApi.submitAttendance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({
        queryKey: ['attendances', 'class', variables.classId, 'date', variables.date],
      });
    },
  });
}

