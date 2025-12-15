import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from './api/enrollments';
import type { CreateEnrollmentDto, UpdateEnrollmentDto, EnrollmentStatus } from '@/types/enrollment';

/**
 * Hook để lấy tất cả enrollments
 */
export function useEnrollments() {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAllEnrollments,
  });
}

/**
 * Hook để lấy thông tin enrollment theo ID
 */
export function useEnrollment(id: number) {
  return useQuery({
    queryKey: ['enrollments', id],
    queryFn: () => enrollmentsApi.getEnrollmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy enrollments theo học sinh
 */
export function useEnrollmentsByStudent(studentId: number) {
  return useQuery({
    queryKey: ['enrollments', 'student', studentId],
    queryFn: () => enrollmentsApi.getEnrollmentsByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook để lấy active enrollments theo học sinh
 */
export function useActiveEnrollmentsByStudent(studentId: number) {
  return useQuery({
    queryKey: ['enrollments', 'student', studentId, 'active'],
    queryFn: () => enrollmentsApi.getActiveEnrollmentsByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook để lấy enrollments theo lớp
 */
export function useEnrollmentsByClass(classId: number) {
  return useQuery({
    queryKey: ['enrollments', 'class', classId],
    queryFn: () => enrollmentsApi.getEnrollmentsByClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook để lấy active enrollments theo lớp
 */
export function useActiveEnrollmentsByClass(classId: number) {
  return useQuery({
    queryKey: ['enrollments', 'class', classId, 'active'],
    queryFn: () => enrollmentsApi.getActiveEnrollmentsByClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook để lấy enrollments theo trạng thái
 */
export function useEnrollmentsByStatus(status: EnrollmentStatus) {
  return useQuery({
    queryKey: ['enrollments', 'status', status],
    queryFn: () => enrollmentsApi.getEnrollmentsByStatus(status),
    enabled: !!status,
  });
}

/**
 * Hook để lấy enrollments theo khoảng thời gian
 */
export function useEnrollmentsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['enrollments', 'date-range', startDate, endDate],
    queryFn: () => enrollmentsApi.getEnrollmentsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

/**
 * Hook để đếm số active enrollments trong lớp
 */
export function useCountActiveEnrollmentsInClass(classId: number) {
  return useQuery({
    queryKey: ['enrollments', 'count', 'class', classId, 'active'],
    queryFn: () => enrollmentsApi.countActiveEnrollmentsInClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook để đếm số active enrollments của học sinh
 */
export function useCountActiveEnrollmentsByStudent(studentId: number) {
  return useQuery({
    queryKey: ['enrollments', 'count', 'student', studentId, 'active'],
    queryFn: () => enrollmentsApi.countActiveEnrollmentsByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook để tạo enrollment mới
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnrollmentDto) => enrollmentsApi.createEnrollment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'class', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

/**
 * Hook để cập nhật enrollment
 */
export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnrollmentDto }) =>
      enrollmentsApi.updateEnrollment(id, data),
    onSuccess: (updatedEnrollment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'count'] });
      // Invalidate class and student specific queries
      if (updatedEnrollment.classId) {
        queryClient.invalidateQueries({ queryKey: ['enrollments', 'class', updatedEnrollment.classId] });
        queryClient.invalidateQueries({ queryKey: ['classes', updatedEnrollment.classId] });
      }
      if (updatedEnrollment.studentId) {
        queryClient.invalidateQueries({ queryKey: ['enrollments', 'student', updatedEnrollment.studentId] });
      }
    },
  });
}

/**
 * Hook để xóa enrollment
 */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enrollmentsApi.deleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

