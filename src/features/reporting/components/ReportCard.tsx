/**
 * Report Card Component
 * Reusable card for displaying summary metrics
 */

import type { LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/report.utils';

interface ReportCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    format?: 'number' | 'currency' | 'percentage' | 'text';
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const variantStyles = {
    default: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const iconBgStyles = {
    default: 'bg-gray-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
};

export function ReportCard({
    title,
    value,
    icon: Icon,
    variant = 'default',
    format = 'number',
    subtitle,
    trend,
}: ReportCardProps) {
    const formatValue = (val: number | string): string => {
        if (typeof val === 'string') return val;

        switch (format) {
            case 'currency':
                return formatCurrency(val);
            case 'percentage':
                return `${val.toFixed(1)}%`;
            case 'number':
                return formatNumber(val);
            default:
                return String(val);
        }
    };

    return (
        <div className={`p-6 rounded-xl border-2 ${variantStyles[variant]} transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-75 mb-1">{title}</p>
                    <p className="text-2xl font-bold mb-1">{formatValue(value)}</p>
                    {subtitle && (
                        <p className="text-xs opacity-60">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`text-xs mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${iconBgStyles[variant]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}
