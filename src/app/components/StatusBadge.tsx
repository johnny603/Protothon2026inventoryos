import { ItemStatus } from './types';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const statusConfig = {
    'available': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Available' },
    'checked-out': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Checked Out' },
    'overdue': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Overdue' },
    'damaged': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Damaged' },
    'lost': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Lost' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}
