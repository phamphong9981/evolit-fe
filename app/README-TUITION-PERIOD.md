# Tuition Period Controller API Documentation

## Overview
Controller quản lý kỳ học phí (Tuition Periods) - định nghĩa các kỳ thu phí (thường là theo tháng). Mỗi kỳ có thời gian bắt đầu và kết thúc, được sử dụng để tính toán học phí pro-rate và tạo hóa đơn.

**Status Lifecycle:**
- `CREATED`: Mới tạo, chưa làm gì cả (Nháp) - có thể chỉnh sửa, xóa
- `ACTIVE`: Đã sinh công nợ (Billing Generated), đang thu tiền - có thể cập nhật thanh toán
- `CLOSED`: Đã chốt sổ (Reconciled), khóa toàn bộ dữ liệu - không thể thay đổi

## Base Path
`/api/tuition-periods` (hoặc `/tuition-periods` tùy cấu hình global prefix)

---

## Endpoints

### 1. Get All Tuition Periods
**Lấy danh sách tất cả kỳ học phí**

#### `GET /tuition-periods`

**Query Parameters:**
- `status` (enum, optional): Lọc theo trạng thái
  - `CREATED`: Kỳ mới tạo (nháp)
  - `ACTIVE`: Kỳ đang thu tiền
  - `CLOSED`: Kỳ đã chốt sổ

**Examples:**
- `GET /tuition-periods` - Lấy tất cả
- `GET /tuition-periods?status=CREATED` - Chỉ lấy kỳ nháp
- `GET /tuition-periods?status=ACTIVE` - Chỉ lấy kỳ đang thu tiền

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tháng 1/2024",
    "month": 1,
    "year": 2024,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Tháng 2/2024",
    "month": 2,
    "year": 2024,
    "startDate": "2024-02-01",
    "endDate": "2024-02-29",
    "status": "CREATED",
    "createdAt": "2024-02-01T00:00:00Z",
    "updatedAt": "2024-02-01T00:00:00Z"
  }
]
```

**Use Case:**
- Dropdown chọn kỳ học phí (chỉ hiển thị CREATED hoặc ACTIVE)
- Danh sách kỳ để quản lý
- Filter theo năm và status

---

### 2. Get Tuition Period by ID
**Lấy chi tiết một kỳ học phí**

#### `GET /tuition-periods/:id`

**Path Parameters:**
- `id` (number): ID của kỳ học phí

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tháng 1/2024",
  "month": 1,
  "year": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Tuition period with ID 999 not found"
}
```

---

### 3. Create Tuition Period
**Tạo kỳ học phí mới**

#### `POST /tuition-periods`

**Request Body:**
```json
{
  "name": "Tháng 3/2024",
  "month": 3,
  "year": 2024,
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "status": "CREATED"
}
```

**Request Fields:**
- `name` (string, required): Tên kỳ học phí (ví dụ: "Tháng 3/2024")
- `month` (number, required, 1-12): Tháng
- `year` (number, required, 2000-2100): Năm
- `startDate` (string, required, ISO date): Ngày bắt đầu
- `endDate` (string, required, ISO date): Ngày kết thúc
- `status` (enum, optional): Trạng thái (mặc định: `CREATED`)
  - `CREATED`: Mới tạo (nháp)
  - `ACTIVE`: Đang thu tiền
  - `CLOSED`: Đã chốt sổ

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "Tháng 3/2024",
  "month": 3,
  "year": 2024,
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "status": "CREATED",
  "createdAt": "2024-03-01T00:00:00Z",
  "updatedAt": "2024-03-01T00:00:00Z"
}
```

**Error Responses:**

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Tuition period 3/2024 already exists"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed"
}
```

**Validation Rules:**
- `month` phải từ 1-12
- `year` phải từ 2000-2100
- `endDate` phải >= `startDate`
- `month` và `year` phải unique (không trùng lặp)

---

### 4. Update Tuition Period
**Cập nhật thông tin kỳ học phí**

#### `PATCH /tuition-periods/:id`

**Path Parameters:**
- `id` (number): ID của kỳ học phí

**Request Body:**
```json
{
  "name": "Tháng 3/2024 (Cập nhật)",
  "endDate": "2024-03-30"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "name": "Tháng 3/2024 (Cập nhật)",
  "month": 3,
  "year": 2024,
  "startDate": "2024-03-01",
  "endDate": "2024-03-30",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Tuition period with ID 999 not found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Tuition period 3/2024 already exists"
}
```

**Lưu ý:**
- Nếu cập nhật `month` hoặc `year`, hệ thống sẽ kiểm tra trùng lặp
- Không thể cập nhật kỳ có status `CLOSED`
- Không nên cập nhật kỳ đã được sử dụng để tạo hóa đơn

---

### 5. Update Tuition Period Status ⭐
**Cập nhật trạng thái kỳ học phí**

#### `PATCH /tuition-periods/:id/status`

