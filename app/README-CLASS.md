# Class Controller API Documentation

## Overview
Quản lý các lớp học trong hệ thống. Mỗi lớp học thuộc một môn học, có thể thuộc một cơ sở và được dạy bởi một giáo viên.

**Base URL:** `/classes`

---

## Endpoints

### 1. Tạo lớp học mới
**POST** `/classes`

**Request Body:**
```json
{
  "name": "Toán 6 - Cơ bản",
  "subjectId": 1,
  "branchId": 1,
  "teacherId": 5,
  "status": "active",
  "baseTuitionFee": 1500000
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Toán 6 - Cơ bản",
  "subjectId": 1,
  "branchId": 1,
  "teacherId": 5,
  "status": "active",
  "baseTuitionFee": 1500000,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Use Case:** Form tạo lớp học mới

---

### 2. Lấy tất cả lớp học
**GET** `/classes`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "subjectId": 1,
    "subject": {
      "id": 1,
      "name": "Toán"
    },
    "branchId": 1,
    "teacherId": 5,
    "status": "active",
    "baseTuitionFee": 1500000,
    "schedules": [...]
  }
]
```

**Use Case:** 
- Bảng danh sách lớp học
- Dropdown chọn lớp học

---

### 3. Lấy các lớp đang active
**GET** `/classes/active`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "status": "active",
    "baseTuitionFee": 1500000
  }
]
```

**Use Case:** 
- Filter chỉ hiển thị lớp đang hoạt động
- Dropdown chọn lớp để đăng ký (chỉ active)

---

### 4. Lấy lớp học theo môn học
**GET** `/classes/by-subject/:subjectId`

**Path Parameters:**
- `subjectId` (number): ID của môn học

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "subjectId": 1,
    "baseTuitionFee": 1500000
  },
  {
    "id": 2,
    "name": "Toán 7 - Nâng cao",
    "subjectId": 1,
    "baseTuitionFee": 2000000
  }
]
```

**Use Case:** 
- Khi chọn môn học, hiển thị danh sách lớp của môn đó
- Filter lớp học theo môn học

---

### 5. Lấy lớp học theo cơ sở
**GET** `/classes/by-branch/:branchId`

**Path Parameters:**
- `branchId` (number): ID của cơ sở

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "branchId": 1,
    "baseTuitionFee": 1500000
  }
]
```

**Use Case:** 
- Trang quản lý lớp học theo cơ sở
- Filter lớp học theo cơ sở

---

### 6. Lấy lớp học theo giáo viên
**GET** `/classes/by-teacher/:teacherId`

**Path Parameters:**
- `teacherId` (number): ID của giáo viên

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "teacherId": 5,
    "baseTuitionFee": 1500000
  }
]
```

**Use Case:** 
- Trang lịch dạy của giáo viên
- Danh sách lớp do giáo viên phụ trách

---

### 7. Lấy lớp học theo trạng thái
**GET** `/classes/by-status?status=active`

**Query Parameters:**
- `status` (string): Trạng thái lớp học (`active`, `inactive`, `archived`)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Toán 6 - Cơ bản",
    "status": "active"
  }
]
```

**Use Case:** 
- Filter lớp học theo trạng thái
- Tab/Filter: Active, Inactive, Archived

---

### 8. Lấy thông tin lớp học theo ID
**GET** `/classes/:id`

**Path Parameters:**
- `id` (number): ID của lớp học

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Toán 6 - Cơ bản",
  "subjectId": 1,
  "subject": {
    "id": 1,
    "name": "Toán"
  },
  "branchId": 1,
  "teacherId": 5,
  "status": "active",
  "baseTuitionFee": 1500000,
  "schedules": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "startTime": "08:00:00",
      "endTime": "09:30:00"
    }
  ],
  "enrollments": [
    {
      "id": 1,
      "studentId": 1,
      "student": {
        "id": 1,
        "fullName": "Nguyễn Văn An"
      }
    }
  ]
}
```

**Use Case:** 
- Trang chi tiết lớp học
- Form chỉnh sửa lớp học
- Hiển thị lịch học và danh sách học sinh

---

### 9. Cập nhật lớp học
**PATCH** `/classes/:id`

**Path Parameters:**
- `id` (number): ID của lớp học

