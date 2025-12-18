# Transaction Controller API Documentation

## Overview
Controller quản lý giao dịch thanh toán (Transactions) - các khoản thanh toán cho hóa đơn. Một Order có thể có nhiều Transactions (hỗ trợ thanh toán nhiều lần/trả góp).

## Base Path
`/api/transactions` (hoặc `/transactions` tùy cấu hình global prefix)

---

## Endpoints

### 1. Get All Transactions
**Lấy danh sách tất cả giao dịch**

#### `GET /transactions`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "amount": 2000000,
    "paymentMethod": "BANK_TRANSFER",
    "transactionDate": "2024-01-15T10:00:00Z",
    "evidenceImage": "https://example.com/receipt.jpg",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "orderId": 1,
    "amount": 3000000,
    "paymentMethod": "CASH",
    "transactionDate": "2024-01-16T14:30:00Z",
    "evidenceImage": null,
    "createdAt": "2024-01-16T14:30:00Z",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
]
```

**Use Case:**
- Xem tất cả giao dịch trong hệ thống
- Báo cáo doanh thu
- Audit trail

---

### 2. Get Transactions by Order
**Lấy tất cả giao dịch của một hóa đơn**

#### `GET /transactions/by-order/:orderId`

**Path Parameters:**
- `orderId` (number): ID của hóa đơn

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": 1,
    "amount": 2000000,
    "paymentMethod": "BANK_TRANSFER",
    "transactionDate": "2024-01-15T10:00:00Z",
    "evidenceImage": "https://example.com/receipt1.jpg",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "orderId": 1,
    "amount": 3000000,
    "paymentMethod": "BANK_TRANSFER",
    "transactionDate": "2024-01-16T14:30:00Z",
    "evidenceImage": "https://example.com/receipt2.jpg",
    "createdAt": "2024-01-16T14:30:00Z",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
]
```

**Use Case:**
- Hiển thị lịch sử thanh toán của một hóa đơn
- Xem chi tiết các lần thanh toán
- Tính tổng số tiền đã thanh toán

---

### 3. Get Transactions by Payment Method
**Lấy danh sách giao dịch theo phương thức thanh toán**

#### `GET /transactions/by-payment-method?paymentMethod=CASH`

**Query Parameters:**
- `paymentMethod` (enum, required): Phương thức thanh toán
  - `CASH`: Tiền mặt
  - `BANK_TRANSFER`: Chuyển khoản

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "orderId": 1,
    "amount": 3000000,
    "paymentMethod": "CASH",
    "transactionDate": "2024-01-16T14:30:00Z",
    "evidenceImage": null,
    "createdAt": "2024-01-16T14:30:00Z",
    "updatedAt": "2024-01-16T14:30:00Z"
  }
]
```

**Use Case:**
- Thống kê theo phương thức thanh toán
- Báo cáo doanh thu tiền mặt vs chuyển khoản
- Phân tích xu hướng thanh toán

---

### 4. Get Transaction by ID
**Lấy chi tiết một giao dịch**

#### `GET /transactions/:id`

**Path Parameters:**
- `id` (number): ID của giao dịch

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 2000000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionDate": "2024-01-15T10:00:00Z",
  "evidenceImage": "https://example.com/receipt.jpg",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "order": {
    "id": 1,
    "payerName": "Nguyễn Văn A",
    "finalAmount": 5000000,
    "totalPaid": 2000000,
    "status": "partial",
    ...
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Transaction with ID 999 not found"
}
```

---

### 5. Create Transaction ⭐
**Tạo giao dịch mới với hỗ trợ phân bổ thanh toán theo từng order item**

#### `POST /transactions`

**Mô tả:**
- Tạo transaction và tự động phân bổ số tiền vào các order items
- Hỗ trợ 2 chế độ: **Thanh toán chỉ định** (FE gửi allocations) hoặc **Thanh toán chung** (auto allocate)
- Tự động cập nhật `Order.totalPaid`, `Order.status`, và `OrderItem.paidAmount`

**Request Body:**
```json
{
  "orderId": 1,
  "totalAmount": 2000000,
  "paymentMethod": "BANK_TRANSFER",
  "evidenceImage": "https://example.com/receipt.jpg",
  "allocations": [
    {
      "orderItemId": 1,
      "amount": 1000000
    },
    {
      "orderItemId": 2,
      "amount": 1000000
    }
  ]
}
```

