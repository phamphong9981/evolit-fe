# Order Controller API Documentation

## Overview
Controller quản lý hóa đơn (Orders) - đại diện cho một lần thanh toán của phụ huynh. Một Order có thể chứa nhiều OrderItems (học phí của nhiều con, nhiều lớp).

## Base Path
`/api/orders` (hoặc `/orders` tùy cấu hình global prefix)

---

## Endpoints

### 1. Get All Orders
**Lấy danh sách tất cả hóa đơn**

#### `GET /orders`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "payerName": "Nguyễn Văn A",
    "payerPhone": "0901234567",
    "totalAmount": 5000000,
    "discountTotal": 0,
    "finalAmount": 5500000,
    "totalPaid": 3000000,
    "taxTotal": 500000,
    "subTotal": 5000000,
    "status": "partial",
    "createdBy": "admin",
    "note": "Học phí kỳ Tháng 1/2024",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### 2. Get Orders by Status
**Lấy danh sách hóa đơn theo trạng thái**

#### `GET /orders/by-status?status=pending`

**Query Parameters:**
- `status` (string, required): Trạng thái hóa đơn
  - `pending`: Chưa thanh toán
  - `partial`: Đã thanh toán một phần
  - `paid`: Đã thanh toán đủ
  - `cancelled`: Đã hủy

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "payerName": "Nguyễn Văn A",
    "status": "pending",
    "finalAmount": 5000000,
    "totalPaid": 0,
    ...
  }
]
```

---

### 3. Get Order by ID
**Lấy chi tiết một hóa đơn**

#### `GET /orders/:id`

**Path Parameters:**
- `id` (number): ID của hóa đơn

**Response (200 OK):**
```json
  {
    "id": 1,
    "payerName": "Nguyễn Văn A",
    "payerPhone": "0901234567",
    "totalAmount": 5000000,
    "discountTotal": 0,
    "finalAmount": 5500000,
    "totalPaid": 3000000,
    "taxTotal": 500000,
    "subTotal": 5000000,
    "status": "partial",
    "createdBy": "admin",
    "note": "Học phí kỳ Tháng 1/2024",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "items": [...],
    "transactions": [...]
  }
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found"
}
```

---

### 4. Create Order
**Tạo hóa đơn mới (thường được tạo tự động bởi Billing Service)**

#### `POST /orders`

**Request Body:**
```json
{
  "payerName": "Nguyễn Văn A",
  "payerPhone": "0901234567",
  "totalAmount": 5000000,
  "discountTotal": 500000,
  "finalAmount": 4950000,
  "taxTotal": 500000,
  "subTotal": 5000000,
  "status": "pending",
  "createdBy": "admin",
  "note": "Học phí kỳ Tháng 1/2024"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "payerName": "Nguyễn Văn A",
  ...
}
```

---

### 5. Update Order
**Cập nhật thông tin hóa đơn**

#### `PATCH /orders/:id`

**Path Parameters:**
- `id` (number): ID của hóa đơn

**Request Body:**
```json
{
  "payerName": "Nguyễn Văn B",
  "note": "Cập nhật ghi chú"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "payerName": "Nguyễn Văn B",
  ...
}
```

---

### 6. Update Order Status
**Cập nhật trạng thái hóa đơn**

#### `PATCH /orders/:id/status`

**Path Parameters:**
- `id` (number): ID của hóa đơn

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "paid",
  ...
}
```

---

### 7. Confirm Payment ⭐
**Xác nhận thanh toán cho hóa đơn (API quan trọng nhất)**

#### `POST /orders/:id/payment`

**Mô tả:**
- Ghi nhận một khoản thanh toán cho hóa đơn
- Tạo transaction record
- Cập nhật `totalPaid` và `status` tự động
- Xử lý nộp thừa: phần thừa được cộng vào `student_wallets` của học sinh đầu tiên

**Path Parameters:**
- `id` (number): ID của hóa đơn

**Request Body:**
```json
{
  "amount": 2000000,
  "method": "BANK_TRANSFER",
  "evidence": "https://example.com/receipt.jpg"
}
```

