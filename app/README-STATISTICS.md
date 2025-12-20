# Statistics Controller API Documentation

## Overview
Controller quản lý các API thống kê và quản lý ví học sinh (Student Wallets). Module này cung cấp các chức năng:
- Xem danh sách tất cả ví học sinh
- Hoàn phí (xóa refund) bằng cách xóa student wallet
- Liệt kê học sinh tham gia hoặc nghỉ học trong một khoảng thời gian
- Quản lý danh sách enrollment events (đăng ký/xin nghỉ) trong khoảng thời gian

**Student Wallet:**
- Mỗi học sinh có thể có một ví (wallet) để lưu số dư
- Số dư có thể dương (tiền thừa, tiền đã trả trước) hoặc âm (nợ)
- Số dư được tính bằng: `Wallet hiện tại - Số tiền còn thiếu trong kỳ + Refund`
- Khi reconcile, hệ thống tự động cập nhật wallet dựa trên order items và refunds

## Base Path
`/api/statistics` (hoặc `/statistics` tùy cấu hình global prefix)

---

## Endpoints

### 1. Get All Student Wallets
**Lấy danh sách tất cả tài khoản ví của học sinh**

#### `GET /statistics/wallets`

**Mô tả:**
- Trả về danh sách tất cả student wallets trong hệ thống
- Bao gồm thông tin số dư, student ID, và timestamps
- Có thể kèm theo thông tin student nếu có relation

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "studentId": 10,
    "balance": 500000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "student": {
      "id": 10,
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      ...
    }
  },
  {
    "id": 2,
    "studentId": 11,
    "balance": -200000,
    "createdAt": "2024-01-16T09:15:00Z",
    "updatedAt": "2024-01-25T16:20:00Z",
    "student": {
      "id": 11,
      "fullName": "Trần Thị B",
      "phone": "0912345678",
      ...
    }
  }
]
```

**Response Fields:**
- `id` (number): ID của student wallet
- `studentId` (number): ID của học sinh
- `balance` (number): Số dư trong ví (VNĐ)
  - Dương: Tiền thừa, tiền đã trả trước
  - Âm: Nợ học phí
  - 0: Không có số dư
- `createdAt` (string): Thời gian tạo ví (ISO 8601)
- `updatedAt` (string): Thời gian cập nhật cuối cùng (ISO 8601)
- `student` (object, optional): Thông tin học sinh (nếu có relation)

**Use Cases:**
- Xem tổng quan số dư của tất cả học sinh
- Kiểm tra học sinh nào có nợ (balance < 0)
- Kiểm tra học sinh nào có tiền thừa (balance > 0)
- Báo cáo tài chính tổng hợp

**Notes:**
- Không phải tất cả học sinh đều có wallet
- Wallet chỉ được tạo khi có order items hoặc refund trong reconcile
- Balance có thể âm nếu học sinh còn nợ học phí

---

### 2. Revert Refund
**Hoàn phí (xóa refund) - Xóa student wallet của học sinh**

#### `DELETE /statistics/refunds/:id`

**Mô tả:**
- Xóa student wallet của học sinh bằng cách xóa record trong database
- Sử dụng khi cần hoàn phí (revert refund) - xóa ví để reset số dư về 0
- Sau khi xóa, học sinh sẽ không còn wallet cho đến khi reconcile lại

**Path Parameters:**
- `id` (number, required): ID của student wallet cần xóa

**Response (204 No Content):**
- Không có response body khi thành công

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Student wallet with ID 123 not found"
}
```

**Use Cases:**
- Hoàn phí cho học sinh (xóa refund đã được tính)
- Reset wallet về trạng thái ban đầu
- Xử lý khi có lỗi trong quá trình reconcile

**Notes:**
- Xóa wallet sẽ không ảnh hưởng đến order items hoặc transactions
- Sau khi xóa, nếu reconcile lại, wallet sẽ được tạo mới với số dư mới
- Nên cẩn thận khi xóa wallet vì có thể ảnh hưởng đến tính toán tài chính

**Example Request:**
```bash
DELETE /statistics/refunds/5
```

---

### 3. Get Enrollments by Date Range
**Liệt kê danh sách học sinh tham gia hoặc nghỉ học trong một khoảng thời gian**

#### `GET /statistics/enrollments`

**Mô tả:**
- Lấy danh sách enrollments (đăng ký học) trong một khoảng thời gian
- Hỗ trợ filter theo trạng thái enrollment (active, reserved, dropped, mixed)
- Trả về thông tin chi tiết về enrollment, học sinh, và lớp học

**Query Parameters:**
- `startDate` (string, required): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (string, required): Ngày kết thúc (YYYY-MM-DD)
- `status` (enum, optional): Filter theo trạng thái enrollment
  - `active`: Học sinh đang tham gia
  - `reserved`: Bảo lưu
  - `dropped`: Nghỉ học
  - `mixed`: Học một nửa (tính phí 50%)

