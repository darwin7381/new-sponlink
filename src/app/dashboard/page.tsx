"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  isAuthenticated, 
  getActiveView, 
  setActiveView, 
  VIEW_TYPE 
} from '@/lib/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewSwitcher } from '@/components/view/ViewSwitcher';
import { BarChart3Icon, CalendarIcon, Users2Icon, WalletIcon } from 'lucide-react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveViewState] = useState<VIEW_TYPE | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 檢查是否已登入
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        // 獲取用戶資料
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUserData(currentUser);
        
        // 檢查當前視角
        let view = getActiveView();
        
        // 如果沒有活躍視角，預設設置一個
        if (!view) {
          // 根據用戶資料決定預設視角
          // 這只是模擬實現，真實系統可能基於用戶行為或資料
          view = VIEW_TYPE.EVENT_ORGANIZER; 
          setActiveView(view);
        }
        
        setActiveViewState(view);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };

    checkAuth();
    
    // 監聽視角變更
    const handleViewChange = () => {
      setActiveViewState(getActiveView());
    };
    
    window.addEventListener('viewChange', handleViewChange);
    
    return () => {
      window.removeEventListener('viewChange', handleViewChange);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 根據當前視角渲染相應內容
  const renderDashboardContent = () => {
    if (activeView === VIEW_TYPE.EVENT_ORGANIZER) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活動總數</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">已創建的活動數量</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">即將到來的會議</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">未來七天內的會議</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">贊助總額</CardTitle>
                <WalletIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,300</div>
                <p className="text-xs text-muted-foreground">所有活動贊助總額</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">贊助商數量</CardTitle>
                <Users2Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">參與贊助的贊助商</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList>
              <TabsTrigger value="events">我的活動</TabsTrigger>
              <TabsTrigger value="meetings">我的會議</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>活動列表</CardTitle>
                  <CardDescription>管理您創建的所有活動</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">這裡將顯示您創建的活動列表</p>
                    <Button onClick={() => router.push('/events/create')}>
                      創建新活動
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>會議列表</CardTitle>
                  <CardDescription>管理您與贊助商的會議</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">您目前沒有排定的會議</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    } else if (activeView === VIEW_TYPE.SPONSORSHIP_MANAGER) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">贊助總數</CardTitle>
                <BarChart3Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">已贊助的活動數量</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">贊助總額</CardTitle>
                <WalletIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,500</div>
                <p className="text-xs text-muted-foreground">已投資的總金額</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">即將到來的會議</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">已確認的會議</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="sponsorships" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sponsorships">我的贊助</TabsTrigger>
              <TabsTrigger value="meetings">我的會議</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sponsorships" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>贊助列表</CardTitle>
                  <CardDescription>所有已確認的贊助</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">這裡將顯示您的贊助記錄</p>
                    <Button onClick={() => router.push('/events')}>
                      瀏覽活動
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>會議列表</CardTitle>
                  <CardDescription>所有已安排的會議</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">您目前沒有排定的會議</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    // 沒有選擇視角時顯示選擇器
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">選擇您的視角</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          請選擇您想要使用的視角以自定義您的體驗。您可以隨時切換視角。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card className="cursor-pointer hover:border-primary transition-colors" 
                onClick={() => setActiveView(VIEW_TYPE.EVENT_ORGANIZER)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                活動組織
              </CardTitle>
              <CardDescription>管理您的活動和贊助商關係</CardDescription>
            </CardHeader>
            <CardContent>
              <p>此視角讓您可以創建和管理活動、設置贊助方案、與贊助商會面。</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setActiveView(VIEW_TYPE.SPONSORSHIP_MANAGER)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WalletIcon className="mr-2 h-5 w-5" />
                贊助管理
              </CardTitle>
              <CardDescription>管理您的贊助投資和會議</CardDescription>
            </CardHeader>
            <CardContent>
              <p>此視角讓您可以瀏覽活動、購買贊助方案、安排與活動組織者的會議。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">儀表盤</h1>
        <ViewSwitcher />
      </div>
      
      {renderDashboardContent()}
    </div>
  );
} 