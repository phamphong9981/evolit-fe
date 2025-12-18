'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Order, CreateTransactionDto, OrderItem, TransactionAllocationDto } from '@/types/order';
import { useOrderItemsByOrder } from '@/hooks/order';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionDto) => Promise<void>;
  order: Order | null;
  preSelectedOrderItemId?: number; // Pre-select this order item when opening modal
}

export function ConfirmPaymentModal({ isOpen, onClose, onSubmit, order, preSelectedOrderItemId }: ConfirmPaymentModalProps) {
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('auto');
  const [formData, setFormData] = useState({
    totalAmount: 0,
    paymentMethod: 'BANK_TRANSFER' as 'CASH' | 'BANK_TRANSFER',
    evidenceImage: '',
  });
  const [allocations, setAllocations] = useState<TransactionAllocationDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order items when in manual mode or when pre-selected item exists
  const shouldFetchItems = isOpen && (allocationMode === 'manual' || !!preSelectedOrderItemId) && !!order;
  const { data: orderItems = [], isLoading: isLoadingItems } = useOrderItemsByOrder(
    order?.id || 0,
    shouldFetchItems
  );

  const remaining = order ? order.finalAmount - order.totalPaid : 0;

  // Reset form when order or preSelectedOrderItemId changes
  useEffect(() => {
    if (order) {
      // If preSelectedOrderItemId is provided, switch to manual mode
      if (preSelectedOrderItemId) {
        setAllocationMode('manual');
        // We'll set allocations after items are loaded
      } else {
        const remaining = order.finalAmount - order.totalPaid;
        setFormData({
          totalAmount: remaining,
          paymentMethod: 'BANK_TRANSFER',
          evidenceImage: '',
        });
        setAllocations([]);
        setAllocationMode('auto');
      }
      setError(null);
    }
  }, [order, preSelectedOrderItemId]);

  // Pre-fill allocation when orderItems are loaded and preSelectedOrderItemId is set
  useEffect(() => {
    if (preSelectedOrderItemId && orderItems.length > 0 && allocations.length === 0) {
      const selectedItem = orderItems.find((item) => item.id === preSelectedOrderItemId);
      if (selectedItem) {
        const totalLineAmount = selectedItem.totalLineAmount ?? selectedItem.amount;
        const paidAmount = selectedItem.paidAmount ?? 0;
        const remainingDebt = totalLineAmount - paidAmount;

        if (remainingDebt > 0) {
          setAllocations([{ orderItemId: selectedItem.id, amount: remainingDebt }]);
          // In manual mode, totalAmount will be calculated from allocations
        }
      }
    }
  }, [preSelectedOrderItemId, orderItems, allocations.length]);

  // Calculate remaining debt for each item
  const calculateRemainingDebt = (item: OrderItem) => {
    const totalLineAmount = item.totalLineAmount ?? item.amount;
    const paidAmount = item.paidAmount ?? 0;
    return totalLineAmount - paidAmount;
  };

  // Calculate total allocated amount
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate auto mode: totalAmount is required
    if (allocationMode === 'auto') {
      if (formData.totalAmount <= 0) {
        setError('Số tiền phải lớn hơn 0');
        return;
      }
    }

    // Validate manual allocation mode
    if (allocationMode === 'manual') {
      if (allocations.length === 0) {
        setError('Vui lòng phân bổ số tiền cho ít nhất một mục');
        return;
      }

      // Validate each allocation doesn't exceed item debt
      for (const allocation of allocations) {
        const item = orderItems.find((i) => i.id === allocation.orderItemId);
        if (!item) {
          setError(`Không tìm thấy mục hóa đơn với ID ${allocation.orderItemId}`);
          return;
        }

        const remainingDebt = calculateRemainingDebt(item);
        if (allocation.amount > remainingDebt) {
          setError(
            `Số tiền phân bổ cho "${item.note || `Mục #${item.id}`}" (${formatCurrency(allocation.amount)}) vượt quá số tiền còn nợ (${formatCurrency(remainingDebt)})`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // In manual mode, totalAmount = total of all allocations
      // In auto mode, totalAmount = user input
      const finalTotalAmount = allocationMode === 'manual' ? totalAllocated : formData.totalAmount;

      const payload: CreateTransactionDto = {
        orderId: order!.id,
        totalAmount: finalTotalAmount,
        paymentMethod: formData.paymentMethod,
      };

      if (formData.evidenceImage) {
        payload.evidenceImage = formData.evidenceImage;
      }

      // Only send allocations if in manual mode and has allocations
      if (allocationMode === 'manual' && allocations.length > 0) {
        payload.allocations = allocations;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocationChange = (orderItemId: number, amount: number) => {
    setAllocations((prev) => {
      const filtered = prev.filter((a) => a.orderItemId !== orderItemId);
      if (amount > 0) {
        return [...filtered, { orderItemId, amount }];
      }
      return filtered;
    });
  };

  const getAllocationAmount = (orderItemId: number) => {
    return allocations.find((a) => a.orderItemId === orderItemId)?.amount || 0;
  };

  if (!isOpen || !order) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Xác nhận thanh toán
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-4 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Hóa đơn:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">#{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Tổng tiền:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.finalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Đã đóng:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(order.totalPaid)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-medium dark:border-zinc-700">
              <span className="text-zinc-900 dark:text-zinc-50">Còn lại:</span>
              <span className="text-zinc-900 dark:text-zinc-50">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Allocation Mode Toggle */}
          <div className="mb-4 space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Chế độ phân bổ thanh toán
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={allocationMode === 'auto'}
                  onChange={() => {
                    setAllocationMode('auto');
                    setAllocations([]);
                  }}
                  className="h-4 w-4 text-zinc-600 focus:ring-zinc-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Tự động (Ưu tiên mục cũ)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={allocationMode === 'manual'}
                  onChange={() => setAllocationMode('manual')}
                  className="h-4 w-4 text-zinc-600 focus:ring-zinc-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Chỉ định (Chọn mục cụ thể)
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {/* Total Amount Input - Only show in AUTO mode */}
            {allocationMode === 'auto' && (
              <div>
                <label htmlFor="totalAmount" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tổng số tiền thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalAmount"
                  required
                  min="0"
                  step="1000"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, totalAmount: remaining })}
                  className="mt-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Điền số tiền còn lại
                </button>
              </div>
            )}

            {/* Manual Allocation Mode */}
            {allocationMode === 'manual' && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Phân bổ thanh toán cho từng mục:
                </h3>
                {isLoadingItems ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Không có mục nào trong hóa đơn
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const remainingDebt = calculateRemainingDebt(item);
                      const allocationAmount = getAllocationAmount(item.id);
                      const totalLineAmount = item.totalLineAmount ?? item.amount;
                      const paidAmount = item.paidAmount ?? 0;

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {item.note || `Mục #${item.id}`}
                              </div>
                              {item.student && (
                                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                  {item.student.fullName}
                                  {item.student.code && ` (${item.student.code})`}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-zinc-600 dark:text-zinc-400">
                              <div>Tổng: {formatCurrency(totalLineAmount)}</div>
                              <div>Đã đóng: {formatCurrency(paidAmount)}</div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                Còn nợ: {formatCurrency(remainingDebt)}
                              </div>
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={remainingDebt}
                            step="1"
                            value={allocationAmount}
                            onChange={(e) =>
                              handleAllocationChange(item.id, Number(e.target.value))
                            }
                            placeholder="Nhập số tiền"
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                          />
                        </div>
                      );
                    })}
                    <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-2 text-sm font-medium dark:border-zinc-700">
                      <span className="text-zinc-900 dark:text-zinc-50">
                        Tổng số tiền thanh toán:
                      </span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(totalAllocated)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                id="paymentMethod"
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value as 'CASH' | 'BANK_TRANSFER' })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              >
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>

            <div>
              <label htmlFor="evidenceImage" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Chứng từ (URL)
              </label>
              <input
                type="text"
                id="evidenceImage"
                value={formData.evidenceImage}
                onChange={(e) => setFormData({ ...formData, evidenceImage: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (allocationMode === 'auto' && formData.totalAmount <= 0) ||
                (allocationMode === 'manual' && (allocations.length === 0 || totalAllocated <= 0))
              }
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