**Request Fields:**
- `amount` (number, required, min: 0.01): Số tiền thanh toán
- `method` (enum, required): Phương thức thanh toán
  - `CASH`: Tiền mặt
  - `BANK_TRANSFER`: Chuyển khoản
- `evidence` (string, optional): URL ảnh chứng từ

**Response (200 OK):**
```json
  {
    "id": 1,
    "payerName": "Nguyễn Văn A",
    "totalAmount": 5000000,
    "finalAmount": 5500000,
    "totalPaid": 5500000,
    "taxTotal": 500000,
    "subTotal": 5000000,
    "status": "paid",
    "transactions": [
    {
      "id": 1,
      "amount": 3000000,
      "paymentMethod": "BANK_TRANSFER",
      "transactionDate": "2024-01-15T10:00:00Z",
      "evidenceImage": "https://example.com/receipt1.jpg"
    },
    {
      "id": 2,
      "amount": 2000000,
      "paymentMethod": "BANK_TRANSFER",
      "transactionDate": "2024-01-16T14:30:00Z",
      "evidenceImage": "https://example.com/receipt.jpg"
    }
  ],
  ...
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Cannot confirm payment for cancelled order"
}
```

**Logic Flow:**
1. Load order với pessimistic lock (tránh race condition)
2. Validate order không bị cancelled
3. Tạo transaction record
4. Tính `newTotalPaid = oldTotalPaid + paymentAmount`
5. Cập nhật status:
   - Nếu `newTotalPaid >= finalAmount` → `status = PAID`
   - Nếu `newTotalPaid < finalAmount` → `status = PARTIAL`
6. Xử lý nộp thừa:
   - Nếu `newTotalPaid > finalAmount`:
     - Tính `overpayment = newTotalPaid - finalAmount`
     - Cộng vào `student_wallets` của học sinh đầu tiên trong order
7. Cập nhật order
8. Commit transaction

**Lưu ý:**
- Hỗ trợ thanh toán nhiều lần (trả góp)
- Phần nộp thừa tự động chuyển vào ví học sinh
- Sử dụng pessimistic locking để đảm bảo tính nhất quán

---

### 8. Delete Order
**Xóa hóa đơn**

#### `DELETE /orders/:id`

**Path Parameters:**
- `id` (number): ID của hóa đơn

