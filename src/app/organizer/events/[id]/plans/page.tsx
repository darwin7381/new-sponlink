'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getEventById, getSponsorshipPlans, createSponsorshipPlan } from "@/services/eventService";
import { Event, SponsorshipPlan } from "@/types/event";

export default function ManagePlansPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [plans, setPlans] = useState<SponsorshipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    price: 0,
    benefits: "",
    max_sponsors: 1,
    current_sponsors: 0
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // 檢查用戶身份
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
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

  // 獲取活動詳情和贊助方案
  useEffect(() => {
    async function fetchEventAndPlans() {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const eventData = await getEventById(params.id);
        
        if (!eventData) {
          setError("找不到該活動");
          return;
        }
        
        // 檢查當前用戶是否為活動的主辦方
        if (currentUser && eventData.organizer_id !== currentUser.id) {
          setError("您沒有權限管理此活動的贊助方案");
          router.push("/organizer/events");
          return;
        }
        
        setEvent(eventData);
        
        // 獲取贊助方案
        const plansData = await getSponsorshipPlans(params.id);
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching event and plans:", error);
        setError("無法加載活動和贊助方案。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser && isOrganizer) {
      fetchEventAndPlans();
    }
  }, [params.id, currentUser, isOrganizer, router]);

  // 處理表單輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'max_sponsors' || name === 'current_sponsors') {
      setNewPlan(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setNewPlan(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 處理創建新贊助方案
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    try {
      setIsSaving(true);
      setError("");
      
      // 處理權益
      const benefits = newPlan.benefits
        .split("\n")
        .map(benefit => benefit.trim())
        .filter(benefit => benefit !== "");
      
      // 創建新贊助方案
      const planData = {
        title: newPlan.title,
        description: newPlan.description,
        price: newPlan.price,
        benefits,
        max_sponsors: newPlan.max_sponsors,
        current_sponsors: newPlan.current_sponsors
      };
      
      const createdPlan = await createSponsorshipPlan(event.id, planData);
      
      if (createdPlan) {
        // 更新贊助方案列表
        setPlans(prev => [...prev, createdPlan]);
        
        // 重置表單
        setNewPlan({
          title: "",
          description: "",
          price: 0,
          benefits: "",
          max_sponsors: 1,
          current_sponsors: 0
        });
        
        // 關閉對話框
        setIsDialogOpen(false);
      } else {
        setError("創建贊助方案時出錯。請稍後再試。");
      }
    } catch (error) {
      console.error("Error creating sponsorship plan:", error);
      setError("創建贊助方案時出錯。請稍後再試。");
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

  if (!event) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900">找不到活動</h2>
              <p className="mt-2 text-gray-500">
                該活動可能已被刪除或您沒有權限查看。
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/organizer/events")}>
                返回活動列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" onClick={() => router.push(`/organizer/events/${event.id}`)}>
              返回活動詳情
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">管理贊助方案</h1>
            <p className="mt-2 text-gray-600">活動：{event.title}</p>
          </div>
          <Button variant="default" onClick={() => setIsDialogOpen(true)}>
            新增贊助方案
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900">尚未設置贊助方案</h2>
              <p className="mt-2 text-gray-500">
                點擊「新增贊助方案」按鈕開始創建您的第一個贊助方案。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.title}</CardTitle>
                    <div className="text-xl font-bold">${plan.price.toLocaleString()}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">權益：</h3>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {(plan.max_sponsors !== undefined && plan.current_sponsors !== undefined) && (
                    <div className="text-sm text-gray-600 mb-4">
                      贊助商：{plan.current_sponsors} / {plan.max_sponsors}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                    <Button variant="destructive" size="sm">
                      刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 新增贊助方案對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增贊助方案</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">方案名稱</Label>
              <Input
                id="title"
                name="title"
                value={newPlan.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">方案描述</Label>
              <Textarea
                id="description"
                name="description"
                value={newPlan.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">價格</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={newPlan.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="benefits">權益（每行一項）</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={newPlan.benefits}
                onChange={handleInputChange}
                rows={4}
                placeholder="主舞台演講機會&#10;VIP晚宴席位&#10;品牌在所有宣傳材料中突出展示"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_sponsors">最大贊助商數量</Label>
                <Input
                  id="max_sponsors"
                  name="max_sponsors"
                  type="number"
                  min="1"
                  value={newPlan.max_sponsors}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="current_sponsors">當前贊助商數量</Label>
                <Input
                  id="current_sponsors"
                  name="current_sponsors"
                  type="number"
                  min="0"
                  max={newPlan.max_sponsors}
                  value={newPlan.current_sponsors}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "創建中..." : "創建方案"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 