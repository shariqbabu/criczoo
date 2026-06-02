import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'upcoming' | 'completed' | 'cancelled' | 'green' | 'blue' | 'purple' | 'default';
  className?: string;
}

const variantClasses = {
  live: 'bg-red-500/20 text-red-400 border-red-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      variantClasses[variant],
      className
    )}
  >
    {variant === 'live' && (
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse" />
    )}
    {children}
  </span>
);
