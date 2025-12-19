'use client';

import { useState, useEffect } from 'react';
import type { Class, CreateClassDto, UpdateClassDto, ClassStatus, ClassType, CreateScheduleDto } from '@/types/class';
import { X, Plus, Trash2 } from 'lucide-react';

interface ClassFormProps {
  classData?: Class | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassDto | UpdateClassDto) => Promise<void>;
}

const STATUS_OPTIONS: { value: ClassStatus; label: string }[] = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'archived', label: 'Đã kết thúc' },
];

const DAY_OPTIONS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
];

const CLASS_TYPE_OPTIONS: { value: ClassType; label: string }[] = [
  { value: 'regular', label: 'Thường' },
  { value: 'vip', label: 'VIP' },
  { value: 'vip_1_1', label: 'VIP 1-1' },
];

export function ClassForm({ classData, isOpen, onClose, onSubmit }: ClassFormProps) {
  const [formData, setFormData] = useState<CreateClassDto>({
    name: '',
    subjectId: 0,
    branchId: 1,
    teacherId: undefined,
    status: 'active',
    baseTuitionFee: 0,
    type: 'regular',
    schedules: [],
  });
  const [schedules, setSchedules] = useState<CreateScheduleDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        subjectId: classData.subjectId,
        branchId: classData.branchId || 1,
        teacherId: classData.teacherId,
        status: classData.status,
        baseTuitionFee: classData.baseTuitionFee,
        type: classData.type,
        schedules: [],
      });
      // Load existing schedules
      if (classData.schedules && classData.schedules.length > 0) {
        setSchedules(
          classData.schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime.substring(0, 5), // Convert HH:mm:ss to HH:mm
            endTime: schedule.endTime.substring(0, 5),
            roomId: (schedule as any).roomId,
          }))
        );
      } else {
        setSchedules([]);
      }
    } else {
      setFormData({
        name: '',
        subjectId: 0,
        branchId: 1,
        teacherId: undefined,
        status: 'active',
        baseTuitionFee: 0,
        type: 'regular',
        schedules: [],
      });
      setSchedules([]);
    }
    setError(null);
  }, [classData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Convert schedules: HH:mm -> HH:mm:ss
      const formattedSchedules: CreateScheduleDto[] = schedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.length === 5 ? `${schedule.startTime}:00` : schedule.startTime,
        endTime: schedule.endTime.length === 5 ? `${schedule.endTime}:00` : schedule.endTime,
        roomId: schedule.roomId,
      }));

      if (classData) {
        const submitData: UpdateClassDto = {
          name: formData.name,
          subjectId: formData.subjectId || undefined,
          branchId: formData.branchId || undefined,
          teacherId: formData.teacherId,
          status: formData.status,
          baseTuitionFee: formData.baseTuitionFee || undefined,
          type: formData.type,
          schedules: formattedSchedules.length > 0 ? formattedSchedules : undefined,
        };
        await onSubmit(submitData);
      } else {
        const submitData: CreateClassDto = {
          name: formData.name,
          subjectId: formData.subjectId,
          branchId: formData.branchId || 1,
          teacherId: formData.teacherId,
          status: formData.status || 'active',
          baseTuitionFee: formData.baseTuitionFee,
          type: formData.type,
          schedules: formattedSchedules.length > 0 ? formattedSchedules : undefined,
        };
        await onSubmit(submitData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        roomId: undefined,
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof CreateScheduleDto, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header - Fixed */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {classData ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Toán 6 - Cơ bản"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="subjectId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="subjectId"
                  required
                  min="1"
                  value={formData.subjectId || ''}
                  onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) || 0 })}
                  placeholder="ID môn học"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Tạm thời nhập ID môn học. Sẽ được thay bằng dropdown sau.
                </p>
              </div>

              <div>
                <label htmlFor="branchId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Cơ sở
                </label>
                <input
                  type="number"
                  id="branchId"
                  min="1"
                  value={formData.branchId || ''}
                  onChange={(e) => setFormData({ ...formData, branchId: parseInt(e.target.value) || 1 })}
                  placeholder="ID cơ sở"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="teacherId" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Giáo viên
                </label>
                <input
                  type="number"
                  id="teacherId"
                  min="1"
                  value={formData.teacherId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teacherId: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="ID giáo viên (tùy chọn)"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="baseTuitionFee" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Học phí (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="baseTuitionFee"
                  required
                  value={formatCurrency(formData.baseTuitionFee)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseTuitionFee: parseCurrency(e.target.value),
                    })
                  }
                  placeholder="1,500,000"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Loại lớp <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ClassType })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                >
                  {CLASS_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedules Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Lịch học
                  </label>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm lịch
                  </button>
                </div>

                {schedules.length === 0 ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    Chưa có lịch học. Nhấn "Thêm lịch" để thêm lịch học cho lớp.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                          {/* Day of Week */}
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Thứ
                            </label>
                            <select
                              value={schedule.dayOfWeek}
                              onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            >
                              {DAY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Start Time */}
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Giờ bắt đầu
                            </label>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                          </div>

                          {/* End Time */}
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Giờ kết thúc
                            </label>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                          </div>

                          {/* Room ID */}
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              Phòng
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={schedule.roomId || ''}
                              onChange={(e) =>
                                updateSchedule(
                                  index,
                                  'roomId',
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                              placeholder="ID"
                              className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                            />
                          </div>

                          {/* Remove Button */}
                          <div className="flex items-end sm:col-span-1">
                            <button
                              type="button"
                              onClick={() => removeSchedule(index)}
                              className="w-full rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Xóa lịch học"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? 'Đang lưu...' : classData ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

