'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/services/eventService";
import { EventStatus, Location } from "@/types/event";
import { isAuthenticated, hasRole, getCurrentUser } from "@/lib/services/authService";
import { USER_ROLES } from "@/lib/types/users";
import LocationSelector from "@/components/maps/LocationSelector";
import { scrapeLumaEvent } from "@/services/lumaService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 贊助方案類型定義
interface SponsorshipPlanForm {
  id: string;
  title: string;
  description: string;
  price: number;
  max_sponsors: number;
  benefits: string[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lumaImportDialogOpen, setLumaImportDialogOpen] = useState(false);
  const [lumaUrl, setLumaUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
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
  // 初始化贊助方案
  const [sponsorshipPlans, setSponsorshipPlans] = useState<SponsorshipPlanForm[]>([]);
  const [newBenefit, setNewBenefit] = useState("");
  
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthorized'>('loading');

  // 檢查用戶身份
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // 為了確保 localStorage 資料已載入，添加短暫延遲
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 檢查身份驗證狀態
        const authenticated = isAuthenticated();
        if (!authenticated) {
          if (isMounted) {
            setAuthState('unauthorized');
            router.push('/login');
          }
          return;
        }
        
        // 檢查角色權限
        const isOrganizerRole = hasRole(USER_ROLES.ORGANIZER);
        if (!isOrganizerRole) {
          if (isMounted) {
            setAuthState('unauthorized');
            router.push('/login');
          }
          return;
        }
        
        // 獲取當前用戶
        const user = await getCurrentUser();
        if (!user) {
          if (isMounted) {
            setAuthState('unauthorized');
            router.push('/login');
          }
          return;
        }
        
        if (isMounted) {
          setCurrentUser(user);
          setAuthState('authenticated');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          setError("驗證過程中發生錯誤");
          setAuthState('unauthorized');
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

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

  // 處理 Luma 導入對話框開關
  const handleLumaImportDialog = (isOpen: boolean) => {
    setLumaImportDialogOpen(isOpen);
    if (!isOpen) {
      setLumaUrl("");
      setImportError("");
    }
  };

  // 處理從 Luma 導入
  const handleImportFromLuma = async () => {
    if (!lumaUrl || !lumaUrl.includes('lu.ma') || !currentUser) {
      setImportError("請提供有效的 Luma 活動 URL");
      return;
    }

    try {
      setIsImporting(true);
      setImportError("");

      // 抓取 Luma 活動數據
      const eventData = await scrapeLumaEvent(lumaUrl, currentUser.id);
      
      if (!eventData) {
        setImportError("無法從提供的 URL 導入活動數據");
        return;
      }
      
      // 更新表單數據
      setFormData({
        title: eventData.title,
        description: eventData.description,
        cover_image: eventData.cover_image || formData.cover_image,
        start_time: new Date(eventData.start_time).toISOString().slice(0, 16),
        end_time: new Date(eventData.end_time).toISOString().slice(0, 16),
        category: eventData.category,
        tags: eventData.tags.join(", "),
        location: eventData.location
      });
      
      // 關閉對話框
      handleLumaImportDialog(false);
    } catch (error) {
      console.error("Luma import error:", error);
      // 顯示更具體的錯誤信息
      const errorMessage = error instanceof Error 
        ? error.message 
        : "導入過程中發生未知錯誤";
      
      setImportError(`導入失敗: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  // 添加贊助方案
  const addSponsorshipPlan = () => {
    const newPlan: SponsorshipPlanForm = {
      id: `temp_${Date.now()}`,
      title: "",
      description: "",
      price: 0,
      max_sponsors: 1,
      benefits: []
    };
    
    setSponsorshipPlans([...sponsorshipPlans, newPlan]);
  };

  // 更新贊助方案
  const updateSponsorshipPlan = (index: number, field: string, value: string | number) => {
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value
    };
    setSponsorshipPlans(updatedPlans);
  };

  // 刪除贊助方案
  const removeSponsorshipPlan = (index: number) => {
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans.splice(index, 1);
    setSponsorshipPlans(updatedPlans);
  };

  // 添加福利項目
  const addBenefit = (index: number) => {
    if (newBenefit.trim() === "") return;
    
    const updatedPlans = [...sponsorshipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      benefits: [...updatedPlans[index].benefits, newBenefit.trim()]
    };
    
    setSponsorshipPlans(updatedPlans);
    setNewBenefit("");
  };

  // 刪除福利項目
  const removeBenefit = (planIndex: number, benefitIndex: number) => {
    const updatedPlans = [...sponsorshipPlans];
    const updatedBenefits = [...updatedPlans[planIndex].benefits];
    updatedBenefits.splice(benefitIndex, 1);
    
    updatedPlans[planIndex] = {
      ...updatedPlans[planIndex],
      benefits: updatedBenefits
    };
    
    setSponsorshipPlans(updatedPlans);
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // 處理標籤
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      // 處理贊助方案
      const formattedSponsorshipPlans = sponsorshipPlans.map(plan => ({
        ...plan,
        price: Number(plan.price),
        max_sponsors: Number(plan.max_sponsors),
        current_sponsors: 0,
        event_id: "", // 這將在創建時由服務器填充
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // 準備創建數據
      const eventData = {
        organizer_id: currentUser.id,
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        location: formData.location,
        status: EventStatus.DRAFT,
        category: formData.category,
        tags,
        sponsorship_plans: formattedSponsorshipPlans
      };
      
      const createdEvent = await createEvent(eventData);
      
      if (createdEvent) {
        router.push(`/organizer/events/${createdEvent.id}`);
      } else {
        setError("創建活動時出錯。請稍後再試。");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("創建活動時出錯。請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  // 如果在載入中，顯示載入狀態
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">載入中...</h2>
          <p className="text-muted-foreground">正在驗證您的身份</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    // 僅顯示重定向消息，實際重定向由 useEffect 處理
    return null;
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">創建新活動</h1>
          <Button variant="outline" onClick={() => router.push("/organizer/events")} className="border-border hover:bg-accent">
            取消
          </Button>
        </div>
        
        {/* 從 Luma 導入按鈕 */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="w-full border-dashed border-primary text-primary hover:bg-primary/10"
            onClick={() => handleLumaImportDialog(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            從 Luma 導入
          </Button>
        </div>

        {/* Luma 導入對話框 */}
        <Dialog open={lumaImportDialogOpen} onOpenChange={handleLumaImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>從 Luma 導入活動</DialogTitle>
              <DialogDescription>
                輸入 Luma 活動網址以自動填充活動詳情
              </DialogDescription>
            </DialogHeader>
            
            {importError && (
              <Alert variant="destructive" className="my-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="luma-url">Luma 活動 URL</Label>
                <Input
                  id="luma-url"
                  placeholder="例如：https://lu.ma/aiuc25-designer-day"
                  value={lumaUrl}
                  onChange={(e) => setLumaUrl(e.target.value)}
                  disabled={isImporting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleLumaImportDialog(false)}
                disabled={isImporting}
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={handleImportFromLuma}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <span className="opacity-0">導入</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : "導入"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {error && (
          <Card className="border-red-300 dark:border-red-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">活動標題</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 bg-background border-border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-foreground">活動描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    className="mt-1 bg-background border-border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cover_image" className="text-foreground">封面圖片 URL</Label>
                  <Input
                    id="cover_image"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleInputChange}
                    required
                    className="mt-1 bg-background border-border"
                  />
                  {formData.cover_image && (
                    <div className="mt-2 rounded-md overflow-hidden h-36">
                      <img 
                        src={formData.cover_image} 
                        alt="封面預覽" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=預覽不可用"}
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time" className="text-foreground">開始時間</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      required
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_time" className="text-foreground">結束時間</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      required
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-foreground">分類</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags" className="text-foreground">標籤（以逗號分隔）</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="科技, 創新, AI"
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                </div>
                
                <LocationSelector 
                  location={formData.location} 
                  onChange={(newLocation) => {
                    setFormData(prev => ({
                      ...prev,
                      location: newLocation
                    }));
                  }}
                />
                
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">贊助方案</h3>
                  
                  {sponsorshipPlans.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a4 4 0 00-4-4H8a4 4 0 00-4 4v12h8zm0 0V5.5A2.5 2.5 0 0114.5 3h1A2.5 2.5 0 0118 5.5V8m-6 0h6m0 0v12a2 2 0 01-2 2h-4a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-muted-foreground mb-4">您還沒有添加任何贊助方案</p>
                      <Button onClick={addSponsorshipPlan} type="button">
                        添加贊助方案
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {sponsorshipPlans.map((plan, index) => (
                        <div key={plan.id} className="p-5 border border-border rounded-md relative">
                          <button
                            type="button"
                            onClick={() => removeSponsorshipPlan(index)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                            aria-label="刪除贊助方案"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          <h4 className="text-md font-semibold mb-4">贊助方案 {index + 1}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`plan-title-${index}`}>方案名稱</Label>
                              <Input
                                id={`plan-title-${index}`}
                                value={plan.title}
                                onChange={(e) => updateSponsorshipPlan(index, 'title', e.target.value)}
                                placeholder="鑽石贊助商"
                                required
                                className="mt-1 bg-background border-border"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`plan-price-${index}`}>價格 (TWD)</Label>
                              <Input
                                id={`plan-price-${index}`}
                                type="number"
                                min="0"
                                value={plan.price}
                                onChange={(e) => updateSponsorshipPlan(index, 'price', e.target.value)}
                                placeholder="50000"
                                required
                                className="mt-1 bg-background border-border"
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <Label htmlFor={`plan-description-${index}`}>方案描述</Label>
                            <Textarea
                              id={`plan-description-${index}`}
                              value={plan.description}
                              onChange={(e) => updateSponsorshipPlan(index, 'description', e.target.value)}
                              placeholder="提供最高級別的品牌曝光和獨家權益..."
                              rows={2}
                              required
                              className="mt-1 bg-background border-border"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <Label htmlFor={`plan-max-sponsors-${index}`}>最大贊助商數量</Label>
                            <Input
                              id={`plan-max-sponsors-${index}`}
                              type="number"
                              min="1"
                              value={plan.max_sponsors}
                              onChange={(e) => updateSponsorshipPlan(index, 'max_sponsors', e.target.value)}
                              required
                              className="mt-1 bg-background border-border"
                            />
                          </div>
                          
                          <div>
                            <Label>權益與福利</Label>
                            <div className="mt-2 space-y-2">
                              {plan.benefits.map((benefit, benefitIndex) => (
                                <div key={benefitIndex} className="flex items-center gap-2">
                                  <div className="bg-primary/10 text-primary rounded-md px-3 py-1 flex-grow flex items-center">
                                    <span>{benefit}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeBenefit(index, benefitIndex)}
                                      className="ml-auto text-muted-foreground hover:text-destructive"
                                      aria-label="移除權益"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="如：主舞台演講機會、VIP晚宴席位等"
                                  value={newBenefit}
                                  onChange={(e) => setNewBenefit(e.target.value)}
                                  className="flex-grow bg-background border-border"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => addBenefit(index)}
                                  className="shrink-0"
                                >
                                  添加
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addSponsorshipPlan}
                        className="w-full border-dashed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        添加另一個贊助方案
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/organizer/events")}
                  className="border-border hover:bg-accent"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="relative"
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">創建活動</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    </>
                  ) : "創建活動"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 