**Request Body:** (Tất cả fields đều optional)
```json
{
  "name": "Toán 6 - Cơ bản (Cập nhật)",
  "baseTuitionFee": 1600000,
  "status": "inactive"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Toán 6 - Cơ bản (Cập nhật)",
  "baseTuitionFee": 1600000,
  "status": "inactive",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Use Case:** Form chỉnh sửa lớp học

---

### 10. Xóa lớp học
**DELETE** `/classes/:id`

**Path Parameters:**
- `id` (number): ID của lớp học

**Response:** `204 No Content`

**Use Case:** Nút xóa trong bảng danh sách (có confirm dialog)

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Class with ID 999 not found",
  "error": "Not Found"
}
```

### 400 Bad Request (Invalid subject)
```json
{
  "statusCode": 400,
  "message": "Subject with ID 999 not found",
  "error": "Bad Request"
}
```

---

## Frontend UI Suggestions

### 1. Trang Quản Lý Lớp Học
- **Bảng danh sách:**
  - Columns: Tên lớp, Môn học, Giáo viên, Cơ sở, Học phí, Trạng thái, Số học sinh, Actions
  - Pagination
  - Sortable columns
- **Filters:**
  - Dropdown chọn môn học
  - Dropdown chọn cơ sở
  - Dropdown chọn giáo viên
  - Tabs/Buttons: Tất cả, Active, Inactive, Archived
- **Search:** Tìm kiếm theo tên lớp
- **Actions:**
  - View detail (icon mắt)
  - Edit (icon bút)
  - Delete (icon thùng rác với confirm)
  - Toggle status (Active/Inactive)

### 2. Form Tạo/Chỉnh Sửa Lớp Học
- **Tên lớp:** Text input (required)
- **Môn học:** 
  - Dropdown/Select (required)
  - Load từ `GET /subjects`
  - Có search trong dropdown
- **Cơ sở:** 
  - Dropdown/Select (optional, default: 1)
  - Load từ danh sách cơ sở
- **Giáo viên:** 
  - Dropdown/Select (optional)
  - Load từ danh sách giáo viên
- **Học phí:** 
  - Number input (required, min: 0)
  - Format: VNĐ với thousand separator
  - Display: 1,500,000 VNĐ
- **Trạng thái:** 
  - Radio buttons hoặc Select
  - Options: Active, Inactive, Archived
  - Default: Active

### 3. Trang Chi Tiết Lớp Học
- **Thông tin cơ bản:** Card hiển thị đầy đủ thông tin lớp
- **Lịch học:** 
  - Bảng lịch học trong tuần
  - Hiển thị: Thứ, Giờ, Phòng
  - Có thể chỉnh sửa lịch học
- **Danh sách học sinh:** 
  - Bảng danh sách học sinh trong lớp
  - Hiển thị: Mã code, Họ tên, Ngày đăng ký, Trạng thái
  - Nút "Thêm học sinh"
- **Thống kê:**
  - Tổng số học sinh
  - Số học sinh active
  - Doanh thu (nếu có)

### 4. Filter Component
- **Multi-select dropdown** cho môn học
- **Single select** cho cơ sở, giáo viên
- **Tabs** cho trạng thái
- **Apply/Clear filters** buttons

---

## Example Frontend Code (React)

```typescript
// Get classes by subject
const getClassesBySubject = async (subjectId: number) => {
  const response = await fetch(`/classes/by-subject/${subjectId}`);
  return response.json();
};

// Get active classes
const getActiveClasses = async () => {
  const response = await fetch('/classes/active');
  return response.json();
};

// Create class
const createClass = async (classData: CreateClassDto) => {
  const response = await fetch('/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
  return response.json();
};

// Update class status
const updateClassStatus = async (id: number, status: ClassStatus) => {
  const response = await fetch(`/classes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return response.json();
};
```

---

## Data Validation Rules

- **name:** Required, max 255 chars
- **subjectId:** Required, must exist in subjects table
- **branchId:** Optional, default: 1
- **teacherId:** Optional
- **status:** Optional, enum: `active`, `inactive`, `archived`, default: `active`
- **baseTuitionFee:** Required, number >= 0, precision: 12, scale: 2

---

## Status Values

- **active:** Lớp đang hoạt động, nhận học sinh mới
- **inactive:** Lớp tạm dừng, không nhận học sinh mới
- **archived:** Lớp đã kết thúc, lưu trữ

