'use client';

import Link from 'next/link';
import { Wallet, UserCheck, BarChart3 } from 'lucide-react';

export default function StatisticsPage() {
    const menuItems = [
        {
            href: '/statistic/wallets',
            label: 'Thống kê dư nợ học sinh',
            description: 'Xem và quản lý số dư ví của học sinh',
            icon: Wallet,
            color: 'bg-blue-500',
        },
        {
            href: '/statistic/enrollments',
            label: 'Thống kê đăng ký lớp',
            description: 'Xem danh sách học sinh tham gia hoặc nghỉ học trong khoảng thời gian',
            icon: UserCheck,
            color: 'bg-green-500',
        },
    ];

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Thống kê
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Xem các báo cáo và thống kê về học sinh và lớp học
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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

