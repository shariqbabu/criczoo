import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className, hover, onClick, animate = true }: CardProps) {
  const base = cn(
    'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
    'dark:bg-gray-900/50 dark:border-gray-700/50',
    hover && 'hover:border-emerald-500/30 cursor-pointer transition-all duration-300',
    className
  );

  if (animate) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base} onClick={onClick}>{children}</div>;
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-b border-white/10', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function StatCard({
  title, value, subtitle, icon, color = 'emerald', trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
  };

  const iconColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      className={cn('rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm', colorMap[color])}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconColorMap[color])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
