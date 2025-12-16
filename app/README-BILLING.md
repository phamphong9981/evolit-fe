# Billing Controller API Documentation

## Overview
Controller quản lý việc tạo hóa đơn tự động (billing generation) cho các kỳ học phí. API này tự động tính toán học phí pro-rate, gộp bill theo phụ huynh, và trừ tiền từ ví học sinh.

## Base Path
`/api/billing` (hoặc `/billing` tùy cấu hình global prefix)

---

## Endpoints

### 1. Generate Monthly Billing
**Tạo hóa đơn tự động cho một kỳ học phí**

#### `POST /billing/generate`

**Mô tả:**
- Tự động tạo hóa đơn cho tất cả học sinh có enrollment ACTIVE/RESERVED trong kỳ học phí
- Gộp bill theo `parent_phone` (một phụ huynh có nhiều con → 1 hóa đơn)
- Tính học phí pro-rate nếu học sinh vào giữa tháng
- Tự động trừ tiền từ `student_wallets` nếu có
- Hỗ trợ chế độ Draft để xem trước kết quả

**Request Body:**
```json
{
  "periodId": 12,
  "isDraft": false
}
```

**Request Fields:**
- `periodId` (number, required): ID của kỳ học phí (tuition_period)
- `isDraft` (boolean, optional): 
  - `true`: Chỉ tính toán, không lưu vào DB (xem trước)
  - `false`: Thực sự tạo orders và order_items

**Response (200 OK) - Non-Draft Mode:**
```json
{
  "periodId": 12,
  "isDraft": false,
  "ordersCreated": 25,
  "itemsCreated": 48,
  "totalFinalAmount": 125000000
}
```

**Response (200 OK) - Draft Mode:**
```json
{
  "periodId": 12,
  "isDraft": true,
  "ordersCreated": 25,
  "itemsCreated": 48,
  "totalFinalAmount": 125000000,
  "details": [
    {
      "payerName": "Nguyễn Văn A",
      "payerPhone": "0901234567",
      "studentNames": ["Nguyễn Văn B", "Nguyễn Văn C"],
      "totalAmount": 5000000,
      "walletDeduction": 500000,
      "finalAmount": 4500000,
      "notes": [
        "10: Tuition for 30/31 days (2000000)",
        "10: Wallet deduction (-500000)",
        "11: Tuition for 30/31 days (3000000)"
      ]
    }
  ]
}
```

**Response Fields:**
- `periodId` (number): ID kỳ học phí đã xử lý
- `isDraft` (boolean): Trạng thái draft
- `ordersCreated` (number): Số hóa đơn đã tạo (hoặc sẽ tạo nếu draft)
- `itemsCreated` (number): Tổng số order items đã tạo (hoặc sẽ tạo nếu draft)
- `totalFinalAmount` (number): Tổng số tiền cần thu (sau khi trừ ví)
- `details` (array, optional): Chi tiết preview từng hóa đơn (chỉ có khi `isDraft = true`)
  - `payerName` (string): Tên phụ huynh
  - `payerPhone` (string): Số điện thoại phụ huynh
  - `studentNames` (string[]): Danh sách tên các con
  - `totalAmount` (number): Tổng tiền học phí (trước khi trừ ví)
  - `walletDeduction` (number): Tổng tiền trừ từ ví
  - `finalAmount` (number): Tiền phải đóng cuối cùng
  - `notes` (string[]): Ghi chú chi tiết từng dòng item

