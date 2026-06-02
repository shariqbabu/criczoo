import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  primary:
    'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-900/30',
  secondary:
    'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
  ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/30',
  outline:
    'border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg
        className="w-4 h-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    ) : (
      icon
    )}
    {children}
  </button>
);
