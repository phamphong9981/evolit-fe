# Class Controller API Documentation

## Overview
Controller quản lý lớp học (Classes) - đại diện cho một lớp học cụ thể với môn học, giáo viên, và lịch học. Một lớp có thể có nhiều lịch học (schedules) định nghĩa thời gian học trong tuần.

## Base Path
`/api/classes` (hoặc `/classes` tùy cấu hình global prefix)

---

## Endpoints

### 1. Create Class ⭐
**Tạo lớp học mới kèm lịch học**

#### `POST /classes`

**Mô tả:**
- Tạo một lớp học mới
- Có thể tạo kèm lịch học (schedules) ngay trong request
- Tất cả schedules sẽ được tự động gán `classId` của lớp vừa tạo

**Request Body:**
```json
{
  "name": "Toán lớp 5A",
  "subjectId": 1,
  "branchId": 1,
  "teacherId": 5,
  "status": "active",
  "baseTuitionFee": 2000000,
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2
    },
    {
      "dayOfWeek": 3,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2
    },
    {
      "dayOfWeek": 5,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2
    }
  ]
}
```

**Request Fields:**
- `name` (string, required, max: 255): Tên lớp học
- `subjectId` (number, required): ID của môn học
- `branchId` (number, optional, default: 1): ID của chi nhánh
- `teacherId` (number, optional): ID của giáo viên
- `status` (enum, optional, default: "active"): Trạng thái lớp
  - `active`: Đang hoạt động
  - `inactive`: Tạm ngưng
  - `archived`: Đã lưu trữ
