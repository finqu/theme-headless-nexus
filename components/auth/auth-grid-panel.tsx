import { cn } from '@/lib/utils';

interface AuthGridPanelProps {
  /** Title text to display */
  title?: string;
  /** Description text */
  description?: string;
  /** Feature list items */
  features?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Marketing panel with grid background for auth pages.
 * Displays a gradient grid pattern with marketing content.
 */
export function AuthGridPanel({
  title = 'Your store, your way',
  description = 'Build beautiful, custom storefronts with complete control over your customer experience.',
  features = [
    'Fully customizable authentication flows',
    'Seamless checkout experience',
    'Real-time inventory updates',
    'Built-in customer management',
  ],
  className,
}: AuthGridPanelProps) {
  return (
    <div
      className={cn(
        'gradient-grid-background relative isolate flex min-h-[300px] flex-col justify-center px-8 py-12 lg:min-h-full lg:px-12',
        className
      )}
    >
      {/* Blurred gradient background with mask */}
      <div className="gradient-blur-wrapper blur-[100px]">
        <div className="gradient-blur-content" />
      </div>

      {/* Grid pattern overlay */}
      <svg
        aria-hidden="true"
        className="gradient-grid-overlay stroke-foreground/10"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <defs>
          <pattern
            id="auth-grid-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            x="-8"
            y="-1"
          >
            <path d="M.5 60V.5H60" fill="none" strokeDasharray="0" />
          </pattern>
        </defs>
        <rect fill="url(#auth-grid-pattern)" height="100%" strokeWidth="0" width="100%" />
      </svg>

      {/* Center fade overlay */}
      <div className="gradient-center-fade" />

      {/* Marketing content */}
      <div className="relative z-10 max-w-md">
        <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">{title}</h2>
        <p className="text-muted-foreground mb-8 text-base lg:text-lg">{description}</p>

        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="text-primary mt-0.5 size-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-muted-foreground text-sm lg:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
