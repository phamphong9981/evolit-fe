# Student Controller API Documentation

## Overview
Quản lý thông tin học sinh trong hệ thống. Hỗ trợ tìm kiếm theo tên, code, và số điện thoại phụ huynh.

**Base URL:** `/students`

---

## Endpoints

### 1. Tạo học sinh mới
**POST** `/students`

**Request Body:**
```json
{
  "code": "STU000001",
  "fullName": "Nguyễn Văn An",
  "dob": "2010-05-15",
  "parentName": "Nguyễn Văn Bố",
  "parentPhone": "0912345678",
  "currentSchool": "THCS Nguyễn Du"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "code": "STU000001",
  "fullName": "Nguyễn Văn An",
  "dob": "2010-05-15",
  "parentName": "Nguyễn Văn Bố",
  "parentPhone": "0912345678",
  "currentSchool": "THCS Nguyễn Du",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Use Case:** Form đăng ký học sinh mới

---

### 2. Lấy tất cả học sinh
**GET** `/students`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "code": "STU000001",
    "fullName": "Nguyễn Văn An",
    "dob": "2010-05-15",
    "parentName": "Nguyễn Văn Bố",
    "parentPhone": "0912345678",
    "currentSchool": "THCS Nguyễn Du",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Use Case:** 
- Bảng danh sách học sinh
- Dropdown chọn học sinh

---

### 3. Tìm kiếm học sinh theo tên
**GET** `/students/search?name=An`

**Query Parameters:**
- `name` (string): Tên học sinh cần tìm (case-insensitive, partial match)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "code": "STU000001",
    "fullName": "Nguyễn Văn An",
    "dob": "2010-05-15",
    "parentName": "Nguyễn Văn Bố",
    "parentPhone": "0912345678",
    "currentSchool": "THCS Nguyễn Du"
  }
]
```

**Use Case:** 
- Search box trong trang quản lý học sinh
- Auto-complete khi tìm kiếm học sinh
- Real-time search khi gõ tên

---

### 4. Tìm học sinh theo mã code
**GET** `/students/by-code/:code`

**Path Parameters:**
- `code` (string): Mã code của học sinh (ví dụ: "STU000001")

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "STU000001",
  "fullName": "Nguyễn Văn An",
  "dob": "2010-05-15",
  "parentName": "Nguyễn Văn Bố",
  "parentPhone": "0912345678",
  "currentSchool": "THCS Nguyễn Du",
  "enrollments": [...]
}
```

**Use Case:** 
- Tìm kiếm nhanh bằng mã code
- QR code scanner để tìm học sinh
- Input field với validation code format

---

### 5. Tìm học sinh theo số điện thoại phụ huynh
**GET** `/students/by-phone/:phone`

**Path Parameters:**
- `phone` (string): Số điện thoại phụ huynh

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "code": "STU000001",
    "fullName": "Nguyễn Văn An",
    "parentPhone": "0912345678"
  },
  {
    "id": 5,
    "code": "STU000005",
    "fullName": "Nguyễn Thị Bình",
    "parentPhone": "0912345678"
  }
]
```

**Use Case:** 
- Tìm tất cả học sinh có cùng phụ huynh
- Form tìm kiếm theo số điện thoại

---

### 6. Lấy thông tin học sinh theo ID
**GET** `/students/:id`