**Path Parameters:**
- `id` (number): ID của kỳ học phí

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Request Fields:**
- `status` (enum, required): Trạng thái mới
  - `CREATED`: Mới tạo (nháp)
  - `ACTIVE`: Đang thu tiền (sau khi generate billing)
  - `CLOSED`: Đã chốt sổ (sau khi reconcile)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tháng 1/2024",
  "month": 1,
  "year": 2024,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "status": "ACTIVE",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Tuition period with ID 999 not found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Cannot change status of a closed tuition period"
}
```

```json
{
  "statusCode": 400,
  "message": "Can only close an active tuition period"
}
```

**Status Transition Rules:**
- `CREATED` → `ACTIVE`: Sau khi generate billing thành công
- `ACTIVE` → `CLOSED`: Sau khi reconcile (chốt sổ)
- `CLOSED` → Không thể thay đổi (locked)
- Không thể chuyển trực tiếp từ `CREATED` → `CLOSED`

**Use Case:**
- Sau khi generate billing: Cập nhật status từ `CREATED` → `ACTIVE`
- Sau khi reconcile: Cập nhật status từ `ACTIVE` → `CLOSED`
- Kỳ `CLOSED` không thể chỉnh sửa hoặc tạo billing mới

---

### 6. Delete Tuition Period
**Xóa kỳ học phí**

#### `DELETE /tuition-periods/:id`

**Path Parameters:**
- `id` (number): ID của kỳ học phí

**Response (204 No Content)**

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Tuition period with ID 999 not found"
}
```

**Lưu ý:**
- Không thể xóa kỳ có status `CLOSED`
- Không nên xóa kỳ đã được sử dụng để tạo hóa đơn (status `ACTIVE` hoặc `CLOSED`)
- Chỉ nên xóa kỳ có status `CREATED` (nháp)

---

## UI Suggestions

### 1. Tuition Period List Page

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Quản lý Kỳ Học Phí              [Tạo Kỳ Mới]          │
├─────────────────────────────────────────────────────────┤
│  Filter: [Năm: 2024 ▼] [Tìm kiếm...]                   │
├─────────────────────────────────────────────────────────┤
│  Tên kỳ        | Tháng/Năm | Thời gian      | Actions   │
├─────────────────────────────────────────────────────────┤
│  Tháng 1/2024  | 1/2024    | 01/01 - 31/01 | [Sửa][Xóa]│
│  Tháng 2/2024  | 2/2024    | 01/02 - 29/02 | [Sửa][Xóa]│
│  Tháng 3/2024  | 3/2024    | 01/03 - 31/03 | [Sửa][Xóa]│
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Filter theo năm và status
- Sort theo tháng/năm
- Hiển thị số ngày trong kỳ
- Hiển thị trạng thái với badge màu:
  - `CREATED`: Xám (Nháp)
  - `ACTIVE`: Xanh dương (Đang thu tiền)
  - `CLOSED`: Xanh lá (Đã chốt sổ)
- Disable actions cho kỳ `CLOSED`

### 2. Create/Edit Tuition Period Form

**Layout:**
```
┌─────────────────────────────────────────┐
│  Tạo Kỳ Học Phí                         │
├─────────────────────────────────────────┤
│  Tên kỳ: [Tháng 3/2024]                 │
│  Tháng: [3 ▼]                           │
│  Năm: [2024]                            │
│  Ngày bắt đầu: [01/03/2024]            │
│  Ngày kết thúc: [31/03/2024]           │
│                                         │
│  [Hủy]  [Lưu]                          │
└─────────────────────────────────────────┘
```

**Features:**
- Auto-fill `name` từ `month` và `year`
- Auto-calculate `endDate` từ `month` và `year` (số ngày trong tháng)
- Validation real-time
- Preview số ngày trong kỳ