**Request Fields:**
- `orderId` (number, required): ID của hóa đơn
- `totalAmount` (number, required, min: 0.01): Tổng số tiền thanh toán
- `paymentMethod` (enum, optional): Phương thức thanh toán (mặc định: `CASH`)
  - `CASH`: Tiền mặt
  - `BANK_TRANSFER`: Chuyển khoản
- `evidenceImage` (string, optional): URL hoặc path đến ảnh chứng từ
- `allocations` (array, optional): Danh sách phân bổ thanh toán cho từng order item
  - Nếu **có** `allocations`: Thanh toán chỉ định (Case 1)
  - Nếu **không có** `allocations`: Thanh toán chung - tự động phân bổ (Case 2)

**Allocation Object:**
- `orderItemId` (number, required): ID của order item
- `amount` (number, required, min: 0.01): Số tiền phân bổ cho item này

**Response (201 Created):**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 2000000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionDate": "2024-01-15T10:00:00Z",
  "evidenceImage": "https://example.com/receipt.jpg",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

**400 Bad Request - Tổng allocations vượt quá totalAmount:**
```json
{
  "statusCode": 400,
  "message": "Total allocated amount (2500000) exceeds transaction amount (2000000)"
}
```

**400 Bad Request - Allocation vượt quá nợ của item:**
```json
{
  "statusCode": 400,
  "message": "Allocated amount (1500000) exceeds item debt (1000000) for OrderItem 1"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found"
}
```

**400 Bad Request - Order đã bị hủy:**
```json
{
  "statusCode": 400,
  "message": "Cannot create transaction for cancelled order"
}
```

---

## Payment Allocation Logic

### Case 1: Thanh Toán Chỉ Định (Specified Allocation)
**Khi FE gửi `allocations` array:**

**Request:**
```json
{
  "orderId": 1,
  "totalAmount": 3000000,
  "paymentMethod": "BANK_TRANSFER",
  "allocations": [
    { "orderItemId": 1, "amount": 1500000 },
    { "orderItemId": 2, "amount": 1500000 }
  ]
}
```

**Logic:**
1. Validate tổng allocations ≤ totalAmount
2. Validate mỗi allocation không vượt quá nợ của item (`totalLineAmount - paidAmount`)
3. Lưu transaction và các allocations
4. Update `OrderItem.paidAmount` cho từng item
5. Update `Order.totalPaid` và `Order.status`

**Use Case:**
- Khách hàng muốn thanh toán cụ thể cho từng món học phí
- Thanh toán một phần cho một số items nhất định
- Phân bổ thanh toán theo yêu cầu đặc biệt

### Case 2: Thanh Toán Chung (Auto Allocate / Waterfall)
**Khi FE KHÔNG gửi `allocations` (hoặc array rỗng):**

**Request:**
```json
{
  "orderId": 1,
  "totalAmount": 3000000,
  "paymentMethod": "CASH"
}
```

**Logic:**
1. Lấy tất cả order items của Order (sắp xếp theo `id` ASC - item cũ trước)
2. Tự động phân bổ theo thứ tự:
   - Trả hết nợ của item đầu tiên
   - Nếu còn tiền, trả tiếp item thứ 2
   - Tiếp tục cho đến khi hết tiền hoặc hết items
3. Lưu transaction và các allocations tự động
4. Update `OrderItem.paidAmount` và `Order.totalPaid`

**Ví dụ:**
```
Order có 3 items:
- Item 1: totalLineAmount = 2,000,000, paidAmount = 0 → Nợ: 2,000,000
- Item 2: totalLineAmount = 1,500,000, paidAmount = 0 → Nợ: 1,500,000
- Item 3: totalLineAmount = 1,000,000, paidAmount = 0 → Nợ: 1,000,000

Khách thanh toán: 3,000,000 (không có allocations)

Kết quả:
- Item 1: nhận 2,000,000 (trả hết nợ)
- Item 2: nhận 1,000,000 (còn nợ 500,000)
- Item 3: nhận 0 (chưa được trả)
```

**Use Case:**
- Thanh toán đơn giản, không cần chỉ định cụ thể
- Thanh toán trả góp - tự động ưu tiên items cũ
- UI đơn giản, chỉ cần nhập số tiền

---

## Frontend Integration Guide

