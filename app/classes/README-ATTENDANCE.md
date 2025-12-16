# Attendance Controller API Documentation

## Overview
Quản lý điểm danh học sinh cho các lớp học. Hỗ trợ giáo viên điểm danh, theo dõi trạng thái (có mặt, vắng có phép, vắng không phép, muộn) và quản lý trạng thái reconciled (đã chốt sổ).

**Base URL:** `/attendances`

**Lưu ý:** 
- Attendance records có trạng thái `isReconciled` để đánh dấu đã chốt sổ tài chính
- Khi `isReconciled = true`, bản ghi bị khóa và không thể chỉnh sửa
- Status của attendance: `PRESENT`, `ABSENT_WITH_PERMISSION`, `ABSENT_NO_PERMISSION`, `LATE`, `DRAFT`

---

## Endpoints

### 1. Submit Attendance (Giáo viên điểm danh)
**POST** `/attendances/submit`

**Mô tả:** Giáo viên điểm danh cho một lớp vào một ngày cụ thể. API này chỉ lưu trạng thái điểm danh, không đụng vào `student_wallets`. Tất cả bản ghi được tạo với `isReconciled = false`.

**Request Body:**
```json
{
  "classId": 5,
  "date": "2024-01-15",
  "students": [
    {
      "studentId": 1,
      "status": "PRESENT",
      "note": "Đúng giờ"
    },
    {
      "studentId": 2,
      "status": "ABSENT_WITH_PERMISSION",
      "note": "Có phép, bị ốm"
    },
    {
      "studentId": 3,
      "status": "LATE",
      "note": "Đến muộn 10 phút"
    },
    {
      "studentId": 4,
      "status": "ABSENT_NO_PERMISSION",
      "note": "Không có lý do"
    }
  ]
}
```

**Validation Rules:**
- `classId`: Required, must exist in classes table
- `date`: Required, must be in YYYY-MM-DD format
- `date`: Must match one of the class schedule days (dayOfWeek)
- `students`: Required array, at least 1 student
- `students[].studentId`: Required, must exist in students table
- `students[].status`: Required, must be one of: `PRESENT`, `ABSENT_WITH_PERMISSION`, `ABSENT_NO_PERMISSION`, `LATE`
- `students[].note`: Optional string

**Response:** `201 Created`
```json
[
  {
    "id": 1,
    "classId": 5,
    "studentId": 1,
    "student": {
      "id": 1,
      "fullName": "Nguyễn Văn An",
      "code": "STU000001"
    },
    "class": {
      "id": 5,
      "name": "Toán 9 - Luyện thi"
    },
    "date": "2024-01-15",
    "status": "PRESENT",
    "note": "Đúng giờ",
    "isReconciled": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": 2,
    "classId": 5,
    "studentId": 2,
    "student": {
      "id": 2,
      "fullName": "Trần Thị Bình",
      "code": "STU000002"
    },
    "class": {
      "id": 5,
      "name": "Toán 9 - Luyện thi"
    },
    "date": "2024-01-15",
    "status": "ABSENT_WITH_PERMISSION",
    "note": "Có phép, bị ốm",
    "isReconciled": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
]
```

**Use Cases:**
- Giáo viên điểm danh hàng ngày
- Cập nhật điểm danh nếu đã có bản ghi (chỉ khi `isReconciled = false`)
- Bulk điểm danh nhiều học sinh cùng lúc

**Error Responses:**

**400 Bad Request - Class has no schedule:**
```json
{
  "statusCode": 400,
  "message": "Class 5 has no schedule defined",
  "error": "Bad Request"
}
```

**400 Bad Request - Date doesn't match schedule:**
```json
{
  "statusCode": 400,
  "message": "Date 2024-01-15 (1) does not match class schedule.",
  "error": "Bad Request"
}
```

**400 Bad Request - Invalid student IDs:**
```json
{
  "statusCode": 400,
  "message": "One or more student IDs are invalid",
  "error": "Bad Request"
}
```

