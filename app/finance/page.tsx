'use client';

import Link from 'next/link';
import { DollarSign, Calendar, Receipt, FileText } from 'lucide-react';

export default function FinancePage() {
  const menuItems = [
    {
      href: '/finance/tuition-periods',
      label: 'Quản lý Kỳ Học Phí',
      description: 'Tạo và quản lý các kỳ học phí',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      href: '/finance/billing',
      label: 'Tạo Hóa Đơn',
      description: 'Tạo hóa đơn tự động cho kỳ học phí',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      href: '/finance/orders',
      label: 'Danh Sách Hóa Đơn',
      description: 'Xem và quản lý các hóa đơn',
      icon: Receipt,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Quản lý Tài chính
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Quản lý kỳ học phí, hóa đơn và thanh toán
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-start gap-4">
                <div className={`${item.color} rounded-lg p-3 text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.label}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

