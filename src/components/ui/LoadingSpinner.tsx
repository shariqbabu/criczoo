import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
    <div
      className={cn(
        'rounded-full border-2 border-slate-700 border-t-green-500 animate-spin',
        sizeMap[size]
      )}
    />
    {text && <p className="text-sm text-slate-400">{text}</p>}
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center hero-bg">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full border-2 border-slate-700 border-t-green-500 animate-spin mx-auto" />
      <p className="text-slate-400 text-sm">Loading CricArena...</p>
    </div>
  </div>
);