- `baseTuitionFee` (number, required, min: 0): Học phí cơ bản
- `schedules` (array, optional): Danh sách lịch học
  - Mỗi schedule object:
    - `dayOfWeek` (number, required, 0-6): Ngày trong tuần
      - `0`: Chủ nhật
      - `1`: Thứ hai
      - `2`: Thứ ba
      - `3`: Thứ tư
      - `4`: Thứ năm
      - `5`: Thứ sáu
      - `6`: Thứ bảy
    - `startTime` (string, required): Giờ bắt đầu (format: `HH:mm:ss`)
    - `endTime` (string, required): Giờ kết thúc (format: `HH:mm:ss`)
      - Phải sau `startTime`
    - `roomId` (number, optional): ID của phòng học

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Toán lớp 5A",
  "subjectId": 1,
  "branchId": 1,
  "teacherId": 5,
  "status": "active",
  "baseTuitionFee": 2000000,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "subject": {
    "id": 1,
    "name": "Toán",
    ...
  },
  "schedules": [
    {
      "id": 1,
      "classId": 1,
      "dayOfWeek": 1,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "classId": 1,
      "dayOfWeek": 3,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": 3,
      "classId": 1,
      "dayOfWeek": 5,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "roomId": 2,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Subject with ID 999 not found"
}
```

```json
{
  "statusCode": 400,
  "message": "End time must be after start time"
}
```

**Validation Errors:**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "subjectId must be a number",
    "baseTuitionFee must not be less than 0",
    "schedules[0].dayOfWeek must not be greater than 6",
    "schedules[0].startTime must be in HH:mm:ss format"
  ]
}
```

**Use Cases:**
- Tạo lớp học mới với lịch học đầy đủ trong một request
- Tạo lớp học trước, sau đó thêm lịch học riêng (nếu không truyền `schedules`)
- Import lớp học từ file với lịch học

**Lưu ý:**
- Nếu không truyền `schedules`, lớp học vẫn được tạo thành công (schedules có thể thêm sau)
- Nếu truyền `schedules` rỗng `[]`, lớp học sẽ không có lịch học
- Tất cả schedules sẽ được tự động gán `classId` của lớp vừa tạo
- Không cần truyền `classId` trong mỗi schedule object

---

### 2. Update Class ⭐
**Cập nhật thông tin lớp học và lịch học**

#### `PATCH /classes/:id`

**Mô tả:**
- Cập nhật thông tin lớp học
- Có thể cập nhật lịch học kèm theo
- **Quan trọng**: Nếu truyền `schedules`, tất cả lịch học cũ sẽ bị xóa và thay thế bằng lịch học mới
- Nếu không truyền `schedules`, lịch học hiện tại sẽ được giữ nguyên

**Path Parameters:**
- `id` (number): ID của lớp học

**Request Body:**
```json
{
  "name": "Toán lớp 5A - Nâng cao",
  "teacherId": 6,
  "baseTuitionFee": 2500000,
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "roomId": 3
    },
    {
      "dayOfWeek": 3,
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "roomId": 3
    }
  ]
}
```

**Request Fields:**
- Tất cả các field đều optional (partial update)
- `name` (string, optional, max: 255): Tên lớp học
- `subjectId` (number, optional): ID của môn học
- `branchId` (number, optional): ID của chi nhánh
- `teacherId` (number, optional): ID của giáo viên
- `status` (enum, optional): Trạng thái lớp
- `baseTuitionFee` (number, optional, min: 0): Học phí cơ bản
- `schedules` (array, optional): Danh sách lịch học mới
  - **Lưu ý quan trọng**: 
    - Nếu truyền `schedules` (kể cả mảng rỗng `[]`), tất cả lịch học cũ sẽ bị xóa
    - Nếu không truyền `schedules` (undefined), lịch học cũ sẽ được giữ nguyên
    - Nếu truyền `schedules` với dữ liệu, lịch học cũ sẽ bị xóa và thay thế bằng lịch học mới
  - Format giống như trong Create API

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Toán lớp 5A - Nâng cao",
  "subjectId": 1,
  "branchId": 1,
  "teacherId": 6,
  "status": "active",
  "baseTuitionFee": 2500000,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "subject": {
    "id": 1,
    "name": "Toán",
    ...
  },
  "schedules": [
    {
      "id": 4,
      "classId": 1,
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "roomId": 3,
      "createdAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    },
    {
      "id": 5,
      "classId": 1,
      "dayOfWeek": 3,
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "roomId": 3,
      "createdAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Class with ID 999 not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Subject with ID 999 not found"
}
```

```json
{
  "statusCode": 400,
  "message": "End time must be after start time"
}
```

**Use Cases:**
- Cập nhật thông tin lớp học (tên, giáo viên, học phí)
- Thay đổi toàn bộ lịch học của lớp
- Xóa tất cả lịch học (truyền `schedules: []`)
- Chỉ cập nhật thông tin lớp, giữ nguyên lịch học (không truyền `schedules`)

**Lưu ý quan trọng về Schedules:**
1. **Xóa tất cả lịch học**: Truyền `schedules: []`
   ```json
   {
     "name": "Toán lớp 5A",
     "schedules": []
   }
   ```

2. **Giữ nguyên lịch học cũ**: Không truyền field `schedules`
   ```json
   {
     "name": "Toán lớp 5A",
     "teacherId": 6
   }
   ```

3. **Thay thế toàn bộ lịch học**: Truyền `schedules` với dữ liệu mới
   ```json
   {
     "name": "Toán lớp 5A",
     "schedules": [
       { "dayOfWeek": 1, "startTime": "08:00:00", "endTime": "09:30:00" }
     ]
   }
   ```

---

## Schedule Management Examples

### Example 1: Create Class with Schedules
```bash
POST /classes
Content-Type: application/json

{
  "name": "Văn lớp 6B",
  "subjectId": 2,
  "baseTuitionFee": 1800000,
  "schedules": [
    {
      "dayOfWeek": 2,
      "startTime": "14:00:00",
      "endTime": "15:30:00",
      "roomId": 5
    },
    {
      "dayOfWeek": 4,
      "startTime": "14:00:00",
      "endTime": "15:30:00",
      "roomId": 5
    }
  ]
}
```

### Example 2: Update Class - Change Schedules
```bash
PATCH /classes/1
Content-Type: application/json

{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "roomId": 4
    },
    {
      "dayOfWeek": 3,
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "roomId": 4
    },
    {
      "dayOfWeek": 5,
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "roomId": 4
    }
  ]
}
```

### Example 3: Update Class - Remove All Schedules
```bash
PATCH /classes/1
Content-Type: application/json

{
  "schedules": []
}
```

### Example 4: Update Class - Keep Schedules Unchanged
```bash
PATCH /classes/1
Content-Type: application/json

{
  "name": "Toán lớp 5A - Cơ bản",
  "teacherId": 7
}
# Không truyền schedules -> giữ nguyên lịch học cũ
```

---

## React Code Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi } from '../api/class';

interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: number;
}

interface CreateClassData {
  name: string;
  subjectId: number;
  baseTuitionFee: number;
  schedules?: ScheduleItem[];
}

export const CreateClassForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: CreateClassData) => classApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      // Reset form
      setSchedules([]);
    },
  });

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1,
        startTime: '08:00:00',
        endTime: '09:30:00',
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get('name') as string,
      subjectId: Number(formData.get('subjectId')),
      baseTuitionFee: Number(formData.get('baseTuitionFee')),
      schedules: schedules.length > 0 ? schedules : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Tên lớp</label>
        <input name="name" required />
      </div>

      <div>
        <label>Môn học</label>
        <select name="subjectId" required>
          <option value="1">Toán</option>
          <option value="2">Văn</option>
        </select>
      </div>

      <div>
        <label>Học phí</label>
        <input name="baseTuitionFee" type="number" required />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label>Lịch học</label>
          <button
            type="button"
            onClick={addSchedule}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            + Thêm lịch
          </button>
        </div>

        {schedules.map((schedule, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={schedule.dayOfWeek}
              onChange={(e) => {
                const newSchedules = [...schedules];
                newSchedules[index].dayOfWeek = Number(e.target.value);
                setSchedules(newSchedules);
              }}
            >
              <option value={1}>Thứ 2</option>
              <option value={3}>Thứ 4</option>
              <option value={5}>Thứ 6</option>
            </select>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => {
                const newSchedules = [...schedules];
                newSchedules[index].startTime = e.target.value + ':00';
                setSchedules(newSchedules);
              }}
            />
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => {
                const newSchedules = [...schedules];
                newSchedules[index].endTime = e.target.value + ':00';
                setSchedules(newSchedules);
              }}
            />
            <button
              type="button"
              onClick={() => removeSchedule(index)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {createMutation.isPending ? 'Đang tạo...' : 'Tạo lớp'}
      </button>
    </form>
  );
};
```

---

## Integration Notes

1. **Schedules trong Create:**
   - `schedules` là optional - có thể tạo lớp không có lịch học
   - Nếu truyền `schedules`, tất cả schedules sẽ được tạo tự động với `classId` đã được gán
   - Không cần truyền `classId` trong mỗi schedule object

2. **Schedules trong Update:**
   - **Quan trọng**: Nếu truyền `schedules` (kể cả `[]`), tất cả lịch học cũ sẽ bị xóa
   - Để giữ nguyên lịch học cũ, không truyền field `schedules` trong request
   - Để xóa tất cả lịch học, truyền `schedules: []`
   - Để thay thế toàn bộ, truyền `schedules` với dữ liệu mới

3. **Time Format:**
   - Luôn sử dụng format `HH:mm:ss` (24-hour format)
   - Ví dụ: `"08:00:00"`, `"14:30:00"`, `"18:45:00"`

4. **Day of Week:**
   - Sử dụng số từ 0-6
   - `0`: Chủ nhật, `1`: Thứ hai, ..., `6`: Thứ bảy

5. **Validation:**
   - `endTime` phải sau `startTime` (validation ở cả frontend và backend)
   - `dayOfWeek` phải trong khoảng 0-6
   - `startTime` và `endTime` phải đúng format `HH:mm:ss`

6. **Transaction Safety:**
   - Tất cả operations (create class + create schedules) được thực hiện trong transaction
   - Nếu có lỗi, tất cả sẽ được rollback

7. **Response:**
   - Response luôn bao gồm `schedules` array (có thể rỗng)
   - Schedules được sắp xếp theo `dayOfWeek` và `startTime`

