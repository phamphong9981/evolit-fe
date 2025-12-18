# Order Item Controller API Documentation

## Overview
Controller quản lý chi tiết hóa đơn (Order Items) - các dòng item trong một hóa đơn. Một Order có thể có nhiều OrderItems (học phí của nhiều con, nhiều lớp, hoặc các khoản điều chỉnh).

## Base Path
`/api/order-items` (hoặc `/order-items` tùy cấu hình global prefix)

---

## Endpoints

### 1. Get All Order Items
**Lấy danh sách tất cả order items**

#### `GET /order-items`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "tuitionPeriodId": 12,
    "amount": 2000000,
    "vatRate": 10,
    "vatAmount": 200000,
    "totalLineAmount": 2200000,
    "paidAmount": 0,
    "remainingAmount": 2200000,
    "isFullyPaid": false,
    "note": "Học phí Toán lớp 5A - Tháng 1/2024",
    "type": "TUITION",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### 2. Get Order Items by Order
**Lấy tất cả items của một hóa đơn**

#### `GET /order-items/by-order/:orderId`

**Path Parameters:**
- `orderId` (number): ID của hóa đơn

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "amount": 2000000,
    "vatRate": 10,
    "vatAmount": 200000,
    "totalLineAmount": 2200000,
    "paidAmount": 1000000,
    "remainingAmount": 1200000,
    "isFullyPaid": false,
    "type": "TUITION",
    "note": "Học phí Toán lớp 5A",
    ...
  },
  {
    "id": 2,
    "orderId": 1,
    "studentId": 10,
    "classId": 6,
    "amount": 3000000,
    "vatRate": 10,
    "vatAmount": 300000,
    "totalLineAmount": 3300000,
    "paidAmount": 3300000,
    "remainingAmount": 0,
    "isFullyPaid": true,
    "type": "TUITION",
    "note": "Học phí Văn lớp 5B",
    ...
  },
  {
    "id": 3,
    "orderId": 1,
    "studentId": 10,
    "amount": -500000,
    "vatRate": 0,
    "vatAmount": 0,
    "totalLineAmount": -500000,
    "paidAmount": 0,
    "remainingAmount": 0,
    "isFullyPaid": true,
    "type": "ADJUSTMENT",
    "note": "Khấu trừ số dư ví",
    ...
  }
]
```

**Use Case:**
- Hiển thị chi tiết hóa đơn
- In hóa đơn với danh sách items

---

### 3. Get Order Items by Student
**Lấy tất cả items của một học sinh**

#### `GET /order-items/by-student`

**Query Parameters:**
- `studentId` (number, optional): ID của học sinh (tìm chính xác)
- `code` (string, optional): Mã học sinh (tìm chính xác)
- `search` (string, optional): Tìm kiếm gần đúng (like) theo:
  - Tên học sinh (`fullName`)
  - Mã học sinh (`code`)
  - Số điện thoại phụ huynh (`parentPhone`)

**Lưu ý:** Phải cung cấp ít nhất một trong ba tham số (`studentId`, `code`, hoặc `search`).

**Examples:**
```bash
# Tìm theo studentId (chính xác)
GET /order-items/by-student?studentId=10

# Tìm theo code (chính xác)
GET /order-items/by-student?code=ST001

# Tìm kiếm like theo tên học sinh
GET /order-items/by-student?search=Nguyễn

# Tìm kiếm like theo mã học sinh
GET /order-items/by-student?search=ST00

