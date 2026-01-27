import { cn } from '@/lib/utils';

interface SketchyLinesProps {
  /** Angle of the lines in degrees. Defaults to 45 */
  angle?: number;
  /** Spacing between lines in pixels. Defaults to 8 */
  spacing?: number;
  /** Line thickness in pixels. Defaults to 1 */
  thickness?: number;
  /** Line color. Defaults to current text color with low opacity */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable sketchy diagonal lines pattern component
 * Creates a hand-drawn/sketchy aesthetic with repeating diagonal lines
 * Perfect for adding visual texture behind images or content
 */
export function SketchyLines({
  angle = 45,
  spacing = 8,
  thickness = 1,
  color = 'currentColor',
  className,
}: SketchyLinesProps) {
  // Calculate the pattern size based on spacing and angle
  const patternSize = spacing + thickness;

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: `repeating-linear-gradient(
          ${angle}deg,
          ${color} 0px,
          ${color} ${thickness}px,
          transparent ${thickness}px,
          transparent ${patternSize}px
        )`,
      }}
    />
  );
}
