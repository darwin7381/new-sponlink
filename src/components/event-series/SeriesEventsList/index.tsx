'use client';

import React, { useState } from 'react';
import { Event } from '@/types/event';
import { Search, Filter, AlignJustify, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TimelineView from './TimelineView';
import ListView from './ListView';

interface SeriesEventsListProps {
  events: Event[];
  allTags: string[];
  selectedTags: string[];
  selectedDate: Date | null;
  toggleTag: (tag: string) => void;
  clearDateFilter: () => void;
}

const SeriesEventsList: React.FC<SeriesEventsListProps> = ({
  events,
  allTags,
  selectedTags,
  selectedDate,
  toggleTag,
  clearDateFilter
}) => {
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex-1 min-w-0">
      {/* 頂部標題和控制區 */}
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4">
        <h2 className="text-xl font-semibold">
          Events
          {selectedDate && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({selectedDate.toLocaleDateString()})
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* 日期篩選器（如果選擇了日期） */}
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1 px-3"
              onClick={clearDateFilter}
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-xs">Clear date</span>
            </Button>
          )}
          
          {/* 搜尋按鈕 */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 rounded-md bg-secondary/20 px-8 text-xs border-none focus:ring-1 focus:ring-primary"
                  onBlur={() => {
                    if (searchQuery === "") {
                      setIsSearchOpen(false);
                    }
                  }}
                  autoFocus
                />
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-[10px] text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-[10px]"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          
          {/* 標籤篩選按鈕 */}
          {allTags.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex items-center gap-1 px-3"
                onClick={() => {
                  // 這裡可以添加標籤篩選的邏輯
                }}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="text-xs">Filter</span>
              </Button>
            </div>
          )}
          
          {/* 視圖切換按鈕 */}
          <div className="bg-card rounded-md overflow-hidden flex border border-border">
            <button 
              className={`p-1.5 ${viewMode === 'timeline' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
              onClick={() => setViewMode('timeline')}
              aria-label="Timeline view"
              title="Timeline view"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </button>
            <button 
              className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
            >
              <div className="h-3.5 w-3.5 flex flex-col justify-between">
                <div className="h-[1px] w-full bg-current"></div>
                <div className="h-[1px] w-full bg-current"></div>
                <div className="h-[1px] w-full bg-current"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 活動篩選標籤 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-800/30 text-neutral-200 hover:bg-neutral-800/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 bg-card/20 rounded-xl">
          <p className="text-lg text-muted-foreground">No events found</p>
          {selectedTags.length > 0 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => selectedTags.forEach(tag => toggleTag(tag))}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {events.length > 0 && viewMode === "timeline" && (
        <TimelineView events={events} />
      )}

      {events.length > 0 && viewMode === "list" && (
        <ListView events={events} />
      )}
    </div>
  );
};

export default SeriesEventsList; 