"use client";

import { useState, useEffect } from "react";
import { getAllEventSeries } from "@/services/eventSeriesService";
import { EventStatus, EventSeries } from "@/types/event";
import { EventSeriesCard } from "@/components/events/EventSeriesCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function EventSeriesPage() {
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<EventSeries[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventSeries = async () => {
      try {
        setLoading(true);
        const series = await getAllEventSeries({
          status: EventStatus.PUBLISHED
        });
        setEventSeries(series);
        setFilteredSeries(series);
      } catch (error) {
        console.error('Error fetching event series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventSeries();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSeries(eventSeries);
    } else {
      const normalized = searchTerm.toLowerCase();
      const filtered = eventSeries.filter(series => 
        series.title.toLowerCase().includes(normalized) ||
        series.description.toLowerCase().includes(normalized) ||
        series.tags.some(tag => tag.toLowerCase().includes(normalized)) ||
        series.locations.some(location => location.toLowerCase().includes(normalized))
      );
      setFilteredSeries(filtered);
    }
  }, [searchTerm, eventSeries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索逻辑已经在useEffect中实现
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* 顶部标题和搜索栏 */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">活動系列</h1>
          
          <form onSubmit={handleSearch} className="mb-12">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="text"
                  placeholder="搜索活動系列..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">搜索</Button>
            </div>
          </form>
          
          {/* 加载状态 */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}
          
          {/* 活动系列列表 */}
          {!loading && (
            <>
              {filteredSeries.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">未找到符合條件的活動系列</h3>
                  <p className="text-muted-foreground">
                    請嘗試使用不同的搜索關鍵詞，或者瀏覽其他活動。
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSeries.map((series) => (
                    <EventSeriesCard key={series.id} series={series} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 