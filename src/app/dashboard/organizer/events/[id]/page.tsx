'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { getEventById, updateEvent } from "@/services/eventService";
import { adaptNewEventToOld } from "@/lib/types-adapter";
import { Event } from "@/lib/types/events";

export default function EventDetailsPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 獲取事件
  useEffect(() => {
    async function fetchEvent() {
      try {
        if (params.id) {
          setIsLoading(true);
          const fetchedEvent = await getEventById(params.id as string);
          setEvent(adaptNewEventToOld(fetchedEvent));
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "獲取活動失敗",
          description: "無法加載活動信息。請稍後再試。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  if (isLoading) {
    return <div>加載中...</div>;
  }

  if (!event) {
    return <div>找不到活動</div>;
  }

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {/* 其他活動詳情顯示 */}
    </div>
  );
} 