**Examples:**
```bash
# Lấy tất cả enrollments trong tháng 1/2024
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31

# Lấy chỉ học sinh đang tham gia (ACTIVE)
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31&status=active

# Lấy chỉ học sinh nghỉ học (DROPPED)
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31&status=dropped

# Lấy học sinh bảo lưu (RESERVED)
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31&status=reserved
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "studentId": 10,
    "classId": 5,
    "startDate": "2024-01-01",
    "endDate": null,
    "status": "active",
    "specificDiscount": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "student": {
      "id": 10,
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "parentPhone": "0912345678",
      ...
    },
    "class": {
      "id": 5,
      "name": "Toán lớp 5A",
      "classType": "regular",
      "baseTuitionFee": 2000000,
      ...
    }
  },
  {
    "id": 2,
    "studentId": 11,
    "classId": 6,
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "status": "dropped",
    "specificDiscount": 0,
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "student": {
      "id": 11,
      "fullName": "Trần Thị B",
      "phone": "0912345678",
      "parentPhone": "0923456789",
      ...
    },
    "class": {
      "id": 6,
      "name": "Văn lớp 6B",
      "classType": "vip",
      "baseTuitionFee": 3000000,
      ...
    }
  }
]
```

**Response Fields:**
- `id` (number): ID của enrollment
- `studentId` (number): ID của học sinh
- `classId` (number): ID của lớp học
- `startDate` (string): Ngày bắt đầu đăng ký (YYYY-MM-DD)
- `endDate` (string | null): Ngày kết thúc đăng ký (YYYY-MM-DD), `null` nếu đang học
- `status` (enum): Trạng thái enrollment
  - `active`: Đang tham gia
  - `reserved`: Bảo lưu
  - `dropped`: Nghỉ học
  - `mixed`: Học một nửa
- `specificDiscount` (number): Giảm giá đặc biệt (0-100%)
- `createdAt` (string): Thời gian tạo enrollment (ISO 8601)
- `updatedAt` (string): Thời gian cập nhật cuối cùng (ISO 8601)
- `student` (object): Thông tin học sinh
- `class` (object): Thông tin lớp học

**Error Responses:**

**400 Bad Request - Invalid Date Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use ISO date format (YYYY-MM-DD)"
}
```

**400 Bad Request - Invalid Date Range:**
```json
{
  "statusCode": 400,
  "message": "startDate must be before or equal to endDate"
}
```

**Use Cases:**
- Báo cáo học sinh tham gia trong một khoảng thời gian
- Thống kê học sinh nghỉ học (dropped) trong tháng
- Xem danh sách học sinh bảo lưu (reserved)
- Phân tích xu hướng đăng ký học theo thời gian
- Báo cáo chuyển lớp, nghỉ học

**Notes:**
- Enrollments được lấy dựa trên overlap với khoảng thời gian (startDate, endDate)
- Nếu enrollment có `endDate = null`, nghĩa là học sinh vẫn đang học
- Filter theo `status` là optional, nếu không có thì trả về tất cả status
- Kết quả bao gồm cả enrollments bắt đầu trước `startDate` nhưng kết thúc sau `startDate`
- Kết quả bao gồm cả enrollments bắt đầu trước `endDate` nhưng kết thúc sau `endDate`

**Date Range Logic:**
- Enrollment được bao gồm nếu có overlap với khoảng thời gian (startDate, endDate)
- Ví dụ:
  - Enrollment: 2024-01-01 → 2024-01-31, Query: 2024-01-15 → 2024-01-20 → **Có**
  - Enrollment: 2024-01-01 → 2024-01-15, Query: 2024-01-15 → 2024-01-31 → **Có** (overlap tại 2024-01-15)
  - Enrollment: 2024-01-01 → null (ongoing), Query: 2024-01-15 → 2024-01-31 → **Có**

---

### 4. Get Enrollment Events by Date Range
**Quản lý đăng ký danh sách enrollment đăng ký hoặc xin nghỉ trong khoảng thời gian**

#### `GET /statistics/enrollment-events`

**Mô tả:**
- Trả về danh sách enrollment events (sự kiện đăng ký/xin nghỉ) trong một khoảng thời gian
- Phân biệt rõ ràng giữa "register" (đăng ký) và "unregister" (xin nghỉ) dựa trên ngày bắt đầu/kết thúc của enrollment
- Logic:
  - Nếu `startDate` của enrollment nằm trong khoảng thời gian query → `eventType = "register"`
  - Nếu `endDate` của enrollment nằm trong khoảng thời gian query → `eventType = "unregister"`
- Một enrollment có thể xuất hiện 2 lần nếu cả `startDate` và `endDate` đều nằm trong khoảng (một lần register, một lần unregister)

**Query Parameters:**
- `startDate` (string, required): Ngày bắt đầu khoảng thời gian (YYYY-MM-DD)
- `endDate` (string, required): Ngày kết thúc khoảng thời gian (YYYY-MM-DD)

**Examples:**
```bash
# Lấy tất cả enrollment events trong tháng 1/2024
GET /statistics/enrollment-events?startDate=2024-01-01&endDate=2024-01-31

