import { cn, getInitials } from '../../lib/utils';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-slate-700',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-semibold text-white ring-2 ring-slate-700',
        sizeClasses[size],
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
};