### 1. Thanh Toán Đơn Giản (Auto Allocate)

```typescript
// API Call
const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 1,
    totalAmount: 3000000,
    paymentMethod: 'BANK_TRANSFER',
    evidenceImage: 'https://example.com/receipt.jpg'
    // Không có allocations → Auto allocate
  })
});
```

**UI Flow:**
1. User chọn Order
2. User nhập số tiền thanh toán
3. User chọn phương thức thanh toán
4. User upload ảnh chứng từ (nếu có)
5. Click "Xác nhận thanh toán"
6. System tự động phân bổ vào các items

### 2. Thanh Toán Chỉ Định (Specified Allocation)

```typescript
// API Call
const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 1,
    totalAmount: 3000000,
    paymentMethod: 'BANK_TRANSFER',
    evidenceImage: 'https://example.com/receipt.jpg',
    allocations: [
      { orderItemId: 1, amount: 2000000 },
      { orderItemId: 2, amount: 1000000 }
    ]
  })
});
```

**UI Flow:**
1. User chọn Order
2. System hiển thị danh sách OrderItems với số tiền còn nợ
3. User nhập số tiền thanh toán cho từng item
4. System validate tổng allocations ≤ totalAmount
5. User chọn phương thức thanh toán và upload chứng từ
6. Click "Xác nhận thanh toán"

### 3. React Component Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface OrderItem {
  id: number;
  amount: number;
  totalLineAmount: number;
  paidAmount: number;
  type: string;
  note?: string;
}

