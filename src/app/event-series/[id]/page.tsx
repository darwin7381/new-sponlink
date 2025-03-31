"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Tag, Users } from "lucide-react";
import { getEventSeriesById, getEventsInSeries, getMainEventInSeries } from "@/services/eventSeriesService";
import { EventSeries, Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventSeriesPageProps {
  params: Promise<{ id: string }>
}

export default function EventSeriesPage({ params }: EventSeriesPageProps) {
  const [seriesId, setSeriesId] = useState<string>("");
  const [series, setSeries] = useState<EventSeries | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [mainEvent, setMainEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // 解析参数
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // 在 Next.js 15 中需要等待解析params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setSeriesId(id);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };
    
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) return; // 等待seriesId设置好
      
      try {
        setLoading(true);
        const seriesData = await getEventSeriesById(seriesId);
        if (seriesData) {
          setSeries(seriesData);
          
          // 获取系列中的所有活动
          const eventsData = await getEventsInSeries(seriesData.id);
          setEvents(eventsData as Event[]);
          
          // 获取主要活动
          if (seriesData.main_event_id) {
            const mainEventData = await getMainEventInSeries(seriesData.id);
            setMainEvent(mainEventData);
          }
        }
      } catch (error) {
        console.error('Error fetching event series data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-[500px] w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-foreground">活動系列未找到</h1>
        <p className="mt-4 text-muted-foreground">
          您請求的活動系列不存在或已被刪除。
        </p>
        <Link href="/event-series">
          <Button className="mt-8">返回活動系列列表</Button>
        </Link>
      </div>
    );
  }

  // 格式化日期
  const startDate = series.start_time ? format(new Date(series.start_time), "yyyy年MM月dd日") : "未定";
  const endDate = series.end_time ? format(new Date(series.end_time), "yyyy年MM月dd日") : "未定";

  // 计算系列持续时间（天数）
  const getDurationDays = () => {
    if (!series.start_time || !series.end_time) return "未定";
    const start = new Date(series.start_time);
    const end = new Date(series.end_time);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const durationDays = getDurationDays();

  return (
    <div className="bg-background">
      {/* 顶部横幅 */}
      <div className="relative w-full h-[400px]">
        <Image
          src={series.cover_image}
          alt={series.title}
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-2 mb-6 rounded-md">
              {series.series_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{series.title}</h1>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{startDate} - {endDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{typeof durationDays === 'number' ? `${durationDays} 天` : durationDays}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{series.locations.join(', ')}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{events.length} 場活動</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 系列描述 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">關於此活動系列</h2>
          <p className="text-muted-foreground whitespace-pre-line">{series.description}</p>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">標籤</h3>
            <div className="flex flex-wrap gap-2">
              {series.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主要活动 */}
      {mainEvent && (
        <div className="bg-secondary/30">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">主要活動</h2>
              <div className="mb-8">
                <EventCard event={mainEvent} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 系列活动列表 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">系列活動 ({events.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events
              .filter(event => !mainEvent || event.id !== mainEvent.id)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 