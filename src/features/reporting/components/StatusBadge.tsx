/**
 * Status Badge Component
 * Reusable badge for displaying status with color coding
 */

import { getStatusVariant } from '../utils/report.utils';

interface StatusBadgeProps {
    status: string;
    variant?: 'success' | 'warning' | 'danger' | 'default';
}

const variantStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
    const autoVariant = variant || getStatusVariant(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[autoVariant]}`}>
            {status}
        </span>
    );
}
