import { cn } from '@/lib/utils';

interface GradientBorderProps {
  /** Position of the border - 'top' or 'bottom' */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable gradient border component
 * Creates a decorative border with a gradient fade effect at the edges
 * Can be used as both top and bottom border
 */
export function GradientBorder({ position = 'top', className }: GradientBorderProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-1/2 h-px w-screen -translate-x-1/2',
        'bg-[linear-gradient(to_right,--theme(--color-foreground/.06),--theme(--color-foreground/.12)_200px,--theme(--color-foreground/.12)_calc(100%-200px),--theme(--color-foreground/.06))]',
        position === 'top' ? 'top-[-1px]' : 'bottom-[0px]',
        className
      )}
    />
  );
}
