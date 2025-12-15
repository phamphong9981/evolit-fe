import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Class, CreateClassDto, UpdateClassDto, ClassStatus } from '@/types/class';

/**
 * Hook để lấy danh sách tất cả lớp học
 */
export function useClasses() {
    return useQuery({
        queryKey: ['classes'],
        queryFn: api.getAllClasses,
    });
}

/**
 * Hook để lấy các lớp đang active
 */
export function useActiveClasses() {
    return useQuery({
        queryKey: ['classes', 'active'],
        queryFn: api.getActiveClasses,
    });
}

/**
 * Hook để lấy thông tin lớp học theo ID
 */
export function useClass(id: number) {
    return useQuery({
        queryKey: ['classes', id],
        queryFn: () => api.getClassById(id),
        enabled: !!id,
    });
}

/**
 * Hook để lấy lớp học theo môn học
 */
export function useClassesBySubject(subjectId: number) {
    return useQuery({
        queryKey: ['classes', 'subject', subjectId],
        queryFn: () => api.getClassesBySubject(subjectId),
        enabled: !!subjectId,
    });
}

/**
 * Hook để lấy lớp học theo cơ sở
 */
export function useClassesByBranch(branchId: number) {
    return useQuery({
        queryKey: ['classes', 'branch', branchId],
        queryFn: () => api.getClassesByBranch(branchId),
        enabled: !!branchId,
    });
}

/**
 * Hook để lấy lớp học theo giáo viên
 */
export function useClassesByTeacher(teacherId: number) {
    return useQuery({
        queryKey: ['classes', 'teacher', teacherId],
        queryFn: () => api.getClassesByTeacher(teacherId),
        enabled: !!teacherId,
    });
}

/**
 * Hook để lấy lớp học theo trạng thái
 */
export function useClassesByStatus(status: ClassStatus) {
    return useQuery({
        queryKey: ['classes', 'status', status],
        queryFn: () => api.getClassesByStatus(status),
        enabled: !!status,
    });
}

/**
 * Hook để tạo lớp học mới
 */
export function useCreateClass() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateClassDto) => api.createClass(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });
}

/**
 * Hook để cập nhật lớp học
 */
export function useUpdateClass() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateClassDto }) =>
            api.updateClass(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['classes', variables.id] });
        },
    });
}

/**
 * Hook để xóa lớp học
 */
export function useDeleteClass() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.deleteClass(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
        },
    });
}

