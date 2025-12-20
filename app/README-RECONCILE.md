# Reconcile Controller API Documentation

## Overview
Controller quản lý việc chốt sổ và hoàn tiền (reconcile) cho các kỳ học phí. API này tự động tính toán và hoàn tiền cho các học sinh nghỉ có phép (ABSENT_WITH_PERMISSION) trong kỳ học phí đã chốt sổ.

**Công thức tính hoàn tiền:**
- Số tiền hoàn lại = `baseTuitionFee / tổng số buổi học trong kỳ`
- Chỉ tính cho các attendance có status `ABSENT_WITH_PERMISSION` và chưa được reconcile (`isReconciled = false`)

## Base Path
`/api/reconcile` (hoặc `/reconcile` tùy cấu hình global prefix)

---

## Endpoints

### 1. Reconcile Period
**Chốt sổ kỳ học phí và hoàn tiền cho học sinh nghỉ có phép**

#### `POST /reconcile/period/:id`

**Mô tả:**
- Tính toán và hoàn tiền cho các học sinh nghỉ có phép trong kỳ học phí
- Hỗ trợ 2 chế độ: `PREVIEW` (xem trước) và `EXECUTE` (thực thi)
- Khi `EXECUTE`, hệ thống sẽ:
  - Cập nhật `isReconciled = true` cho tất cả attendance đã được tính hoàn tiền
  - Cộng tiền hoàn lại vào `student_wallets` của từng học sinh
  - Chuyển status của kỳ học phí sang `CLOSED`

**Path Parameters:**
- `id` (number, required): ID của kỳ học phí (tuition_period)

**Request Body:**
```json
{
  "mode": "PREVIEW"
}
```

**Request Fields:**
- `mode` (enum, required): Chế độ thực thi
  - `PREVIEW`: Chỉ tính toán và trả về kết quả, không cập nhật database
  - `EXECUTE`: Thực sự hoàn tiền và cập nhật database

**Response (200 OK) - PREVIEW Mode:**
```json
{
  "periodId": 12,
  "mode": "PREVIEW",
  "totalRefundAmount": 1500000,
  "attendanceCount": 15,
  "studentRefunds": [
    {
      "studentId": 1,
      "studentName": "Nguyễn Văn A",
      "refundAmount": 500000,
      "attendanceCount": 5
    },
    {
      "studentId": 2,
      "studentName": "Trần Thị B",
      "refundAmount": 1000000,
      "attendanceCount": 10
    }
  ],
  "executed": false
}
```

**Response (200 OK) - EXECUTE Mode:**
```json
{
  "periodId": 12,
  "mode": "EXECUTE",
  "totalRefundAmount": 1500000,
  "attendanceCount": 15,
  "studentRefunds": [
    {
      "studentId": 1,
      "studentName": "Nguyễn Văn A",
      "refundAmount": 500000,
      "attendanceCount": 5
    },
    {
      "studentId": 2,
      "studentName": "Trần Thị B",
      "refundAmount": 1000000,
      "attendanceCount": 10
    }
  ],
  "executed": true
}
```

**Response Fields:**
- `periodId` (number): ID kỳ học phí đã xử lý
- `mode` (enum): Chế độ đã sử dụng (`PREVIEW` hoặc `EXECUTE`)
- `totalRefundAmount` (number): Tổng số tiền hoàn lại (VNĐ)
- `attendanceCount` (number): Số lượng attendance đã được tính hoàn tiền
- `studentRefunds` (array): Danh sách hoàn tiền theo từng học sinh
  - `studentId` (number): ID học sinh
  - `studentName` (string): Tên học sinh
  - `refundAmount` (number): Số tiền hoàn lại cho học sinh này (VNĐ)
  - `attendanceCount` (number): Số buổi nghỉ có phép của học sinh này
