'use client';

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getEventById } from "@/services/eventService";
import { adaptNewEventToOld } from "@/lib/types-adapter";
import { Event } from "@/lib/types/events";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 獲取事件數據
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        
        if (!params || !params.id) {
          setError("無效的事件ID");
          return;
        }
        
        // 在 Next.js 15 中，params可能是一个Promise
        const eventId = typeof params.id === 'string' 
          ? params.id 
          : (params.id instanceof Promise 
              ? await params.id 
              : Array.isArray(params.id) 
                ? params.id[0] 
                : null);
                
        if (!eventId) {
          setError("無法獲取有效的事件ID");
          return;
        }

        const fetchedEvent = await getEventById(eventId);
        if (fetchedEvent) {
          setEvent(adaptNewEventToOld(fetchedEvent));
        } else {
          setError("找不到事件數據");
        }
      } catch (err) {
        console.error("獲取事件數據時出錯", err);
        setError("加載事件數據時出錯");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params]);

  if (loading) {
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