**Response (204 No Content)**

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found"
}
```

---

## UI Suggestions

### 1. Order List Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Danh Sách Hóa Đơn                    [Tạo Mới]         │
├─────────────────────────────────────────────────────────┤
│  Filter: [Tất cả ▼] [Status: pending ▼] [Tìm kiếm...]   │
├─────────────────────────────────────────────────────────┤
│  ID  | Phụ huynh    | Số tiền    | Đã đóng | Trạng thái │
├─────────────────────────────────────────────────────────┤
│  #1  | Nguyễn Văn A | 5,000,000  | 3,000,000| Partial   │
│      | 0901234567   |            |          | [Thanh toán]│
├─────────────────────────────────────────────────────────┤
│  #2  | Trần Thị B   | 3,000,000  | 3,000,000| Paid      │
│      | 0907654321   |            |          | [Xem]      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Filter theo status
- Search theo tên phụ huynh, số điện thoại
- Hiển thị progress bar cho partial payment
- Action buttons: Xem chi tiết, Thanh toán, In hóa đơn

### 2. Order Detail Page

**Layout:**
```
┌─────────────────────────────────────────┐
│  Hóa Đơn #1                              │
├─────────────────────────────────────────┤
│  Phụ huynh: Nguyễn Văn A                │
│  SĐT: 0901234567                        │
│  Tổng tiền: 5,000,000 VNĐ               │
│  Đã đóng: 3,000,000 VNĐ                 │
│  Còn lại: 2,000,000 VNĐ                 │
│  Trạng thái: [Partial]                  │
├─────────────────────────────────────────┤
│  Chi tiết:                               │
│  - Học phí Toán lớp 5A: 2,000,000       │
│  - Học phí Văn lớp 5B: 3,000,000       │
├─────────────────────────────────────────┤
│  Lịch sử thanh toán:                     │
│  - 15/01: 3,000,000 (Chuyển khoản)     │
│  [Xác nhận thanh toán]                  │
└─────────────────────────────────────────┘
```

### 3. Confirm Payment Modal

**Layout:**
```
┌─────────────────────────────────────────┐
│  Xác Nhận Thanh Toán                    │
├─────────────────────────────────────────┤
│  Hóa đơn: #1                            │
│  Còn lại: 2,000,000 VNĐ                 │
│                                         │
│  Số tiền: [2,000,000]                   │
│  Phương thức: [Chuyển khoản ▼]         │
│  Chứng từ: [Upload file...]            │
│                                         │
│  [Hủy]  [Xác nhận]                     │
└─────────────────────────────────────────┘
```

### 4. React Code Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/order';

interface ConfirmPaymentDto {
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER';
  evidence?: string;
}

export const OrderDetailPage: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<ConfirmPaymentDto>({
    amount: 0,
    method: 'BANK_TRANSFER',
  });

  const queryClient = useQueryClient();

  // Fetch order
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrder(orderId),
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (data: ConfirmPaymentDto) =>
      orderApi.confirmPayment(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setShowPaymentModal(false);
      alert('Xác nhận thanh toán thành công!');
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const remaining = order.finalAmount - order.totalPaid;
  const paymentProgress = (order.totalPaid / order.finalAmount) * 100;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hóa Đơn #{order.id}</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-500">Phụ huynh</label>
            <p className="font-semibold">{order.payerName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <p>{order.payerPhone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tổng tiền</label>
            <p className="text-lg font-bold">
              {order.finalAmount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Đã đóng</label>
            <p className="text-lg font-bold text-green-600">
              {order.totalPaid.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Tiến độ thanh toán</span>
            <span>{paymentProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded text-sm ${
              order.status === 'paid'
                ? 'bg-green-100 text-green-800'
                : order.status === 'partial'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status === 'paid'
              ? 'Đã thanh toán'
              : order.status === 'partial'
              ? 'Thanh toán một phần'
              : 'Chưa thanh toán'}
          </span>
        </div>

        {remaining > 0 && (
          <button
            onClick={() => {
              setPaymentData({ ...paymentData, amount: remaining });
              setShowPaymentModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Xác nhận thanh toán
          </button>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Lịch sử thanh toán</h2>
        {order.transactions?.map((tx) => (
          <div
            key={tx.id}
            className="border-b py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {tx.amount.toLocaleString('vi-VN')} VNĐ
              </p>
              <p className="text-sm text-gray-500">
                {new Date(tx.transactionDate).toLocaleString('vi-VN')} -{' '}
                {tx.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
              </p>
            </div>
            {tx.evidenceImage && (
              <a
                href={tx.evidenceImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm"
              >
                Xem chứng từ
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Xác nhận thanh toán</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số tiền
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                  min="0.01"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phương thức
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      method: e.target.value as 'CASH' | 'BANK_TRANSFER',
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CASH">Tiền mặt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chứng từ (URL)
                </label>
                <input
                  type="text"
                  value={paymentData.evidence || ''}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      evidence: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmPaymentMutation.mutate(paymentData)}
                disabled={confirmPaymentMutation.isPending || paymentData.amount <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {confirmPaymentMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Order Fields

### Tax Fields
- **taxTotal** (decimal 15,2): Tổng tiền thuế của tất cả các dòng (tổng vatAmount của tất cả items)
- **subTotal** (decimal 15,2): Tổng tiền hàng chưa thuế (tổng amount của tất cả items)

### Calculation Logic
```
subTotal = SUM(order_items.amount)
taxTotal = SUM(order_items.vatAmount)
totalAmount = subTotal + taxTotal (hoặc có thể khác tùy logic)
finalAmount = totalAmount - discountTotal
```

## Integration Notes

1. **Payment Confirmation**: Luôn validate `amount > 0` trước khi gọi API
2. **Overpayment**: Phần nộp thừa tự động chuyển vào ví, không cần xử lý thủ công
3. **Multiple Payments**: Hỗ trợ thanh toán nhiều lần, status tự động cập nhật
4. **Transaction Safety**: Sử dụng pessimistic locking, đảm bảo không bị double payment
5. **VAT Calculation**: VAT được tính ở cấp OrderItem, taxTotal là tổng VAT của tất cả items