export const PaymentForm: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [evidenceImage, setEvidenceImage] = useState('');
  const [allocations, setAllocations] = useState<{ orderItemId: number; amount: number }[]>([]);
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('auto');

  // Fetch order items
  const { data: items } = useQuery({
    queryKey: ['order-items', orderId],
    queryFn: () => fetch(`/api/order-items/by-order/${orderId}`).then(r => r.json()),
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
    onSuccess: () => {
      alert('Thanh toán thành công!');
      // Refresh order data
    },
  });

  const handleSubmit = () => {
    const payload: any = {
      orderId,
      totalAmount,
      paymentMethod,
    };

    if (evidenceImage) {
      payload.evidenceImage = evidenceImage;
    }

    // Chỉ gửi allocations nếu là manual mode và có dữ liệu
    if (allocationMode === 'manual' && allocations.length > 0) {
      payload.allocations = allocations;
    }

    createTransaction.mutate(payload);
  };

  const calculateRemainingDebt = (item: OrderItem) => {
    return item.totalLineAmount - (item.paidAmount || 0);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Thanh Toán Hóa Đơn</h2>

      {/* Allocation Mode Toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={allocationMode === 'auto'}
            onChange={() => setAllocationMode('auto')}
          />
          <span>Thanh toán tự động (Ưu tiên items cũ)</span>
        </label>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="radio"
            checked={allocationMode === 'manual'}
            onChange={() => setAllocationMode('manual')}
          />
          <span>Thanh toán chỉ định (Chọn items cụ thể)</span>
        </label>
      </div>

      {/* Total Amount Input */}
      <div className="mb-4">
        <label className="block mb-1">Tổng số tiền thanh toán</label>
        <input
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(Number(e.target.value))}
          className="w-full p-2 border rounded"
          min="0.01"
          step="1000"
        />
      </div>

      {/* Manual Allocation Mode */}
      {allocationMode === 'manual' && items && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Phân bổ thanh toán:</h3>
          {items.map((item: OrderItem) => {
            const remainingDebt = calculateRemainingDebt(item);
            const allocation = allocations.find(a => a.orderItemId === item.id);
            
            return (
              <div key={item.id} className="mb-2 p-2 border rounded">
                <div className="flex justify-between mb-1">
                  <span>{item.note || `Item #${item.id}`}</span>
                  <span className="text-sm text-gray-500">
                    Còn nợ: {remainingDebt.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <input
                  type="number"
                  value={allocation?.amount || 0}
                  onChange={(e) => {
                    const newAllocations = allocations.filter(a => a.orderItemId !== item.id);
                    if (Number(e.target.value) > 0) {
                      newAllocations.push({
                        orderItemId: item.id,
                        amount: Number(e.target.value),
                      });
                    }
                    setAllocations(newAllocations);
                  }}
                  className="w-full p-1 border rounded"
                  min="0"
                  max={remainingDebt}
                  step="1000"
                  placeholder="Nhập số tiền"
                />
              </div>
            );
          })}
          <div className="mt-2 text-sm text-gray-600">
            Tổng phân bổ: {allocations.reduce((sum, a) => sum + a.amount, 0).toLocaleString('vi-VN')} VNĐ
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block mb-1">Phương thức thanh toán</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="w-full p-2 border rounded"
        >
          <option value="CASH">Tiền mặt</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
        </select>
      </div>

      {/* Evidence Image */}
      <div className="mb-4">
        <label className="block mb-1">Chứng từ (URL)</label>
        <input
          type="text"
          value={evidenceImage}
          onChange={(e) => setEvidenceImage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/receipt.jpg"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={createTransaction.isPending || totalAmount <= 0}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {createTransaction.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
      </button>

      {/* Error Display */}
      {createTransaction.isError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {createTransaction.error?.message || 'Có lỗi xảy ra'}
        </div>
      )}
    </div>
  );
};
```

---

## Validation Rules

### Tổng Allocations
- Tổng `allocations[].amount` phải ≤ `totalAmount`
- Nếu vượt quá → Error 400

### Item Debt
- Mỗi `allocation.amount` phải ≤ `item.totalLineAmount - item.paidAmount`
- Nếu vượt quá → Error 400

### Order Status
- Order phải không bị `CANCELLED`
- Nếu cancelled → Error 400

### OrderItem Ownership
- Tất cả `allocations[].orderItemId` phải thuộc về `orderId`
- Nếu không → Error 400

---

## Auto-Update Behavior

Sau khi tạo transaction thành công, system tự động:

1. ✅ Tạo `Transaction` record
2. ✅ Tạo các `TransactionAllocation` records
3. ✅ Update `OrderItem.paidAmount` cho từng item được phân bổ
4. ✅ Update `Order.totalPaid` = `oldTotalPaid + totalAmount`
5. ✅ Update `Order.status`:
   - `PAID`: Nếu `totalPaid >= finalAmount`
   - `PARTIAL`: Nếu `totalPaid > 0` và `totalPaid < finalAmount`
   - `PENDING`: Nếu `totalPaid = 0`

**Lưu ý:**
- Tất cả operations được thực hiện trong transaction (atomic)
- Nếu có lỗi, tất cả sẽ rollback
- Sử dụng pessimistic lock để tránh race condition

---

### 6. Update Transaction
**Cập nhật thông tin giao dịch**

#### `PATCH /transactions/:id`

**Path Parameters:**
- `id` (number): ID của giao dịch

**Request Body:**
```json
{
  "evidenceImage": "https://example.com/new-receipt.jpg",
  "transactionDate": "2024-01-15T11:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 2000000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionDate": "2024-01-15T11:00:00Z",
  "evidenceImage": "https://example.com/new-receipt.jpg",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

**Lưu ý:**
- Không nên thay đổi `amount` và `orderId` sau khi đã tạo
- Nếu cần sửa số tiền, nên xóa transaction cũ và tạo mới

---

### 7. Delete Transaction
**Xóa giao dịch**

#### `DELETE /transactions/:id`

**Path Parameters:**
- `id` (number): ID của giao dịch

**Response (204 No Content)**

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Transaction with ID 999 not found"
}
```

**Lưu ý:**
- Khi xóa transaction, cần cập nhật lại `totalPaid` và `status` của Order tương ứng
- Xóa transaction sẽ không tự động cập nhật Order

---

## Payment Methods

### CASH
- **Mô tả**: Thanh toán bằng tiền mặt
- **Use Case**: Thanh toán trực tiếp tại trung tâm
- **Evidence**: Thường không có chứng từ (evidenceImage = null)

### BANK_TRANSFER
- **Mô tả**: Chuyển khoản ngân hàng
- **Use Case**: Thanh toán qua ngân hàng, ví điện tử
- **Evidence**: Nên có ảnh chứng từ (screenshot chuyển khoản, biên lai)

---

## UI Suggestions

### 1. Transaction List in Order Detail

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Lịch Sử Thanh Toán - Hóa Đơn #1                        │
├─────────────────────────────────────────────────────────┤
│  Ngày        | Số tiền      | Phương thức | Chứng từ   │
├─────────────────────────────────────────────────────────┤
│  15/01/2024  | 2,000,000    | Chuyển khoản| [Xem]      │
│  16/01/2024  | 3,000,000    | Tiền mặt    | -          │
├─────────────────────────────────────────────────────────┤
│  Tổng đã đóng: 5,000,000 VNĐ                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Hiển thị theo thứ tự thời gian (mới nhất trước)
- Màu sắc khác nhau cho từng phương thức:
  - CASH: Xanh lá
  - BANK_TRANSFER: Xanh dương
- Click vào chứng từ để xem ảnh full size
- Tổng hợp số tiền đã thanh toán

### 2. Payment Method Statistics

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Thống Kê Phương Thức Thanh Toán                        │
├─────────────────────────────────────────────────────────┤
│  Tiền mặt:        15,000,000 VNĐ (30%)                 │
│  Chuyển khoản:    35,000,000 VNĐ (70%)                 │
├─────────────────────────────────────────────────────────┤
│  Tổng cộng:       50,000,000 VNĐ                       │
└─────────────────────────────────────────────────────────┘
```