# Lấy enrollment events trong quý 1/2024
GET /statistics/enrollment-events?startDate=2024-01-01&endDate=2024-03-31
```

**Response (200 OK):**
```json
[
  {
    "enrollment": {
      "id": 1,
      "studentId": 10,
      "classId": 5,
      "startDate": "2024-01-15",
      "endDate": null,
      "status": "active",
      "specificDiscount": 0,
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "student": {
        "id": 10,
        "fullName": "Nguyễn Văn A",
        "phone": "0901234567",
        "parentPhone": "0912345678",
        ...
      },
      "class": {
        "id": 5,
        "name": "Toán lớp 5A",
        "classType": "regular",
        "baseTuitionFee": 2000000,
        ...
      }
    },
    "eventType": "register",
    "eventDate": "2024-01-15T00:00:00Z"
  },
  {
    "enrollment": {
      "id": 2,
      "studentId": 11,
      "classId": 6,
      "startDate": "2024-01-01",
      "endDate": "2024-01-20",
      "status": "dropped",
      "specificDiscount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-20T14:45:00Z",
      "student": {
        "id": 11,
        "fullName": "Trần Thị B",
        "phone": "0912345678",
        "parentPhone": "0923456789",
        ...
      },
      "class": {
        "id": 6,
        "name": "Văn lớp 6B",
        "classType": "vip",
        "baseTuitionFee": 3000000,
        ...
      }
    },
    "eventType": "unregister",
    "eventDate": "2024-01-20T00:00:00Z"
  },
  {
    "enrollment": {
      "id": 3,
      "studentId": 12,
      "classId": 7,
      "startDate": "2024-01-10",
      "endDate": "2024-01-25",
      "status": "dropped",
      "specificDiscount": 0,
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-25T16:20:00Z",
      "student": {
        "id": 12,
        "fullName": "Lê Văn C",
        ...
      },
      "class": {
        "id": 7,
        "name": "Anh lớp 7C",
        ...
      }
    },
    "eventType": "register",
    "eventDate": "2024-01-10T00:00:00Z"
  },
  {
    "enrollment": {
      "id": 3,
      "studentId": 12,
      "classId": 7,
      "startDate": "2024-01-10",
      "endDate": "2024-01-25",
      "status": "dropped",
      "specificDiscount": 0,
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-25T16:20:00Z",
      "student": {
        "id": 12,
        "fullName": "Lê Văn C",
        ...
      },
      "class": {
        "id": 7,
        "name": "Anh lớp 7C",
        ...
      }
    },
    "eventType": "unregister",
    "eventDate": "2024-01-25T00:00:00Z"
  }
]
```

**Response Fields:**
- `enrollment` (object): Thông tin enrollment (giống như response của endpoint `/statistics/enrollments`)
  - `id` (number): ID của enrollment
  - `studentId` (number): ID của học sinh
  - `classId` (number): ID của lớp học
  - `startDate` (string): Ngày bắt đầu đăng ký (YYYY-MM-DD)
  - `endDate` (string | null): Ngày kết thúc đăng ký (YYYY-MM-DD), `null` nếu đang học
  - `status` (enum): Trạng thái enrollment (`active`, `reserved`, `dropped`, `mixed`)
  - `specificDiscount` (number): Giảm giá đặc biệt (0-100%)
  - `student` (object): Thông tin học sinh
  - `class` (object): Thông tin lớp học
- `eventType` (enum): Loại sự kiện
  - `register`: Đăng ký học (startDate nằm trong khoảng thời gian)
  - `unregister`: Xin nghỉ học (endDate nằm trong khoảng thời gian)
- `eventDate` (string): Ngày diễn ra sự kiện (ISO 8601)
  - Với `register`: Là `startDate` của enrollment
  - Với `unregister`: Là `endDate` của enrollment

**Error Responses:**

**400 Bad Request - Invalid Date Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Use ISO date format (YYYY-MM-DD)"
}
```

**400 Bad Request - Invalid Date Range:**
```json
{
  "statusCode": 400,
  "message": "startDate must be before or equal to endDate"
}
```

