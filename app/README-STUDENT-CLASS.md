# Student Class Controller API Documentation

## Overview
Quản lý danh sách học sinh cố định trong các lớp (roster). Khác với `enrollments` (theo dõi đăng ký học với thời gian và trạng thái), `student-class` chỉ quản lý danh sách học sinh thuộc lớp.

**Base URL:** `/student-classes`

**Lưu ý:** 
- `student-class`: Danh sách học sinh cố định của lớp (roster)
- `enrollments`: Theo dõi đăng ký học với start_date, end_date, status, discount (cho tính học phí)

---

## Endpoints

### 1. Thêm học sinh vào lớp
**POST** `/student-classes`

**Request Body:**
```json
{
  "studentId": 1,
  "classId": 5
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "studentId": 1,
  "classId": 5,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Use Case:** Thêm một học sinh vào lớp

---

### 2. Thêm nhiều học sinh vào lớp cùng lúc (Bulk)
**POST** `/student-classes/bulk`

**Request Body:**
```json
{
  "classId": 5,
  "studentIds": [1, 2, 3, 4, 5]
}
```

**Response:** `201 Created`
```json
[
  {
    "id": 1,
    "studentId": 1,
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "studentId": 2,
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 3,
    "studentId": 3,
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 4,
    "studentId": 4,
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 5,
    "studentId": 5,
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Use Case:** 
- Thêm nhiều học sinh vào lớp cùng lúc
- Import danh sách học sinh từ Excel
- Copy danh sách học sinh từ lớp khác

---

### 3. Lấy tất cả assignments
**GET** `/student-classes`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "studentId": 1,
    "student": {
      "id": 1,
      "fullName": "Nguyễn Văn An",
      "code": "STU000001"
    },
    "classId": 5,
    "class": {
      "id": 5,
      "name": "Toán 9 - Luyện thi",
      "subject": {
        "id": 1,
        "name": "Toán"
      }
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Use Case:** 
- Bảng danh sách tất cả assignments
- Báo cáo

---

### 4. Lấy các lớp của học sinh
**GET** `/student-classes/by-student/:studentId`

**Path Parameters:**
- `studentId` (number): ID của học sinh

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "studentId": 1,
    "classId": 5,
    "class": {
      "id": 5,
      "name": "Toán 9 - Luyện thi",
      "subject": {
        "id": 1,
        "name": "Toán"
      }
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "studentId": 1,
    "classId": 8,
    "class": {
      "id": 8,
      "name": "Văn 9 - Luyện thi",
      "subject": {
        "id": 2,
        "name": "Văn"
      }
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Use Case:** 
- Trang chi tiết học sinh - hiển thị các lớp đang học
- Danh sách lớp của học sinh

---

### 5. Lấy danh sách học sinh trong lớp
**GET** `/student-classes/by-class/:classId`

**Path Parameters:**
- `classId` (number): ID của lớp học

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "studentId": 1,
    "student": {
      "id": 1,
      "fullName": "Nguyễn Văn An",
      "code": "STU000001",
      "dob": "2010-05-15",
      "parentName": "Nguyễn Văn Bố",
      "parentPhone": "0912345678"
    },
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "studentId": 2,
    "student": {
      "id": 2,
      "fullName": "Trần Thị Bình",
      "code": "STU000002"
    },
    "classId": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Use Case:** 
- Trang chi tiết lớp - danh sách học sinh
- Bảng điểm danh
- In danh sách học sinh

---

### 6. Đếm số học sinh trong lớp
**GET** `/student-classes/count/class/:classId`

**Path Parameters:**
- `classId` (number): ID của lớp học

**Response:** `200 OK`
```json
25
```

**Use Case:** 
- Hiển thị số học sinh trong lớp
- Thống kê
- Badge/Indicator

---

### 7. Đếm số lớp của học sinh
**GET** `/student-classes/count/student/:studentId`

**Path Parameters:**
- `studentId` (number): ID của học sinh

**Response:** `200 OK`
```json
3
```

**Use Case:** 
- Hiển thị số lớp đang học
- Thống kê

---

### 8. Lấy thông tin assignment theo ID
**GET** `/student-classes/:id`

**Path Parameters:**
- `id` (number): ID của assignment

**Response:** `200 OK`
```json
{
  "id": 1,
  "studentId": 1,
  "student": {
    "id": 1,
    "fullName": "Nguyễn Văn An"
  },
  "classId": 5,
  "class": {
    "id": 5,
    "name": "Toán 9 - Luyện thi",
    "subject": {
      "id": 1,
      "name": "Toán"
    }
  },
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**Use Case:** Chi tiết assignment

---

### 9. Xóa assignment
**DELETE** `/student-classes/:id`

**Path Parameters:**
- `id` (number): ID của assignment

**Response:** `204 No Content`

**Use Case:** Xóa học sinh khỏi lớp

---

### 10. Xóa học sinh khỏi lớp (by student and class)
**DELETE** `/student-classes/by-student-and-class?studentId=1&classId=5`

**Query Parameters:**
- `studentId` (number): ID của học sinh
- `classId` (number): ID của lớp học

**Response:** `204 No Content`

**Use Case:** 
- Xóa học sinh khỏi lớp trong trang chi tiết lớp
- Xóa lớp khỏi danh sách lớp của học sinh

---

### 11. Xóa tất cả học sinh khỏi lớp
**DELETE** `/student-classes/by-class/:classId`

**Path Parameters:**
- `classId` (number): ID của lớp học

**Response:** `204 No Content`

**Use Case:** 
- Reset danh sách học sinh của lớp
- Xóa và thêm lại danh sách mới

---

### 12. Xóa tất cả lớp của học sinh
**DELETE** `/student-classes/by-student/:studentId`

**Path Parameters:**
- `studentId` (number): ID của học sinh

**Response:** `204 No Content`

**Use Case:** 
- Xóa học sinh khỏi tất cả lớp
- Reset assignments của học sinh

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Student-class assignment with ID 999 not found",
  "error": "Not Found"
}
```

### 400 Bad Request (Invalid student/class)
```json
{
  "statusCode": 400,
  "message": "Student with ID 999 not found",
  "error": "Bad Request"
}
```

### 409 Conflict (Duplicate assignment)
```json
{
  "statusCode": 409,
  "message": "Student is already assigned to this class",
  "error": "Conflict"
}
```

---

## Frontend UI Suggestions

### 1. Trang Quản Lý Danh Sách Học Sinh Trong Lớp
- **Bảng danh sách học sinh:**
  - Columns: Mã code, Họ tên, Ngày sinh, Phụ huynh, SĐT, Ngày thêm, Actions
  - Pagination
  - Sortable columns
- **Search:** Tìm kiếm theo tên, mã code
- **Actions:**
  - "Thêm học sinh" (button - mở modal)
  - "Thêm nhiều học sinh" (button - mở modal bulk)
  - "Xóa khỏi lớp" (icon thùng rác với confirm)
  - "Xóa tất cả" (button với confirm)
- **Thống kê:** 
  - Tổng số học sinh: X
  - Badge hiển thị số lượng

### 2. Modal Thêm Học Sinh Vào Lớp
- **Lớp học:** 
  - Display: Tên lớp (read-only, từ context)
  - Hoặc dropdown nếu thêm từ trang khác
- **Học sinh:** 
  - Multi-select dropdown với search
  - Load từ `GET /students`
  - Hiển thị: Tên + Mã code
  - Có thể search/filter trong dropdown
- **Preview:** Hiển thị danh sách học sinh sẽ được thêm
- **Actions:**
  - "Thêm" (button)
  - "Hủy" (button)

### 3. Modal Thêm Nhiều Học Sinh (Bulk)
- **Lớp học:** Display tên lớp (read-only)
- **Chọn học sinh:**
  - Multi-select với search
  - Checkbox list
  - Có thể select all
- **Preview:** 
  - Hiển thị số lượng học sinh sẽ được thêm
  - List preview
- **Validation:** 
  - Kiểm tra học sinh đã có trong lớp (highlight)
  - Warning nếu có duplicate
- **Actions:**
  - "Thêm tất cả" (button)
  - "Hủy" (button)

### 4. Trang Chi Tiết Lớp - Tab Danh Sách Học Sinh
- **Header:**
  - Tên lớp
  - Số học sinh: X (badge)
  - "Thêm học sinh" (button)
- **Bảng danh sách học sinh:**
  - Columns: Mã code, Họ tên, Ngày sinh, Phụ huynh, SĐT, Actions
  - Empty state: "Chưa có học sinh nào"
- **Actions per row:**
  - "Xem chi tiết" (link đến trang học sinh)
  - "Xóa khỏi lớp" (icon thùng rác với confirm)
- **Bulk actions:**
  - Checkbox select all
  - "Xóa đã chọn" (button)
  - "Xuất danh sách" (button - Excel/PDF)

### 5. Trang Chi Tiết Học Sinh - Tab Lớp Đang Học
- **Bảng các lớp:**
  - Columns: Tên lớp, Môn học, Ngày thêm, Actions
  - Empty state: "Chưa tham gia lớp nào"
- **Actions:**
  - "Thêm lớp" (button - mở modal)
  - "Xóa khỏi lớp" (icon thùng rác với confirm)

### 6. Import Danh Sách Học Sinh
- **Upload file:** 
  - Excel/CSV file
  - Template download
- **Preview:** 
  - Hiển thị dữ liệu từ file
  - Validation errors
- **Mapping:** 
  - Map columns từ file
  - Select class
- **Actions:**
  - "Import" (button)
  - "Hủy" (button)

---

## Example Frontend Code (React)

```typescript
// Get students in class
const getStudentsInClass = async (classId: number) => {
  const response = await fetch(`/student-classes/by-class/${classId}`);
  return response.json();
};

// Get classes of student
const getClassesOfStudent = async (studentId: number) => {
  const response = await fetch(`/student-classes/by-student/${studentId}`);
  return response.json();
};

// Add student to class
const addStudentToClass = async (studentId: number, classId: number) => {
  const response = await fetch('/student-classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, classId }),
  });
  return response.json();
};

// Add multiple students to class (bulk)
const addStudentsToClass = async (classId: number, studentIds: number[]) => {
  const response = await fetch('/student-classes/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, studentIds }),
  });
  return response.json();
};

// Remove student from class
const removeStudentFromClass = async (studentId: number, classId: number) => {
  await fetch(
    `/student-classes/by-student-and-class?studentId=${studentId}&classId=${classId}`,
    { method: 'DELETE' }
  );
};

// Count students in class
const countStudentsInClass = async (classId: number) => {
  const response = await fetch(`/student-classes/count/class/${classId}`);
  return response.json();
};
```

---

## Data Validation Rules

- **studentId:** Required, must exist in students table
- **classId:** Required, must exist in classes table
- **Unique constraint:** (studentId, classId) - không được duplicate

---

## Use Cases

### 1. Quản Lý Danh Sách Lớp
- Giáo viên xem danh sách học sinh trong lớp
- Thêm/xóa học sinh vào/khỏi lớp
- In danh sách học sinh

### 2. Quản Lý Lớp Của Học Sinh
- Học sinh xem các lớp đang học
- Phụ huynh xem lịch học của con

### 3. Import/Export
- Import danh sách học sinh từ Excel
- Export danh sách học sinh ra Excel/PDF

### 4. Thống Kê
- Số học sinh trong mỗi lớp
- Số lớp của mỗi học sinh