- `executed` (boolean): `true` nếu đã thực thi, `false` nếu chỉ preview

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Tuition period 999 not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Cannot reconcile a closed tuition period"
}
```

**400 Bad Request (Thực thi thất bại):**
```json
{
  "statusCode": 400,
  "message": "Failed to reconcile: [chi tiết lỗi]"
}
```

**Logic Flow:**
1. Validate kỳ học phí tồn tại
2. Kiểm tra kỳ không phải `CLOSED` (nếu mode = `EXECUTE`)
3. Lấy tất cả attendance trong khoảng thời gian của kỳ có status `ABSENT_WITH_PERMISSION` và `isReconciled = false`
4. Tính số buổi học trong kỳ cho từng lớp dựa trên `class_schedules`
5. Tính số tiền hoàn lại cho từng attendance: `baseTuitionFee / tổng số buổi trong kỳ`
6. Gom nhóm hoàn tiền theo học sinh
7. Nếu `mode = EXECUTE`:
   - Cập nhật `isReconciled = true` cho tất cả attendance đã tính
   - Cộng tiền hoàn lại vào `student_wallets` (nếu chưa có ví thì tạo mới)
   - Chuyển status kỳ học phí sang `CLOSED`
8. Trả về kết quả với danh sách hoàn tiền

**Lưu ý:**
- Chỉ tính hoàn tiền cho attendance có status `ABSENT_WITH_PERMISSION`
- Chỉ tính các attendance chưa được reconcile (`isReconciled = false`)
- Luôn sử dụng `PREVIEW` mode trước để xem trước kết quả
- Khi `EXECUTE`, toàn bộ quá trình nằm trong transaction để đảm bảo tính nhất quán
- Sau khi `EXECUTE` thành công, kỳ học phí sẽ tự động chuyển sang status `CLOSED` và không thể thay đổi
- Nếu học sinh chưa có ví, hệ thống sẽ tự động tạo ví mới với số dư = số tiền hoàn lại

---

## UI Suggestions

### 1. Reconcile Period Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Chốt Sổ Kỳ Học Phí                                     │
├─────────────────────────────────────────────────────────┤
│  Kỳ học phí: [Dropdown: Tuition Period (ACTIVE)]       │
│                                                         │
│  ☑ Chế độ xem trước (Preview) - Chưa cập nhật DB       │
│                                                         │
│  [Xem Trước]  [Thực Thi Chốt Sổ]                       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Dropdown chọn kỳ học phí (chỉ hiển thị kỳ có status `ACTIVE`)
- Radio button hoặc toggle để chọn mode:
  - Preview: Chỉ xem kết quả, không cập nhật DB
  - Execute: Thực sự hoàn tiền và chốt sổ
- Button "Xem Trước" với mode `PREVIEW`
- Button "Thực Thi Chốt Sổ" với mode `EXECUTE` (cần confirm)
- Hiển thị kết quả:
  - Tổng số tiền hoàn lại
  - Số lượng attendance
  - Bảng chi tiết hoàn tiền theo học sinh

### 2. React Code Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reconcileApi } from '../api/reconcile';

interface ReconcileRequest {
  mode: 'PREVIEW' | 'EXECUTE';
}

interface StudentRefund {
  studentId: number;
  studentName: string;
  refundAmount: number;
  attendanceCount: number;
}

interface ReconcileResult {
  periodId: number;
  mode: 'PREVIEW' | 'EXECUTE';
  totalRefundAmount: number;
  attendanceCount: number;
  studentRefunds: StudentRefund[];
  executed: boolean;
}

export const ReconcilePeriodPage: React.FC = () => {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [mode, setMode] = useState<'PREVIEW' | 'EXECUTE'>('PREVIEW');

  // Fetch active tuition periods
  const { data: periods } = useQuery({
    queryKey: ['tuition-periods', 'ACTIVE'],
    queryFn: () => tuitionPeriodApi.getByStatus('ACTIVE'),
  });

  // Reconcile mutation
  const reconcileMutation = useMutation({
    mutationFn: ({ id, mode }: { id: number; mode: 'PREVIEW' | 'EXECUTE' }) =>
      reconcileApi.reconcilePeriod(id, { mode }),
    onSuccess: (result: ReconcileResult) => {
      if (result.executed) {
        alert(
          `Chốt sổ thành công!\n` +
          `- Tổng tiền hoàn lại: ${result.totalRefundAmount.toLocaleString('vi-VN')} VNĐ\n` +
          `- Số buổi nghỉ: ${result.attendanceCount}\n` +
          `- Số học sinh: ${result.studentRefunds.length}`
        );
      }
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  const handlePreview = () => {
    if (!periodId) {
      alert('Vui lòng chọn kỳ học phí');
      return;
    }
    reconcileMutation.mutate({ id: periodId, mode: 'PREVIEW' });
  };

  const handleExecute = () => {
    if (!periodId) {
      alert('Vui lòng chọn kỳ học phí');
      return;
    }

    if (
      !confirm(
        'Bạn có chắc chắn muốn chốt sổ kỳ này?\n' +
        'Sau khi chốt sổ, kỳ sẽ không thể chỉnh sửa và sẽ tự động hoàn tiền cho học sinh nghỉ có phép.\n\n' +
        'Hành động này không thể hoàn tác!'
      )
    ) {
      return;
    }

    reconcileMutation.mutate({ id: periodId, mode: 'EXECUTE' });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chốt Sổ Kỳ Học Phí</h1>

      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Kỳ học phí (Chỉ hiển thị kỳ đang thu tiền)
          </label>
          <select
            value={periodId || ''}
            onChange={(e) => setPeriodId(Number(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={reconcileMutation.isPending}
          >
            <option value="">-- Chọn kỳ --</option>
            {periods?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.month}/{p.year}) - {p.startDate} đến {p.endDate}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePreview}
            disabled={!periodId || reconcileMutation.isPending}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {reconcileMutation.isPending && mode === 'PREVIEW'
              ? 'Đang tính toán...'
              : 'Xem Trước'}
          </button>

          <button
            onClick={handleExecute}
            disabled={!periodId || reconcileMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {reconcileMutation.isPending && mode === 'EXECUTE'
              ? 'Đang chốt sổ...'
              : 'Thực Thi Chốt Sổ'}
          </button>
        </div>

        {/* Preview/Result Section */}
        {reconcileMutation.isSuccess && (
          <div className="mt-6 p-4 bg-white border rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {reconcileMutation.data.executed
                  ? '✅ Đã chốt sổ thành công!'
                  : '📋 Kết quả xem trước'}
              </h3>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  reconcileMutation.data.executed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {reconcileMutation.data.executed ? 'Đã thực thi' : 'Xem trước'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Tổng tiền hoàn lại</p>
                <p className="text-xl font-bold text-green-600">
                  {reconcileMutation.data.totalRefundAmount.toLocaleString('vi-VN')}{' '}
                  VNĐ
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Số buổi nghỉ</p>
                <p className="text-xl font-bold">
                  {reconcileMutation.data.attendanceCount}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Số học sinh</p>
                <p className="text-xl font-bold">
                  {reconcileMutation.data.studentRefunds.length}
                </p>
              </div>
            </div>

            {/* Student Refunds Table */}
            {reconcileMutation.data.studentRefunds.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Chi tiết hoàn tiền theo học sinh:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Học sinh</th>
                        <th className="px-4 py-2 text-left">Số buổi nghỉ</th>
                        <th className="px-4 py-2 text-right">Số tiền hoàn lại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconcileMutation.data.studentRefunds.map((refund) => (
                        <tr key={refund.studentId} className="border-b">
                          <td className="px-4 py-2">{refund.studentName}</td>
                          <td className="px-4 py-2">{refund.attendanceCount}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">
                            {refund.refundAmount.toLocaleString('vi-VN')} VNĐ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-right">
                          Tổng cộng:
                        </td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {reconcileMutation.data.totalRefundAmount.toLocaleString(
                            'vi-VN'
                          )}{' '}
                          VNĐ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {reconcileMutation.data.studentRefunds.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Không có học sinh nào cần hoàn tiền
              </p>
            )}
          </div>
        )}

        {reconcileMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {reconcileMutation.error?.message || 'Có lỗi xảy ra'}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Integration Notes

1. **Preview Mode**: 
   - Luôn sử dụng `PREVIEW` mode trước để xem trước kết quả
   - Không có gì được cập nhật vào database khi `mode = PREVIEW`
   - Response giống hệt `EXECUTE` mode nhưng `executed = false`

2. **Execute Mode**: 
   - Cần confirm từ user vì hành động này không thể hoàn tác
   - Toàn bộ quá trình nằm trong transaction để đảm bảo tính nhất quán
   - Sau khi `EXECUTE` thành công, kỳ học phí sẽ tự động chuyển sang status `CLOSED`
   - Không thể `EXECUTE` một kỳ đã `CLOSED`

3. **Refund Calculation**:
   - Công thức: `refundAmount = baseTuitionFee / totalSessionsInPeriod`
   - Chỉ tính cho attendance có `status = ABSENT_WITH_PERMISSION`
   - Chỉ tính các attendance chưa được reconcile (`isReconciled = false`)
   - Số buổi học trong kỳ được tính dựa trên `class_schedules` và ngày trong kỳ

4. **Student Wallet**:
   - Nếu học sinh chưa có ví, hệ thống sẽ tự động tạo ví mới
   - Số tiền hoàn lại được cộng vào `balance` của ví
   - Sử dụng `increment` để đảm bảo thread-safe

5. **Transaction Safety**: 
   - Toàn bộ quá trình `EXECUTE` nằm trong transaction
   - Nếu có lỗi xảy ra, tất cả thay đổi sẽ được rollback
   - Đảm bảo tính nhất quán dữ liệu

6. **Period Status**: 
   - Kỳ phải có status `ACTIVE` để có thể reconcile
   - Sau khi reconcile thành công, kỳ sẽ chuyển sang `CLOSED`
   - Kỳ `CLOSED` không thể chỉnh sửa hoặc tạo billing mới

7. **Performance**: 
   - API đã được tối ưu với pre-loading schedules và relations
   - Sử dụng Map để cache kết quả tính toán
   - Có thể mất vài giây nếu có nhiều attendance cần xử lý

