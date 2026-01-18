'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter functionality not yet implemented
  };

  return (
    <form className="flex max-w-sm gap-2" onSubmit={handleSubmit}>
      <Input type="email" placeholder="Your email" className="flex-1" />
      <Button type="submit">Subscribe</Button>
    </form>
  );
}