### 3. React Code Example

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../api/transaction';

interface Transaction {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  transactionDate: string;
  evidenceImage?: string;
}

export const TransactionList: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', 'by-order', orderId],
    queryFn: () => transactionApi.getByOrder(orderId),
  });

  if (isLoading) return <div>Loading...</div>;

  const totalPaid = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  const getMethodLabel = (method: string) => {
    return method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản';
  };

  const getMethodColor = (method: string) => {
    return method === 'CASH' ? 'text-green-600' : 'text-blue-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Lịch Sử Thanh Toán</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Ngày</th>
              <th className="text-left py-2">Số tiền</th>
              <th className="text-left py-2">Phương thức</th>
              <th className="text-left py-2">Chứng từ</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx: Transaction) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2">
                  {new Date(tx.transactionDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-2 font-semibold">
                  {tx.amount.toLocaleString('vi-VN')} VNĐ
                </td>
                <td className={`py-2 ${getMethodColor(tx.paymentMethod)}`}>
                  {getMethodLabel(tx.paymentMethod)}
                </td>
                <td className="py-2">
                  {tx.evidenceImage ? (
                    <a
                      href={tx.evidenceImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Xem
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold">
              <td colSpan={2} className="py-2 text-right">
                Tổng đã đóng:
              </td>
              <td className="py-2" colSpan={2}>
                {totalPaid.toLocaleString('vi-VN')} VNĐ
              </td>
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

1. **Auto Creation**: Transaction thường được tạo tự động khi gọi `POST /orders/:id/payment`
2. **Multiple Payments**: Hỗ trợ thanh toán nhiều lần cho một Order (trả góp)
3. **Order Status**: Khi tạo transaction qua Order Payment API, status của Order sẽ tự động cập nhật:
   - `partial`: Nếu `totalPaid < finalAmount`
   - `paid`: Nếu `totalPaid >= finalAmount`
4. **Overpayment**: Nếu thanh toán vượt quá `finalAmount`, phần thừa sẽ tự động chuyển vào ví học sinh
5. **Evidence**: Nên upload ảnh chứng từ cho các giao dịch chuyển khoản để dễ đối soát
6. **Cascade Delete**: Khi xóa Order, tất cả Transactions liên quan sẽ bị xóa (CASCADE)

---

## Transaction Flow

### Normal Payment Flow
```
1. User calls POST /orders/:id/payment
2. System creates Transaction record
3. System updates Order.totalPaid
4. System updates Order.status (partial/paid)
5. If overpayment: System adds excess to student wallet
```

### Manual Transaction Creation
```
1. User calls POST /transactions (with orderId)
2. System creates Transaction record
3. ⚠️ User must manually update Order.totalPaid and Order.status
```

---

## Best Practices

1. **Always use Order Payment API**: Sử dụng `POST /orders/:id/payment` thay vì tạo transaction thủ công để đảm bảo tính nhất quán
2. **Evidence for Bank Transfer**: Luôn upload ảnh chứng từ cho giao dịch chuyển khoản
3. **Transaction Date**: Để mặc định `NOW()` trừ khi cần backdate cho mục đích đặc biệt
4. **Amount Validation**: Đảm bảo `amount > 0` trước khi tạo transaction
5. **Audit Trail**: Không xóa transaction, chỉ nên tạo transaction mới để điều chỉnh