**Path Parameters:**
- `id` (number): ID của học sinh

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "STU000001",
  "fullName": "Nguyễn Văn An",
  "dob": "2010-05-15",
  "parentName": "Nguyễn Văn Bố",
  "parentPhone": "0912345678",
  "currentSchool": "THCS Nguyễn Du",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "enrollments": [
    {
      "id": 1,
      "classId": 1,
      "startDate": "2024-01-01",
      "status": "active"
    }
  ]
}
```

**Use Case:** 
- Trang chi tiết học sinh
- Form chỉnh sửa thông tin học sinh
- Hiển thị lịch sử đăng ký học

---

### 7. Cập nhật thông tin học sinh
**PATCH** `/students/:id`

**Path Parameters:**
- `id` (number): ID của học sinh

**Request Body:** (Tất cả fields đều optional)
```json
{
  "fullName": "Nguyễn Văn An Cập nhật",
  "parentPhone": "0987654321",
  "currentSchool": "THCS Lê Lợi"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "STU000001",
  "fullName": "Nguyễn Văn An Cập nhật",
  "parentPhone": "0987654321",
  "currentSchool": "THCS Lê Lợi",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Use Case:** Form chỉnh sửa thông tin học sinh

---

### 8. Xóa học sinh
**DELETE** `/students/:id`

**Path Parameters:**
- `id` (number): ID của học sinh

**Response:** `204 No Content`

**Use Case:** Nút xóa trong bảng danh sách (có confirm dialog)

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Student with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict (Duplicate code)
```json
{
  "statusCode": 409,
  "message": "Student with code \"STU000001\" already exists",
  "error": "Conflict"
}
```

---

## Frontend UI Suggestions

### 1. Trang Quản Lý Học Sinh
- **Bảng danh sách:** 
  - Columns: Mã code, Họ tên, Ngày sinh, Phụ huynh, SĐT, Trường, Actions
  - Pagination nếu có nhiều học sinh
  - Sortable columns
- **Search Box:** 
  - Tìm kiếm theo tên (real-time với debounce)
  - Tìm kiếm theo mã code
  - Tìm kiếm theo số điện thoại
- **Filter:** 
  - Filter theo trường học
  - Filter theo năm sinh
- **Actions:** 
  - View detail (icon mắt)
  - Edit (icon bút)
  - Delete (icon thùng rác với confirm)

### 2. Form Tạo/Chỉnh Sửa Học Sinh
- **Mã code:** 
  - Auto-generate hoặc manual input
  - Format: STU000001, STU000002...
  - Validation: Unique, required
- **Họ và tên:** Text input (required)
- **Ngày sinh:** Date picker (optional)
- **Tên phụ huynh:** Text input (optional)
- **Số điện thoại phụ huynh:** 
  - Phone input với format validation
  - Pattern: 0[0-9]{9,10}
- **Trường hiện tại:** 
  - Text input hoặc dropdown
  - Có thể autocomplete từ danh sách trường

### 3. Trang Chi Tiết Học Sinh
- **Thông tin cơ bản:** Card hiển thị đầy đủ thông tin
- **Lịch sử đăng ký:** 
  - Bảng các lớp đã đăng ký
  - Hiển thị: Tên lớp, Ngày bắt đầu, Trạng thái
- **Actions:** 
  - Nút "Chỉnh sửa"
  - Nút "Đăng ký lớp mới"
  - Nút "Xóa"

### 4. Search/Auto-complete Component
- Input field với debounce (300-500ms)
- Dropdown hiển thị kết quả tìm kiếm
- Highlight matching text
- Click để chọn học sinh

---

## Example Frontend Code (React)

```typescript
// Search students by name
const searchStudents = async (name: string) => {
  const response = await fetch(`/students/search?name=${encodeURIComponent(name)}`);
  return response.json();
};

// Find student by code
const findStudentByCode = async (code: string) => {
  const response = await fetch(`/students/by-code/${code}`);
  return response.json();
};

// Create student
const createStudent = async (studentData: CreateStudentDto) => {
  const response = await fetch('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });
  return response.json();
};

// Update student
const updateStudent = async (id: number, data: Partial<Student>) => {
  const response = await fetch(`/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

---

## Data Validation Rules

- **code:** Required, unique, max 50 chars, format: STU + 6 digits
- **fullName:** Required, max 255 chars
- **dob:** Optional, valid date format (YYYY-MM-DD)
- **parentName:** Optional, max 255 chars
- **parentPhone:** Optional, max 20 chars, pattern: digits, +, -, spaces, parentheses
- **currentSchool:** Optional, max 255 chars

