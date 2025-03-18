'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getEventById, updateEvent } from "@/services/eventService";
import { Event, Location } from "@/types/event";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: "",
    start_time: "",
    end_time: "",
    category: "",
    tags: "",
    location: {
      id: "",
      name: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined
    } as Location
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // 檢查用戶身份
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setIsAuthenticated(true);
        setIsOrganizer(user.role === 'organizer');
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // 如果未登錄或不是組織者，則重定向
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isOrganizer)) {
      router.push("/login");
    }
  }, [isAuthenticated, isOrganizer, router, isLoading]);

  // 獲取活動詳情
  useEffect(() => {
    async function fetchEventDetails() {
      setIsLoading(true);
      try {
        // 在 Next.js 15 中需要等待 params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id); // 存儲 ID 以便後續使用
        
        const fetchedEvent = await getEventById(id);
        
        if (!fetchedEvent) {
          throw new Error("Event not found");
        }

        setEvent(fetchedEvent);
        // 初始化表單數據
        setFormData({
          title: fetchedEvent.title,
          description: fetchedEvent.description,
          cover_image: fetchedEvent.cover_image,
          start_time: new Date(fetchedEvent.start_time).toISOString().slice(0, 16),
          end_time: new Date(fetchedEvent.end_time).toISOString().slice(0, 16),
          category: fetchedEvent.category || "",
          tags: fetchedEvent.tags?.join(", ") || "",
          location: {
            id: fetchedEvent.location.id || "",
            name: fetchedEvent.location.name,
            address: fetchedEvent.location.address,
            city: fetchedEvent.location.city || "",
            country: fetchedEvent.location.country || "",
            postal_code: fetchedEvent.location.postal_code || "",
            latitude: fetchedEvent.location.latitude,
            longitude: fetchedEvent.location.longitude
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        console.error("Error fetching event:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventDetails();
  }, [params]);

  // 處理表單輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    try {
      setIsSaving(true);
      setError("");
      
      // 處理標籤
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      // 準備更新數據
      const updateData = {
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        category: formData.category,
        tags,
        location: formData.location
      };
      
      const updatedEvent = await updateEvent(event.id, updateData);
      
      if (updatedEvent) {
        router.push(`/organizer/events/${event.id}`);
      } else {
        setError("更新活動時出錯。請稍後再試。");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError("更新活動時出錯。請稍後再試。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/organizer/events")}>
            返回活動列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">編輯活動</h1>
          <Button variant="outline" onClick={() => router.push(`/organizer/events/${eventId}`)}>
            取消
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">活動標題</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">活動描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cover_image">封面圖片 URL</Label>
                  <Input
                    id="cover_image"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">開始時間</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_time">結束時間</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">分類</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">標籤（以逗號分隔）</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="科技, 創新, AI"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">地點信息</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location.name">場地名稱</Label>
                      <Input
                        id="location.name"
                        name="location.name"
                        value={formData.location.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location.address">地址</Label>
                      <Input
                        id="location.address"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="location.city">城市</Label>
                      <Input
                        id="location.city"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location.country">國家</Label>
                      <Input
                        id="location.country"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location.postal_code">郵政編碼</Label>
                      <Input
                        id="location.postal_code"
                        name="location.postal_code"
                        value={formData.location.postal_code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/organizer/events/${eventId}`)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "保存中..." : "保存更改"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 