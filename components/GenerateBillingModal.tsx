'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Eye, FileText } from 'lucide-react';
import type { GenerateBillingRequest, GenerateBillingResponse, BillingPreviewDetail } from '@/types/billing';

interface GenerateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateBillingRequest) => Promise<GenerateBillingResponse>;
  onConfirmCreate: (data: GenerateBillingRequest) => Promise<void>;
  periodId: number;
  periodName: string;
}

export function GenerateBillingModal({
  isOpen,
  onClose,
  onSubmit,
  onConfirmCreate,
  periodId,
  periodName,
}: GenerateBillingModalProps) {
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<GenerateBillingResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit({ periodId, isDraft: true });
      setPreviewResult(result);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xem trước');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirmCreate({ periodId, isDraft: false });
      onClose();
      setPreviewResult(null);
      setShowPreview(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo hóa đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPreviewResult(null);
    setShowPreview(false);
    setError(null);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (!isOpen) return null;

  // Preview Mode - Show results
  if (showPreview && previewResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Xem trước kết quả
              </h2>
            </div>
            <button
              onClick={() => {
                setShowPreview(false);
                setPreviewResult(null);
              }}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Số hóa đơn sẽ tạo</div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {previewResult.ordersCreated}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Số items sẽ tạo</div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {previewResult.itemsCreated}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Tổng tiền cần thu</div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(previewResult.totalFinalAmount)}
                </div>
              </div>
            </div>

            {/* Preview Details */}
            {previewResult.details && previewResult.details.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Chi tiết từng hóa đơn
                </h3>
                <div className="space-y-4">
                  {previewResult.details.map((detail: BillingPreviewDetail, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {detail.payerName}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {detail.payerPhone}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            Học sinh: {detail.studentNames.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(detail.finalAmount)}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">Phải đóng</div>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">Tiền học phí:</span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(detail.totalAmount)}
                          </span>
                        </div>
                        {detail.walletDeduction > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Trừ từ ví:</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              -{formatCurrency(detail.walletDeduction)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-semibold dark:border-zinc-700">
                          <span className="text-zinc-900 dark:text-zinc-50">Tổng cộng:</span>
                          <span className="text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(detail.finalAmount)}
                          </span>
                        </div>
                      </div>

                      {detail.notes && detail.notes.length > 0 && (
                        <div className="mt-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            Chi tiết:
                          </p>
                          <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {detail.notes.map((note: string, noteIdx: number) => (
                              <li key={noteIdx} className="flex items-start gap-2">
                                <span className="mt-0.5">•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewResult(null);
                }}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Quay lại
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Xác nhận tạo hóa đơn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial Form Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Tính toán công nợ
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Kỳ học phí: <span className="font-medium text-zinc-900 dark:text-zinc-50">{periodName}</span>
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-blue-50 p-4 dark:border-zinc-700 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Eye className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Chế độ xem trước (Draft)
                  </label>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Bấm "Xem trước" để tính toán và hiển thị kết quả chi tiết. Sau khi xem xong, bạn có thể xác nhận để tạo hóa đơn thực sự.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Lưu ý:</p>
                <p>Chế độ xem trước không lưu gì vào database. Sau khi xem kết quả, bạn sẽ có cơ hội xác nhận để tạo hóa đơn thực sự.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              onClick={handlePreview}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tính toán...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Xem trước
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

