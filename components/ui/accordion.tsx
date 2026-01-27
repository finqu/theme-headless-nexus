'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-sm px-4 py-4 text-left font-sans text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 sm:px-6 data-[state=open]:[&_[data-accordion-vertical]]:scale-y-0 data-[state=open]:[&_[data-accordion-vertical]]:rotate-90 data-[state=open]:[&_[data-accordion-vertical]]:opacity-0',
          className
        )}
        {...props}
      >
        {children}
        <span className="pointer-events-none relative size-4 shrink-0 translate-y-0.5">
          <span className="bg-muted-foreground absolute top-1/2 left-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2" />
          <span
            data-accordion-vertical
            className="bg-muted-foreground absolute top-1/2 left-1/2 h-full w-px origin-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('px-4 pt-0 pb-4 sm:px-6', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