**400 Bad Request - Attendance is locked:**
```json
{
  "statusCode": 400,
  "message": "Cannot update attendance for student 1 because it has been finalized/locked.",
  "error": "Bad Request"
}
```

**404 Not Found - Class not found:**
```json
{
  "statusCode": 404,
  "message": "Class with ID 999 not found",
  "error": "Not Found"
}
```

---

### 2. Get Attendances by Class and Date
**GET** `/attendances/by-class-and-date?classId=5&date=2024-01-15`

**Mô tả:** Lấy danh sách điểm danh của một lớp vào một ngày cụ thể.

**Query Parameters:**
- `classId` (number, required): ID của lớp học
- `date` (string, required): Ngày điểm danh (YYYY-MM-DD format)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "classId": 5,
    "studentId": 1,
    "student": {
      "id": 1,
      "fullName": "Nguyễn Văn An",
      "code": "STU000001",
      "dob": "2010-05-15",
      "parentName": "Nguyễn Văn Bố",
      "parentPhone": "0912345678"
    },
    "date": "2024-01-15",
    "status": "PRESENT",
    "note": "Đúng giờ",
    "isReconciled": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": 2,
    "classId": 5,
    "studentId": 2,
    "student": {
      "id": 2,
      "fullName": "Trần Thị Bình",
      "code": "STU000002"
    },
    "date": "2024-01-15",
    "status": "ABSENT_WITH_PERMISSION",
    "note": "Có phép, bị ốm",
    "isReconciled": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": 3,
    "classId": 5,
    "studentId": 3,
    "student": {
      "id": 3,
      "fullName": "Lê Văn Cường",
      "code": "STU000003"
    },
    "date": "2024-01-15",
    "status": "LATE",
    "note": "Đến muộn 10 phút",
    "isReconciled": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
]
```

**Use Cases:**
- Xem danh sách điểm danh của lớp trong một ngày
- Hiển thị bảng điểm danh cho giáo viên
- Kiểm tra trạng thái điểm danh trước khi submit
- Export báo cáo điểm danh theo ngày

**Empty Response:** `200 OK`
```json
[]
```
(Trả về mảng rỗng nếu chưa có điểm danh cho ngày đó)

**Error Responses:**

**400 Bad Request - Invalid date format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Frontend UI Suggestions

### 1. Form Điểm Danh (Submit Attendance)

**Layout:**
- **Header:**
  - Tên lớp (read-only, từ context)
  - Ngày điểm danh: Date picker (default: today)
  - Button "Kiểm tra lịch học" để validate ngày
- **Bảng danh sách học sinh:**
  - Columns: Mã code, Họ tên, Trạng thái, Ghi chú, Actions
  - Mỗi row có dropdown chọn status và input note
  - Bulk actions: "Tất cả có mặt", "Tất cả vắng có phép"
- **Status Options:**
  - PRESENT (Có mặt) - Badge màu xanh
  - ABSENT_WITH_PERMISSION (Vắng có phép) - Badge màu vàng
  - ABSENT_NO_PERMISSION (Vắng không phép) - Badge màu đỏ
  - LATE (Muộn) - Badge màu cam
- **Validation:**
  - Disable submit nếu ngày không khớp với lịch học
  - Hiển thị warning nếu có học sinh đã bị locked
- **Actions:**
  - "Lưu điểm danh" (button primary)
  - "Hủy" (button secondary)

### 2. Bảng Điểm Danh Theo Ngày (By Class and Date)

**Layout:**
- **Header:**
  - Dropdown chọn lớp
  - Date picker chọn ngày
  - Button "Tải lại"
- **Bảng danh sách:**
  - Columns: STT, Mã code, Họ tên, Trạng thái, Ghi chú, Ngày tạo, Actions
  - Sortable columns
  - Filter by status (dropdown)
  - Search by student name/code
- **Status Badges:**
  - PRESENT: Badge xanh với icon check
  - ABSENT_WITH_PERMISSION: Badge vàng với icon warning
  - ABSENT_NO_PERMISSION: Badge đỏ với icon X
  - LATE: Badge cam với icon clock
- **Locked Indicator:**
  - Hiển thị icon khóa nếu `isReconciled = true`
  - Disable edit button nếu locked
- **Empty State:**
  - "Chưa có điểm danh cho ngày này"
  - Button "Điểm danh ngay"
- **Actions:**
  - "Chỉnh sửa" (icon bút, chỉ khi chưa locked)
  - "Xem chi tiết" (icon mắt)
  - "Xuất Excel" (button)

---

## Example Frontend Code (React)

```typescript
// Submit attendance
const submitAttendance = async (classId: number, date: string, students: StudentAttendanceDto[]) => {
  const response = await fetch('/attendances/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classId,
      date,
      students,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Get attendances by class and date
const getAttendancesByClassAndDate = async (classId: number, date: string) => {
  const response = await fetch(
    `/attendances/by-class-and-date?classId=${classId}&date=${date}`
  );
  return response.json();
};

// Usage example
const handleSubmitAttendance = async () => {
  try {
    const students = [
      { studentId: 1, status: 'PRESENT', note: 'Đúng giờ' },
      { studentId: 2, status: 'ABSENT_WITH_PERMISSION', note: 'Có phép' },
    ];
    
    const result = await submitAttendance(5, '2024-01-15', students);
    console.log('Attendance submitted:', result);
    // Show success message
  } catch (error) {
    console.error('Error submitting attendance:', error);
    // Show error message
  }
};

// Load attendance for a specific date
const loadAttendance = async (classId: number, date: string) => {
  try {
    const attendances = await getAttendancesByClassAndDate(classId, date);
    setAttendanceList(attendances);
  } catch (error) {
    console.error('Error loading attendance:', error);
  }
};
```

---

## Status Values

- **PRESENT**: Học sinh có mặt
- **ABSENT_WITH_PERMISSION**: Vắng có phép (có lý do chính đáng)
- **ABSENT_NO_PERMISSION**: Vắng không phép (không có lý do)
- **LATE**: Đến muộn
- **DRAFT**: Bản nháp (tạm thời, có thể thay đổi)

---

## Business Rules

1. **Date Validation:**
   - Ngày điểm danh phải khớp với một trong các ngày học trong lịch của lớp
   - Day of week (0-6) của ngày phải match với `dayOfWeek` trong `class_schedules`

2. **Locked Records:**
   - Khi `isReconciled = true`, bản ghi bị khóa
   - Không thể update hoặc delete bản ghi đã locked
   - Chỉ có thể xem (read-only)

3. **Unique Constraint:**
   - Mỗi học sinh chỉ có 1 bản ghi điểm danh cho mỗi lớp mỗi ngày
   - Nếu submit lại, sẽ update bản ghi cũ (nếu chưa locked)

4. **Bulk Operations:**
   - Có thể điểm danh nhiều học sinh cùng lúc
   - API tự động xử lý create/update cho từng học sinh

5. **No Wallet Impact:**
   - Submit attendance không ảnh hưởng đến `student_wallets`
   - Wallet chỉ được cập nhật khi reconcile (chốt sổ tài chính)

---

## Related Endpoints

- `GET /attendances/unreconciled` - Lấy tất cả điểm danh chưa chốt
- `GET /attendances/unreconciled/by-class/:classId` - Lấy điểm danh chưa chốt theo lớp
- `GET /attendances/unreconciled/by-class-and-date` - Lấy điểm danh chưa chốt theo lớp và ngày
- `PATCH /attendances/:id` - Cập nhật điểm danh (chỉ khi chưa locked)
- `GET /attendances/by-class/:classId` - Lấy tất cả điểm danh của lớp