# Tìm kiếm like theo số điện thoại phụ huynh
GET /order-items/by-student?search=0912345678
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "amount": 2000000,
    "vatRate": 10,
    "vatAmount": 200000,
    "totalLineAmount": 2200000,
    "paidAmount": 1000000,
    "remainingAmount": 1200000,
    "isFullyPaid": false,
    "type": "TUITION",
    "order": { ... },
    "class": { ... },
    "student": {
      "id": 10,
      "code": "ST001",
      "fullName": "Nguyễn Văn A",
      "parentPhone": "0912345678",
      ...
    }
  }
]
```

**Lưu ý về tìm kiếm:**
- Khi dùng `search`, API sẽ tìm kiếm không phân biệt hoa thường (case-insensitive)
- Tìm kiếm theo pattern `LIKE '%search%'` (chứa chuỗi tìm kiếm)
- Kết quả sẽ bao gồm relation `student` để hiển thị thông tin học sinh
- Ưu tiên: Nếu có `search`, sẽ dùng tìm kiếm like; nếu có `code`, tìm chính xác theo code; nếu có `studentId`, tìm chính xác theo ID

**Error Responses:**

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Either studentId, code, or search must be provided"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Student with code ST999 not found"
}
```

**Use Case:**
- Xem lịch sử học phí của một học sinh
- Thống kê doanh thu theo học sinh
- Tìm kiếm theo mã học sinh khi không biết ID
- Tìm kiếm linh hoạt theo tên, mã, hoặc số điện thoại phụ huynh
- Tìm tất cả order items của các học sinh có tên chứa từ khóa

---

### 4. Get Order Items by Class
**Lấy tất cả items của một lớp**

#### `GET /order-items/by-class/:classId`

**Path Parameters:**
- `classId` (number): ID của lớp

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "amount": 2000000,
    "type": "TUITION",
    ...
  }
]
```

**Use Case:**
- Thống kê doanh thu theo lớp
- Xem danh sách học phí đã thu của một lớp

---

### 5. Count Order Items by Type
**Đếm số lượng items theo loại**

#### `GET /order-items/count/by-type?type=TUITION`

**Query Parameters:**
- `type` (enum, required): Loại item
  - `TUITION`: Học phí
  - `MATERIAL`: Tài liệu
  - `ADJUSTMENT`: Điều chỉnh (truy thu/hoàn trả)

**Response (200 OK):**
```json
48
```

**Use Case:**
- Thống kê số lượng items theo loại
- Dashboard analytics

---

### 6. Get Order Item by ID
**Lấy chi tiết một order item**

#### `GET /order-items/:id`

**Path Parameters:**
- `id` (number): ID của order item

**Response (200 OK):**
```json
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "tuitionPeriodId": 12,
    "amount": 2000000,
    "vatRate": 10,
    "vatAmount": 200000,
    "totalLineAmount": 2200000,
    "paidAmount": 1000000,
    "remainingAmount": 1200000,
    "isFullyPaid": false,
    "note": "Học phí Toán lớp 5A - Tháng 1/2024",
    "type": "TUITION",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "order": {...},
    "student": {...},
    "class": {...},
    "tuitionPeriod": {...}
  }
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order item with ID 999 not found"
}
```

---

### 7. Create Order Item
**Tạo order item mới (thường được tạo tự động bởi Billing Service)**

#### `POST /order-items`

**Request Body:**
```json
{
  "orderId": 1,
  "studentId": 10,
  "classId": 5,
  "tuitionPeriodId": 12,
  "amount": 2000000,
  "vatRate": 10,
  "vatAmount": 200000,
  "totalLineAmount": 2200000,
  "type": "TUITION",
  "note": "Học phí Toán lớp 5A"
}
```

**Request Fields:**
- `orderId` (number, required): ID của hóa đơn
- `studentId` (number, required): ID của học sinh
- `classId` (number, optional): ID của lớp (nullable cho ADJUSTMENT)
- `tuitionPeriodId` (number, optional): ID của kỳ học phí
- `amount` (number, required, min: 0): Số tiền (có thể âm cho ADJUSTMENT)
- `vatRate` (number, optional, default: 0): Tỷ lệ VAT (ví dụ: 8 hoặc 10)
- `vatAmount` (number, optional, default: 0): Số tiền VAT tính ra (amount * vatRate / 100)
- `totalLineAmount` (number, optional, default: 0): Tổng dòng = amount + vatAmount
- `type` (enum, required): Loại item
  - `TUITION`: Học phí
  - `MATERIAL`: Tài liệu
  - `ADJUSTMENT`: Điều chỉnh
- `note` (string, optional): Ghi chú

**Response (201 Created):**
```json
{
  "id": 1,
  "orderId": 1,
  "studentId": 10,
  ...
}
```

---

### 8. Create Multiple Order Items
**Tạo nhiều order items cùng lúc**

#### `POST /order-items/bulk`

**Request Body:**
```json
[
  {
    "orderId": 1,
    "studentId": 10,
    "classId": 5,
    "amount": 2000000,
    "vatRate": 10,
    "vatAmount": 200000,
    "totalLineAmount": 2200000,
    "type": "TUITION",
    "note": "Học phí Toán lớp 5A"
  },
  {
    "orderId": 1,
    "studentId": 10,
    "classId": 6,
    "amount": 3000000,
    "vatRate": 10,
    "vatAmount": 300000,
    "totalLineAmount": 3300000,
    "type": "TUITION",
    "note": "Học phí Văn lớp 5B"
  }
]
```

**Response (201 Created):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "studentId": 10,
    ...
  },
  {
    "id": 2,
    "orderId": 1,
    "studentId": 10,
    ...
  }
]
```

