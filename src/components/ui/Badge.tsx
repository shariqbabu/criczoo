import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'live';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const variants = {
  default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  live: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', pulse }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      variants[variant],
      sizes[size]
    )}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string; pulse?: boolean }> = {
    live: { variant: 'live', label: 'LIVE', pulse: true },
    upcoming: { variant: 'info', label: 'Upcoming' },
    completed: { variant: 'success', label: 'Completed' },
    paused: { variant: 'warning', label: 'Paused' },
    abandoned: { variant: 'danger', label: 'Abandoned' },
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    suspended: { variant: 'danger', label: 'Suspended' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
  };

  const config = map[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant} pulse={config.pulse}>{config.label}</Badge>;
}
