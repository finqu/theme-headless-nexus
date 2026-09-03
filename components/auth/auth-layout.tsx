import { cn } from '@/lib/utils';
import { GradientBorder } from '@/components/shared';
import { AuthGridPanel } from './auth-grid-panel';

interface AuthLayoutProps {
  /** The form content to display on the right side */
  children: React.ReactNode;
  /** Marketing panel title */
  marketingTitle?: string;
  /** Marketing panel description */
  marketingDescription?: string;
  /** Marketing panel features */
  marketingFeatures?: string[];
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Shared layout for authentication pages (login, register, etc.)
 *
 * Desktop: Grid panel on left, form on right
 * Mobile: Form first, then grid panel below
 */
export function AuthLayout({
  children,
  marketingTitle,
  marketingDescription,
  marketingFeatures,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[calc(100vh-4rem)] flex-col-reverse lg:flex-row',
        className
      )}
    >
      <GradientBorder position="top" />
      {/* Marketing Panel - Left side on desktop, bottom on mobile */}
      <div className="hidden w-full lg:block lg:w-1/2">
        <AuthGridPanel
          title={marketingTitle}
          description={marketingDescription}
          features={marketingFeatures}
          className="h-full"
        />
      </div>

      {/* Form Panel - Right side on desktop, top on mobile */}
      <div className="border-border flex w-full flex-1 flex-col items-center justify-center bg-white px-4 py-12 lg:w-1/2 lg:border-l lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Marketing Panel - Show on mobile at the bottom */}
      <div className="border-border block border-t lg:hidden">
        <AuthGridPanel
          title={marketingTitle}
          description={marketingDescription}
          features={marketingFeatures}
        />
      </div>
    </div>
  );
}