**Use Case:**
- Tạo nhiều items cho một order cùng lúc
- Import dữ liệu từ file

---

### 9. Update Order Item
**Cập nhật thông tin order item**

#### `PATCH /order-items/:id`

**Path Parameters:**
- `id` (number): ID của order item

**Request Body:**
```json
{
  "note": "Cập nhật ghi chú",
  "amount": 2500000,
  "vatRate": 10,
  "vatAmount": 250000,
  "totalLineAmount": 2750000
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "note": "Cập nhật ghi chú",
  "amount": 2500000,
  ...
}
```

---

### 10. Delete Order Item
**Xóa order item**

#### `DELETE /order-items/:id`

**Path Parameters:**
- `id` (number): ID của order item

**Response (204 No Content)**

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order item with ID 999 not found"
}
```

---

## Order Item Fields

### Payment Tracking Fields
- **paidAmount** (decimal 14,2): Số tiền đã thanh toán cho item này. Tự động cập nhật khi có transaction.
- **remainingAmount** (computed, number): Số tiền còn nợ = `totalLineAmount - paidAmount`. 
  - Nếu `totalLineAmount < 0` (ADJUSTMENT trừ ví), luôn trả về `0`.
  - Được tính tự động bởi getter, không lưu trong database.
  - **Luôn có trong API response.**
- **isFullyPaid** (computed, boolean): Kiểm tra item đã thanh toán xong chưa.
  - Nếu `totalLineAmount < 0`, luôn trả về `true`.
  - Ngược lại: `paidAmount >= totalLineAmount`.
  - Được tính tự động bởi getter, không lưu trong database.
  - **Luôn có trong API response.**

### VAT Fields
- **vatRate** (decimal 10,2): Tỷ lệ VAT (ví dụ: 8 hoặc 10)
- **vatAmount** (decimal 15,2): Số tiền VAT = amount * vatRate / 100
- **totalLineAmount** (decimal 15,2): Tổng dòng = amount + vatAmount

### Calculation Example
```
amount = 1,000,000 VNĐ
vatRate = 10%
vatAmount = 1,000,000 * 10 / 100 = 100,000 VNĐ
totalLineAmount = 1,000,000 + 100,000 = 1,100,000 VNĐ
paidAmount = 500,000 VNĐ (đã thanh toán một phần)
remainingAmount = 1,100,000 - 500,000 = 600,000 VNĐ (tự động tính)
isFullyPaid = false (tự động tính)
```

## Order Item Types

### TUITION
- **Mô tả**: Học phí chính thức
- **Amount**: Luôn dương
- **ClassId**: Bắt buộc
- **Use Case**: Học phí hàng tháng, học phí theo kỳ

### MATERIAL
- **Mô tả**: Phí tài liệu, sách vở
- **Amount**: Luôn dương
- **ClassId**: Có thể null
- **Use Case**: Phí mua sách, tài liệu học tập

### ADJUSTMENT
- **Mô tả**: Điều chỉnh (truy thu/hoàn trả/khấu trừ ví)
- **Amount**: Có thể âm (khấu trừ) hoặc dương (truy thu)
- **ClassId**: Có thể null
- **Use Case**: 
  - Khấu trừ từ ví học sinh (amount âm)
  - Truy thu học phí thiếu (amount dương)
  - Hoàn trả học phí (amount âm)

---

## UI Suggestions

### 1. Order Item List in Order Detail

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Chi tiết hóa đơn #1                                    │
├─────────────────────────────────────────────────────────┤
│  Học sinh      | Lớp        | Loại      | Số tiền      │
├─────────────────────────────────────────────────────────┤
│  Nguyễn Văn A  | Toán 5A    | Học phí   | 2,000,000    │
│  Nguyễn Văn A  | Văn 5B     | Học phí   | 3,000,000    │
│  Nguyễn Văn A  | -          | Điều chỉnh| -500,000     │
│                |            | (Khấu trừ ví)              │
├─────────────────────────────────────────────────────────┤
│  Tổng cộng:                         5,000,000 VNĐ      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Group by student (nếu có nhiều con)
- Hiển thị màu khác nhau cho từng loại:
  - TUITION: Xanh dương
  - MATERIAL: Xanh lá
  - ADJUSTMENT: Vàng (nếu dương) / Đỏ (nếu âm)
- Tổng hợp số tiền

### 2. Student Payment History

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Lịch sử học phí - Nguyễn Văn A                        │
│  [Tìm kiếm: ___________] [Tìm]                          │
├─────────────────────────────────────────────────────────┤
│  Ngày        | Lớp        | Loại      | Số tiền        │
├─────────────────────────────────────────────────────────┤
│  15/01/2024  | Toán 5A    | Học phí   | 2,000,000      │
│  15/01/2024  | Văn 5B     | Học phí   | 3,000,000      │
│  20/01/2024  | Toán 5A    | Tài liệu  | 200,000        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Tìm kiếm theo tên, mã học sinh, hoặc số điện thoại phụ huynh
- Kết quả hiển thị thông tin học sinh đầy đủ
- Hỗ trợ tìm kiếm gần đúng (fuzzy search)

### 3. Class Revenue Report

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Doanh thu lớp: Toán 5A                                 │
├─────────────────────────────────────────────────────────┤
│  Học sinh      | Kỳ        | Số tiền    | Trạng thái    │
├─────────────────────────────────────────────────────────┤
│  Nguyễn Văn A  | 1/2024    | 2,000,000  | Đã thanh toán │
│  Trần Thị B    | 1/2024    | 2,000,000  | Chưa thanh toán│
└─────────────────────────────────────────────────────────┘
│  Tổng doanh thu: 4,000,000 VNĐ                         │
└─────────────────────────────────────────────────────────┘
```