**Error Responses:**

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Tuition period 12 not found"
}
```

**400 Bad Request (Lỗi tính toán):**
```json
{
  "statusCode": 400,
  "message": "Lỗi khi tính toán công nợ: [chi tiết lỗi]"
}
```

**Logic Flow:**
1. Validate kỳ học phí tồn tại
2. Kiểm tra idempotency (nếu không phải draft, cảnh báo nếu đã có orders)
3. Lấy tất cả enrollments ACTIVE/RESERVED overlap với kỳ
4. Group enrollments theo `parent_phone`
5. Với mỗi group:
   - Tính học phí pro-rate cho từng enrollment
   - Trừ tiền từ `student_wallets` (nếu có)
   - Nếu `isDraft = true`: Thêm vào `details` array để preview
   - Nếu `isDraft = false`: Tạo 1 Order và các OrderItems tương ứng
6. Nếu `isDraft = false`: Cập nhật `tuition_periods.status = ACTIVE`
7. Trả về thống kê (kèm `details` nếu là draft)

**Lưu ý:**
- Nếu `isDraft = true`, transaction sẽ rollback sau khi tính toán, không lưu gì vào DB
- Wallet chỉ được trừ khi `isDraft = false`
- Học phí pro-rate: `(base_fee / total_days) * remaining_days`
- Khi `isDraft = false`, kỳ học phí sẽ tự động chuyển sang status `ACTIVE`
- Response `details` chỉ có khi `isDraft = true` để xem trước chi tiết

---

## UI Suggestions

### 1. Generate Billing Page

**Layout:**
```
┌─────────────────────────────────────────┐
│  Tạo Hóa Đơn Tự Động                    │
├─────────────────────────────────────────┤
│  Kỳ học phí: [Dropdown: Tuition Period]│
│  ☐ Chế độ xem trước (Draft)             │
│                                         │
│  [Tạo Hóa Đơn]                          │
└─────────────────────────────────────────┘
```

**Features:**
- Dropdown chọn kỳ học phí (chỉ hiển thị kỳ chưa được chốt)
- Checkbox "Xem trước" để bật Draft mode
- Button "Tạo Hóa Đơn" với loading state
- Hiển thị kết quả sau khi tạo:
  - Số hóa đơn đã tạo
  - Số items đã tạo
  - Tổng số tiền
  - Link đến danh sách orders

### 2. React Code Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { billingApi } from '../api/billing';

interface GenerateBillingRequest {
  periodId: number;
  isDraft?: boolean;
}

interface BillingPreviewDetail {
  payerName: string;
  payerPhone: string;
  studentNames: string[];
  totalAmount: number;
  walletDeduction: number;
  finalAmount: number;
  notes: string[];
}

interface BillingResult {
  periodId: number;
  isDraft: boolean;
  ordersCreated: number;
  itemsCreated: number;
  totalFinalAmount: number;
  details?: BillingPreviewDetail[];
}

export const GenerateBillingPage: React.FC = () => {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Fetch tuition periods
  const { data: periods } = useQuery({
    queryKey: ['tuition-periods'],
    queryFn: () => billingApi.getTuitionPeriods(),
  });

  // Generate billing mutation
  const generateMutation = useMutation({
    mutationFn: (data: GenerateBillingRequest) =>
      billingApi.generateBilling(data),
    onSuccess: (result: BillingResult) => {
      alert(
        `Tạo thành công!\n` +
        `- Hóa đơn: ${result.ordersCreated}\n` +
        `- Items: ${result.itemsCreated}\n` +
        `- Tổng tiền: ${result.totalFinalAmount.toLocaleString('vi-VN')} VNĐ`
      );
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!periodId) {
      alert('Vui lòng chọn kỳ học phí');
      return;
    }

    generateMutation.mutate({
      periodId,
      isDraft,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tạo Hóa Đơn Tự Động</h1>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">
            Kỳ học phí
          </label>
          <select
            value={periodId || ''}
            onChange={(e) => setPeriodId(Number(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={generateMutation.isPending}
          >
            <option value="">-- Chọn kỳ --</option>
            {periods?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.month}/{p.year})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="draft"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
            className="mr-2"
            disabled={generateMutation.isPending}
          />
          <label htmlFor="draft" className="text-sm">
            Chế độ xem trước (Draft) - Không lưu vào database
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!periodId || generateMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {generateMutation.isPending ? 'Đang tạo...' : 'Tạo Hóa Đơn'}
        </button>

        {generateMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">
              {isDraft ? 'Xem trước kết quả' : 'Tạo thành công!'}
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>Hóa đơn {isDraft ? 'sẽ tạo' : 'đã tạo'}: {generateMutation.data.ordersCreated}</li>
              <li>Items {isDraft ? 'sẽ tạo' : 'đã tạo'}: {generateMutation.data.itemsCreated}</li>
              <li>
                Tổng tiền:{' '}
                {generateMutation.data.totalFinalAmount.toLocaleString('vi-VN')}{' '}
                VNĐ
              </li>
            </ul>

            {/* Preview Details (chỉ hiển thị khi là draft) */}
            {isDraft && generateMutation.data.details && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Chi tiết từng hóa đơn:</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generateMutation.data.details.map((detail, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border">
                      <p className="font-medium">{detail.payerName} ({detail.payerPhone})</p>
                      <p className="text-xs text-gray-600">
                        Học sinh: {detail.studentNames.join(', ')}
                      </p>
                      <div className="mt-2 text-xs space-y-1">
                        <p>Tiền học: {detail.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                        {detail.walletDeduction > 0 && (
                          <p className="text-orange-600">
                            Trừ ví: -{detail.walletDeduction.toLocaleString('vi-VN')} VNĐ
                          </p>
                        )}
                        <p className="font-semibold">
                          Phải đóng: {detail.finalAmount.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {generateMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {generateMutation.error?.message || 'Có lỗi xảy ra'}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Integration Notes

1. **Draft Mode**: 
   - Luôn test với `isDraft: true` trước khi tạo thật
   - Response sẽ có field `details` chứa chi tiết từng hóa đơn để preview
   - Không có gì được lưu vào database khi `isDraft = true`

2. **Status Update**: 
   - Khi `isDraft = false`, kỳ học phí sẽ tự động chuyển sang status `ACTIVE`
   - Đảm bảo kỳ chỉ chuyển sang ACTIVE sau khi tạo hóa đơn thành công

3. **Idempotency**: API sẽ cảnh báo nếu kỳ đã có orders, nhưng không chặn (để cho phép tạo lại một phần)

4. **Performance**: Quá trình tạo có thể mất vài giây nếu có nhiều enrollments

5. **Transaction Safety**: Toàn bộ quá trình nằm trong transaction, đảm bảo tính nhất quán

6. **Preview Details**: 
   - Field `details` chỉ có khi `isDraft = true`
   - Mỗi item trong `details` đại diện cho một hóa đơn sẽ được tạo
   - `notes` chứa thông tin chi tiết từng dòng item (studentId, note, amount)

