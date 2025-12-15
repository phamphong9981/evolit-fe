import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentClassesApi } from './api/student-classes';
import type { CreateStudentClassDto, BulkCreateStudentClassDto } from '@/types/student-class';

/**
 * Hook để lấy tất cả student-class assignments
 */
export function useStudentClasses() {
  return useQuery({
    queryKey: ['student-classes'],
    queryFn: studentClassesApi.getAllStudentClasses,
  });
}

/**
 * Hook để lấy thông tin student-class theo ID
 */
export function useStudentClass(id: number) {
  return useQuery({
    queryKey: ['student-classes', id],
    queryFn: () => studentClassesApi.getStudentClassById(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy các lớp của học sinh
 */
export function useClassesByStudent(studentId: number) {
  return useQuery({
    queryKey: ['student-classes', 'student', studentId],
    queryFn: () => studentClassesApi.getClassesByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook để lấy danh sách học sinh trong lớp
 */
export function useStudentsByClass(classId: number) {
  return useQuery({
    queryKey: ['student-classes', 'class', classId],
    queryFn: () => studentClassesApi.getStudentsByClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook để đếm số học sinh trong lớp
 */
export function useCountStudentsInClass(classId: number) {
  return useQuery({
    queryKey: ['student-classes', 'count', 'class', classId],
    queryFn: () => studentClassesApi.countStudentsInClass(classId),
    enabled: !!classId,
  });
}

/**
 * Hook để đếm số lớp của học sinh
 */
export function useCountClassesByStudent(studentId: number) {
  return useQuery({
    queryKey: ['student-classes', 'count', 'student', studentId],
    queryFn: () => studentClassesApi.countClassesByStudent(studentId),
    enabled: !!studentId,
  });
}

/**
 * Hook để thêm học sinh vào lớp
 */
export function useCreateStudentClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentClassDto) => studentClassesApi.createStudentClass(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'class', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

/**
 * Hook để thêm nhiều học sinh vào lớp cùng lúc
 */
export function useBulkCreateStudentClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateStudentClassDto) => studentClassesApi.bulkCreateStudentClasses(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'class', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

/**
 * Hook để xóa học sinh khỏi lớp
 */
export function useDeleteStudentClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentClassesApi.deleteStudentClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

/**
 * Hook để xóa học sinh khỏi lớp (by student and class)
 */
export function useDeleteStudentClassByStudentAndClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, classId }: { studentId: number; classId: number }) =>
      studentClassesApi.deleteStudentClassByStudentAndClass(studentId, classId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'class', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes', variables.classId] });
    },
  });
}

/**
 * Hook để xóa tất cả học sinh khỏi lớp
 */
export function useDeleteAllStudentsFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: number) => studentClassesApi.deleteAllStudentsFromClass(classId),
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({ queryKey: ['student-classes'] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'class', classId] });
      queryClient.invalidateQueries({ queryKey: ['student-classes', 'count'] });
      queryClient.invalidateQueries({ queryKey: ['classes', classId] });
    },
  });
}