**Use Cases:**
- Báo cáo đăng ký mới trong tháng/quý
- Báo cáo học sinh nghỉ học trong khoảng thời gian
- Theo dõi biến động số lượng học sinh (đăng ký vs nghỉ học)
- Phân tích xu hướng enrollment theo thời gian
- Tạo báo cáo hàng tháng về tình hình đăng ký/nghỉ học

**Notes:**
- Kết quả được sắp xếp theo `eventDate` (mới nhất trước)
- Một enrollment có thể xuất hiện 2 lần nếu cả `startDate` và `endDate` đều nằm trong khoảng thời gian:
  - Ví dụ: Enrollment có startDate = 2024-01-15, endDate = 2024-01-25
  - Query: startDate = 2024-01-01, endDate = 2024-01-31
  - Kết quả: 2 events (1 register với eventDate = 2024-01-15, 1 unregister với eventDate = 2024-01-25)
- Enrollments với `endDate = null` (đang học) chỉ xuất hiện với `eventType = "register"` nếu `startDate` nằm trong khoảng
- Endpoint này khác với `/statistics/enrollments` ở chỗ:
  - `/enrollments`: Trả về enrollments có overlap với khoảng thời gian (không phân biệt register/unregister)
  - `/enrollment-events`: Trả về events cụ thể (register/unregister) dựa trên startDate/endDate trong khoảng

**Event Type Logic:**
- **Register Event**: Enrollment có `startDate` nằm trong khoảng [queryStartDate, queryEndDate]
  - `eventDate = enrollment.startDate`
  - `eventType = "register"`
- **Unregister Event**: Enrollment có `endDate` không null và nằm trong khoảng [queryStartDate, queryEndDate]
  - `eventDate = enrollment.endDate`
  - `eventType = "unregister"`
- Enrollments với `endDate = null` không tạo unregister event

---

## Common Error Responses

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Related APIs

- **Billing API** (`/api/billing`): Tạo hóa đơn và tính học phí
- **Reconcile API** (`/api/reconcile`): Chốt sổ và hoàn tiền
- **Tuition Period API** (`/api/tuition-periods`): Quản lý kỳ học phí
- **Order API** (`/api/orders`): Quản lý hóa đơn và thanh toán

---

## Data Flow

### Student Wallet Lifecycle

1. **Initial State**: Học sinh chưa có wallet (balance = 0 mặc định)

2. **After Billing**: 
   - Khi generate billing, hệ thống tự động trừ tiền từ wallet nếu có
   - Nếu wallet không đủ, `paidAmount` sẽ nhỏ hơn `totalLineAmount`

3. **After Reconcile**:
   - Hệ thống tính toán refund dựa trên attendance và enrollment
   - Cập nhật wallet: `newBalance = currentBalance - totalRemainingAmount + refundAmount`
   - Wallet được tạo nếu chưa có

4. **Revert Refund**:
   - Xóa wallet để reset về trạng thái ban đầu
   - Wallet sẽ được tạo lại khi reconcile tiếp theo

### Enrollment Status Flow

- **ACTIVE**: Học sinh đang tham gia lớp học
- **RESERVED**: Học sinh bảo lưu (tạm nghỉ, có thể quay lại)
- **DROPPED**: Học sinh nghỉ học (không quay lại)
- **MIXED**: Học một nửa (tính phí 50%)

---

## Best Practices

1. **Wallet Management**:
   - Kiểm tra balance trước khi xóa wallet
   - Ghi log khi xóa wallet để audit
   - Không nên xóa wallet nếu đang trong quá trình reconcile

2. **Enrollment Queries**:
   - Luôn validate date format trước khi query
   - Sử dụng filter `status` để giảm kết quả trả về
   - Cache kết quả nếu query thường xuyên

3. **Error Handling**:
   - Luôn kiểm tra wallet tồn tại trước khi xóa
   - Validate date range trước khi query enrollments
   - Handle edge cases (null endDate, invalid status)

---

## Examples

### Example 1: Get All Wallets with Positive Balance
```bash
GET /statistics/wallets

# Filter in application:
# wallets.filter(w => w.balance > 0)
```

### Example 2: Revert Refund for Student
```bash
DELETE /statistics/refunds/5

# Response: 204 No Content
```

### Example 3: Get Active Students in January 2024
```bash
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31&status=active
```

### Example 4: Get Dropped Students in Q1 2024
```bash
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-03-31&status=dropped
```

### Example 5: Get All Enrollments (No Status Filter)
```bash
GET /statistics/enrollments?startDate=2024-01-01&endDate=2024-01-31
```

### Example 6: Get Enrollment Events in January 2024
```bash
GET /statistics/enrollment-events?startDate=2024-01-01&endDate=2024-01-31
```

### Example 7: Get Enrollment Events in Q1 2024
```bash
GET /statistics/enrollment-events?startDate=2024-01-01&endDate=2024-03-31
```

