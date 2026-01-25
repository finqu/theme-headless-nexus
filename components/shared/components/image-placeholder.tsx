import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Custom text to display */
  text?: string;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Reusable image placeholder component
 * Displays a consistent "No image" message when product images are missing
 */
export function ImagePlaceholder({
  size = 'md',
  className,
  text = 'No image',
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gray-100 text-gray-400',
        sizeClasses[size],
        className
      )}
    >
      <span>{text}</span>
    </div>
  );
}
