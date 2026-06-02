import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  helperText,
  className,
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full bg-slate-800/70 border border-slate-700/60 text-slate-100 rounded-xl px-4 py-2.5 text-sm',
          'placeholder:text-slate-500 focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20',
          'transition-all duration-150',
          icon && 'pl-10',
          error && 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
    {helperText && !error && (
      <p className="text-xs text-slate-500">{helperText}</p>
    )}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
    )}
    <select
      className={cn(
        'w-full bg-slate-800/70 border border-slate-700/60 text-slate-100 rounded-xl px-4 py-2.5 text-sm',
        'focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20',
        'transition-all duration-150 appearance-none cursor-pointer',
        error && 'border-red-500/60',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-800">
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);
