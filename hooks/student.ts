import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types/student';

/**
 * Hook để lấy danh sách tất cả học sinh
 */
export function useStudents() {
    return useQuery({
        queryKey: ['students'],
        queryFn: api.getAllStudents,
    });
}

/**
 * Hook để tìm kiếm học sinh theo tên
 */
export function useSearchStudents(name: string) {
    return useQuery({
        queryKey: ['students', 'search', name],
        queryFn: () => api.searchStudentsByName(name),
        enabled: name.trim().length > 0,
    });
}

/**
 * Hook để lấy thông tin học sinh theo ID
 */
export function useStudent(id: number) {
    return useQuery({
        queryKey: ['students', id],
        queryFn: () => api.getStudentById(id),
        enabled: !!id,
    });
}

/**
 * Hook để lấy học sinh theo mã code
 */
export function useStudentByCode(code: string) {
    return useQuery({
        queryKey: ['students', 'code', code],
        queryFn: () => api.getStudentByCode(code),
        enabled: code.trim().length > 0,
    });
}

/**
 * Hook để lấy học sinh theo số điện thoại phụ huynh
 */
export function useStudentsByPhone(phone: string) {
    return useQuery({
        queryKey: ['students', 'phone', phone],
        queryFn: () => api.getStudentsByPhone(phone),
        enabled: phone.trim().length > 0,
    });
}

/**
 * Hook để tạo học sinh mới
 */
export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStudentDto) => api.createStudent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

/**
 * Hook để cập nhật thông tin học sinh
 */
export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateStudentDto }) =>
            api.updateStudent(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
        },
    });
}

/**
 * Hook để xóa học sinh
 */
export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.deleteStudent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

