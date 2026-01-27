'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientBorder } from '@/components/shared';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface GetStartedBlockProps {
  badgeText?: string;
  badgeLink?: string;
  title: string;
  description: string;
  commandName?: string;
  /** Show gradient border at the top of the section */
  gradientBorderTop?: boolean;
  /** Show gradient border at the bottom of the section */
  gradientBorderBottom?: boolean;
}

export function GetStartedBlock({
  badgeText,
  badgeLink,
  title,
  description,
  commandName = 'my-storefront',
  gradientBorderTop = false,
  gradientBorderBottom = false,
}: GetStartedBlockProps) {
  const command = `finqu storefront create ${commandName}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section className="gradient-grid-background relative isolate grid min-h-[60dvh] place-items-center px-4 py-24 lg:min-h-[80dvh]">
      {gradientBorderTop && <GradientBorder position="top" />}
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
            id="grid-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            x="-8"
            y="-1"
          >
            <path d="M.5 60V.5H60" fill="none" strokeDasharray="0" />
          </pattern>
        </defs>
        <rect fill="url(#grid-pattern)" height="100%" strokeWidth="0" width="100%" />
      </svg>

      {/* Center fade overlay */}
      <div className="gradient-center-fade" />

      <div className="relative z-10 container mx-auto max-w-xl text-center">
        {badgeText &&
          (badgeLink ? (
            <Badge
              variant="outline"
              className="bg-background mb-6 px-3 py-1.5 text-sm font-normal"
              asChild
            >
              <Link href={badgeLink}>
                {badgeText}
                <ArrowRight className="size-3.5" data-icon="inline-end" />
              </Link>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-background mb-6 px-3 py-1.5 text-sm font-normal">
              {badgeText}
            </Badge>
          ))}
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">{title}</h1>
        <p className="text-muted-foreground mb-10 text-base md:text-lg">{description}</p>

        <div className="bg-background/80 mx-auto grid max-w-md grid-cols-[1fr_auto] items-center gap-2 rounded-sm border p-2 shadow-sm backdrop-blur-sm">
          <code className="overflow-x-auto text-left font-mono text-sm whitespace-nowrap">
            {command}
          </code>
          <Button onClick={handleCopy} variant="outline" size="sm" className="shrink-0 rounded-sm">
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" />
                </svg>
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      {gradientBorderBottom && <GradientBorder position="bottom" />}
    </section>
  );
}
