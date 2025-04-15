'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, MapPin, User, Check, Globe, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventSeries } from '@/types/event';

interface SeriesInfoProps {
  series: EventSeries;
}

const SeriesInfo: React.FC<SeriesInfoProps> = ({ series }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };
  
  return (
    <div className="bg-card shadow-lg rounded-xl overflow-hidden mb-10">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-xl relative overflow-hidden flex-shrink-0 border-4 border-card shadow-md">
            <Image 
              src={series.cover_image || "https://placehold.co/200x200/333/FFF"}
              alt={series.title}
              className="object-cover"
              fill
            />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{series.title}</h1>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubscribe}
                  variant={isSubscribed ? "outline" : "default"}
                  className={`rounded-full ${isSubscribed ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" : ""}`}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      訂閱中
                    </>
                  ) : '訂閱'}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm mb-6">
              {series.start_time && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(series.start_time), "yyyy年MM月dd日", { locale: zhTW })}
                    {series.end_time && ` — ${format(new Date(series.end_time), "yyyy年MM月dd日", { locale: zhTW })}`}
                  </span>
                </div>
              )}
              
              {series.locations && series.locations.length > 0 && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{series.locations.join(', ')}</span>
                </div>
              )}
              
              {series.organizer && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{series.organizer}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {series.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary hover:bg-secondary/80">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              {series.website && (
                <a href={series.website} target="_blank" rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-primary"
                  aria-label={`${series.title}官方網站`}>
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {series.twitter && (
                <a href={`https://twitter.com/${series.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label={`${series.title} Twitter`}>
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {series.instagram && (
                <a href={`https://instagram.com/${series.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label={`${series.title} Instagram`}>
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        {series.description && (
          <div className="border-t pt-6">
            <p className="text-muted-foreground whitespace-pre-line">{series.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesInfo; 