### 3. Tuition Period Dropdown (for Billing)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Chọn kỳ học phí: [Tháng 1/2024 ▼]     │
│    - Tháng 1/2024 (01/01 - 31/01)      │
│    - Tháng 2/2024 (01/02 - 29/02)      │
│    - Tháng 3/2024 (01/03 - 31/03)      │
└─────────────────────────────────────────┘
```

**Features:**
- Chỉ hiển thị kỳ có status `CREATED` hoặc `ACTIVE` (chưa chốt sổ)
- Sort theo tháng/năm giảm dần
- Hiển thị thời gian và status để dễ nhận biết
- Disable kỳ `CLOSED` trong dropdown

### 4. React Code Example

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tuitionPeriodApi } from '../api/tuition-period';

interface TuitionPeriod {
  id: number;
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
}

export const TuitionPeriodListPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TuitionPeriod | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch periods
  const { data: periods, isLoading } = useQuery({
    queryKey: ['tuition-periods'],
    queryFn: () => tuitionPeriodApi.getAll(),
  });

  // Fetch by status
  const { data: activePeriods } = useQuery({
    queryKey: ['tuition-periods', 'ACTIVE'],
    queryFn: () => tuitionPeriodApi.getByStatus('ACTIVE'),
  });

  // Filter by year
  const filteredPeriods = periods?.filter(
    (p) => !yearFilter || p.year === yearFilter
  );

  // Get unique years
  const years = Array.from(
    new Set(periods?.map((p) => p.year) || [])
  ).sort((a, b) => b - a);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<TuitionPeriod>) =>
      tuitionPeriodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      setShowCreateModal(false);
      alert('Tạo kỳ học phí thành công!');
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TuitionPeriod> }) =>
      tuitionPeriodApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      setEditingPeriod(null);
      alert('Cập nhật thành công!');
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      tuitionPeriodApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      alert('Cập nhật trạng thái thành công!');
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tuitionPeriodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuition-periods'] });
      alert('Xóa thành công!');
    },
    onError: (error: any) => {
      alert(`Lỗi: ${error.message}`);
    },
  });

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Kỳ Học Phí</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tạo Kỳ Mới
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={yearFilter || ''}
          onChange={(e) =>
            setYearFilter(e.target.value ? Number(e.target.value) : null)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">Tất cả năm</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Tên kỳ</th>
              <th className="px-4 py-3 text-left">Tháng/Năm</th>
              <th className="px-4 py-3 text-left">Thời gian</th>
              <th className="px-4 py-3 text-left">Số ngày</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeriods?.map((period) => (
              <tr key={period.id} className="border-b">
                <td className="px-4 py-3">{period.name}</td>
                <td className="px-4 py-3">
                  {period.month}/{period.year}
                </td>
                <td className="px-4 py-3">
                  {new Date(period.startDate).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(period.endDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  {calculateDays(period.startDate, period.endDate)} ngày
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      period.status === 'CLOSED'
                        ? 'bg-green-100 text-green-800'
                        : period.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {period.status === 'CLOSED'
                      ? 'Đã chốt sổ'
                      : period.status === 'ACTIVE'
                      ? 'Đang thu tiền'
                      : 'Nháp'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {period.status !== 'CLOSED' && (
                    <>
                      <button
                        onClick={() => setEditingPeriod(period)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Sửa
                      </button>
                      {period.status === 'CREATED' && (
                        <button
                          onClick={() => {
                            if (confirm('Chuyển sang trạng thái ACTIVE?')) {
                              updateStatusMutation.mutate({
                                id: period.id,
                                status: 'ACTIVE',
                              });
                            }
                          }}
                          className="text-green-600 hover:underline mr-3"
                        >
                          Kích hoạt
                        </button>
                      )}
                      {period.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            if (confirm('Chốt sổ kỳ này? Không thể hoàn tác!')) {
                              updateStatusMutation.mutate({
                                id: period.id,
                                status: 'CLOSED',
                              });
                            }
                          }}
                          className="text-orange-600 hover:underline mr-3"
                        >
                          Chốt sổ
                        </button>
                      )}
                      {period.status === 'CREATED' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa?')) {
                              deleteMutation.mutate(period.id);
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPeriod) && (
        <TuitionPeriodForm
          period={editingPeriod}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPeriod(null);
          }}
          onSubmit={(data) => {
            if (editingPeriod) {
              updateMutation.mutate({ id: editingPeriod.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

// Form Component
const TuitionPeriodForm: React.FC<{
  period: TuitionPeriod | null;
  onClose: () => void;
  onSubmit: (data: Partial<TuitionPeriod>) => void;
}> = ({ period, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: period?.name || '',
    month: period?.month || new Date().getMonth() + 1,
    year: period?.year || new Date().getFullYear(),
    startDate: period?.startDate || '',
    endDate: period?.endDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Auto-calculate end date from month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  React.useEffect(() => {
    if (formData.month && formData.year) {
      const days = getDaysInMonth(formData.month, formData.year);
      const startDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-01`;
      const endDate = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(days).padStart(2, '0')}`;
      setFormData((prev) => ({
        ...prev,
        name: `Tháng ${formData.month}/${formData.year}`,
        startDate,
        endDate,
      }));
    }
  }, [formData.month, formData.year]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">
          {period ? 'Sửa Kỳ Học Phí' : 'Tạo Kỳ Học Phí'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên kỳ</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tháng</label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="2000"
                max="2100"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {period ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## Integration Notes

1. **Unique Constraint**: `month` và `year` phải unique, không được trùng lặp
2. **Date Validation**: `endDate` phải >= `startDate`
3. **Auto-calculation**: Nên tự động tính `endDate` từ `month` và `year` (số ngày trong tháng)
4. **Status Lifecycle**: 
   - Kỳ mới tạo có status `CREATED` (mặc định)
   - Sau khi generate billing thành công → chuyển sang `ACTIVE`
   - Sau khi reconcile → chuyển sang `CLOSED`
   - Kỳ `CLOSED` không thể chỉnh sửa hoặc xóa
5. **Delete Protection**: 
   - Chỉ cho phép xóa kỳ có status `CREATED`
   - Không thể xóa kỳ `ACTIVE` hoặc `CLOSED`
6. **Naming Convention**: Tên kỳ thường theo format "Tháng X/YYYY"
7. **Status Filter**: Sử dụng query parameter `?status=ACTIVE` để lọc kỳ theo trạng thái

