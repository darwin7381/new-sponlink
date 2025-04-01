'use client';

import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="h-64 w-full bg-secondary/20 animate-pulse rounded-xl mb-8"></div>
      <div className="h-32 w-1/2 bg-secondary/20 animate-pulse rounded-xl mb-12"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full bg-secondary/20 animate-pulse rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState; 