### 4. React Code Example

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderItemApi } from '../api/order-item';

interface OrderItem {
  id: number;
  orderId: number;
  studentId: number;
  classId?: number;
  amount: number;
  totalLineAmount: number;
  paidAmount: number;
  remainingAmount: number; // Computed getter, always present in response
  isFullyPaid: boolean; // Computed getter, always present in response
  type: 'TUITION' | 'MATERIAL' | 'ADJUSTMENT';
  note?: string;
  student?: { fullName: string };
  class?: { name: string };
}

export const OrderItemsList: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { data: items, isLoading } = useQuery({
    queryKey: ['order-items', 'by-order', orderId],
    queryFn: () => orderItemApi.getByOrder(orderId),
  });

  if (isLoading) return <div>Loading...</div>;

  const total = items?.reduce((sum, item) => sum + item.totalLineAmount, 0) || 0;
  const totalPaid = items?.reduce((sum, item) => sum + item.paidAmount, 0) || 0;
  const totalRemaining = items?.reduce((sum, item) => sum + item.remainingAmount, 0) || 0;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TUITION':
        return 'Học phí';
      case 'MATERIAL':
        return 'Tài liệu';
      case 'ADJUSTMENT':
        return 'Điều chỉnh';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string, amount: number) => {
    if (type === 'ADJUSTMENT') {
      return amount < 0 ? 'text-red-600' : 'text-yellow-600';
    }
    if (type === 'TUITION') return 'text-blue-600';
    if (type === 'MATERIAL') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Chi tiết hóa đơn</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Học sinh</th>
              <th className="text-left py-2">Lớp</th>
              <th className="text-left py-2">Loại</th>
              <th className="text-right py-2">Tổng tiền</th>
              <th className="text-right py-2">Đã thanh toán</th>
              <th className="text-right py-2">Còn nợ</th>
              <th className="text-center py-2">Trạng thái</th>
              <th className="text-left py-2">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: OrderItem) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.student?.fullName || `#${item.studentId}`}</td>
                <td className="py-2">{item.class?.name || '-'}</td>
                <td className={`py-2 ${getTypeColor(item.type, item.amount)}`}>
                  {getTypeLabel(item.type)}
                </td>
                <td className="text-right py-2">
                  {item.totalLineAmount.toLocaleString('vi-VN')} VNĐ
                </td>
                <td className="text-right py-2">
                  {item.paidAmount.toLocaleString('vi-VN')} VNĐ
                </td>
                <td className="text-right py-2">
                  <span className={item.remainingAmount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {item.remainingAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </td>
                <td className="text-center py-2">
                  {item.isFullyPaid ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Đã thanh toán
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Chưa đủ
                    </span>
                  )}
                </td>
                <td className="py-2 text-sm text-gray-500">{item.note || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold">
              <td colSpan={3} className="py-2 text-right">
                Tổng cộng:
              </td>
              <td className="text-right py-2">
                {total.toLocaleString('vi-VN')} VNĐ
              </td>
              <td className="text-right py-2">
                {totalPaid.toLocaleString('vi-VN')} VNĐ
              </td>
              <td className="text-right py-2">
                <span className={totalRemaining > 0 ? 'text-red-600' : 'text-green-600'}>
                  {totalRemaining.toLocaleString('vi-VN')} VNĐ
                </span>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
```

---

## Integration Notes

1. **Item Types**: Phân biệt rõ 3 loại items để hiển thị và xử lý đúng
2. **Negative Amounts**: ADJUSTMENT có thể có amount âm (khấu trừ)
3. **ClassId Nullable**: ADJUSTMENT và MATERIAL có thể không có classId
4. **Bulk Create**: Sử dụng bulk create khi tạo nhiều items để tối ưu performance
5. **Payment Tracking**: Sử dụng `remainingAmount` và `isFullyPaid` từ API response để hiển thị trạng thái thanh toán, không cần tính toán phía client. Các trường này luôn có trong mọi response.
6. **Student Search**: Có thể tìm order items theo:
   - `studentId` (tìm chính xác theo ID)
   - `code` (tìm chính xác theo mã học sinh)
   - `search` (tìm kiếm like theo tên, mã, hoặc số điện thoại phụ huynh - không phân biệt hoa thường)
   - Ưu tiên: `search` > `code` > `studentId`
7. **Auto Order Creation**: Khi tạo item không có `orderId`, hệ thống tự động tìm hoặc tạo Order mới, giúp đơn giản hóa workflow
8. **Auto VAT Calculation**: Nếu không cung cấp `vatAmount` và `totalLineAmount`, hệ thống sẽ tự tính dựa trên `amount` và `vatRate`

