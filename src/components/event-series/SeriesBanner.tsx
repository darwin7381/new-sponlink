'use client';

import React from 'react';
import Image from 'next/image';
import { EventSeries } from '@/types/event';

interface SeriesBannerProps {
  series: EventSeries;
}

const SeriesBanner: React.FC<SeriesBannerProps> = ({ series }) => {
  return (
    <div className="relative w-full h-80 sm:h-96">
      <Image
        src={series.cover_image || "https://placehold.co/1200x400/333/FFF"}
        alt={series.title}
        className="object-cover object-center brightness-75"
        fill
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
    </div>
  );
};

export default SeriesBanner; 