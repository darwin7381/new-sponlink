'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFoundState: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-foreground">Event Series Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        The event series you requested doesn&apos;t exist or has been removed.
      </p>
      <Link href="/event-series">
        <Button className="mt-8">Back to Event Series</Button>
      </Link>
    </div>
  );
};

export default NotFoundState; 