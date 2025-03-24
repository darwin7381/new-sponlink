"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from 'lucide-react';

function ComponentSection({ title, description, children }: { 
  title: string; 
  description: string; 
  children: React.ReactNode 
}) {
  return (
    <section className="mb-12 border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

function ButtonsShowcase() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="default">默認按鈕</Button>
        <Button variant="destructive">危險按鈕</Button>
        <Button variant="outline">輪廓按鈕</Button>
        <Button variant="secondary">次要按鈕</Button>
        <Button variant="ghost">幽靈按鈕</Button>
        <Button variant="link">鏈接按鈕</Button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Button size="sm">小尺寸</Button>
        <Button>默認尺寸</Button>
        <Button size="lg">大尺寸</Button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Button disabled>禁用按鈕</Button>
        <Button>加載中</Button>
        <Button variant="outline" className="gap-2">
          <Settings size={16} />
          帶圖標
        </Button>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">漸變按鈕</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-brand-600 to-info-600 hover:from-brand-700 hover:to-info-700 transition-all duration-300 shadow-md hover:shadow-lg border border-brand-700/30">
            品牌漸變
          </button>
          <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-secondary-600 to-accent-600 hover:from-secondary-700 hover:to-accent-700 transition-all duration-300 shadow-md hover:shadow-lg border border-secondary-700/30">
            活力漸變
          </button>
          <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-success-600 to-info-600 hover:from-success-700 hover:to-info-700 transition-all duration-300 shadow-md hover:shadow-lg border border-success-700/30">
            成功漸變
          </button>
          <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-tr from-error-700 via-error-600 to-warning-600 hover:from-error-800 hover:via-error-700 hover:to-warning-700 transition-all duration-300 shadow-md hover:shadow-lg border border-error-700/30">
            火焰漸變
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">透明度與陰影</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 rounded-md font-medium text-white bg-brand-600 hover:bg-brand-700 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-brand-700/30">
            半透明效果
          </button>
          <button className="px-4 py-2 rounded-md font-medium border border-secondary-400 text-secondary-900 bg-white hover:bg-secondary-50 backdrop-blur-sm transition-all duration-300 shadow-[0_4px_14px_0_rgba(231,76,76,0.2)] hover:shadow-[0_6px_20px_0_rgba(231,76,76,0.35)]">
            帶彩色陰影
          </button>
          <button className="px-4 py-2 rounded-md font-medium text-white bg-neutral-800 hover:bg-neutral-900 backdrop-blur-sm transition-all duration-300 shadow-[0_5px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_0_rgba(0,0,0,0.4)] border border-neutral-700/30">
            玻璃擬態
          </button>
          <button className="px-4 py-2 rounded-md font-medium text-white bg-accent-700 hover:bg-accent-800 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(245,166,35,0.4)] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_6px_15px_rgba(245,166,35,0.6)] border border-accent-800/30">
            內陰影效果
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">互動效果</h3>
        <div className="flex flex-wrap gap-4">
          <button className="group relative px-6 py-2.5 rounded-md font-medium text-white bg-brand-600 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg border border-brand-700/30">
            <span className="relative z-10">懸停動畫</span>
            <span className="absolute inset-0 bg-brand-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </button>
          <button className="relative px-6 py-2.5 rounded-md font-medium text-white bg-secondary-700 overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px] border border-secondary-800/30">
            <span className="relative z-10">彈跳效果</span>
            <span className="absolute inset-0 bg-gradient-to-tr from-secondary-600 to-secondary-800 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          <button className="group relative px-6 py-2.5 rounded-md font-medium overflow-hidden border border-brand-600 text-brand-800 bg-white transition-all duration-300 shadow-md hover:shadow-lg hover:text-white">
            <span className="relative z-10">填充動畫</span>
            <span className="absolute inset-0 bg-brand-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgesShowcase() {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge>默認</Badge>
      <Badge variant="secondary">次要</Badge>
      <Badge variant="outline">輪廓</Badge>
      <Badge variant="destructive">危險</Badge>
    </div>
  );
}

function CardsShowcase() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>會議詳情</CardTitle>
          <CardDescription>查看您即將到來的會議</CardDescription>
        </CardHeader>
        <CardContent>
          <p>您有 3 場會議安排在今天。</p>
        </CardContent>
        <CardFooter>
          <Button>查看全部</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>活動統計</CardTitle>
          <CardDescription>您的活動參與數據</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>已參加</span>
              <span>12</span>
            </div>
            <div className="flex justify-between">
              <span>已取消</span>
              <span>2</span>
            </div>
            <div className="flex justify-between">
              <span>即將到來</span>
              <span>5</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">導出數據</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TabsShowcase() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-3xl">
      <TabsList>
        <TabsTrigger value="account">賬戶</TabsTrigger>
        <TabsTrigger value="password">密碼</TabsTrigger>
        <TabsTrigger value="notifications">通知</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="p-4 border rounded-lg mt-2">
        <h3 className="text-lg font-medium mb-2">賬戶設置</h3>
        <p className="text-muted-foreground">管理您的賬戶信息和偏好設置。</p>
      </TabsContent>
      <TabsContent value="password" className="p-4 border rounded-lg mt-2">
        <h3 className="text-lg font-medium mb-2">更改密碼</h3>
        <p className="text-muted-foreground">更新您的密碼以保護賬戶安全。</p>
      </TabsContent>
      <TabsContent value="notifications" className="p-4 border rounded-lg mt-2">
        <h3 className="text-lg font-medium mb-2">通知偏好</h3>
        <p className="text-muted-foreground">控制您收到的通知類型和頻率。</p>
      </TabsContent>
    </Tabs>
  );
}

function FormControlsShowcase() {
  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">電子郵件</Label>
        <Input id="email" placeholder="輸入您的電子郵件" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">密碼</Label>
        <Input id="password" type="password" placeholder="輸入您的密碼" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">角色</Label>
        <Select>
          <SelectTrigger id="role">
            <SelectValue placeholder="選擇角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">管理員</SelectItem>
            <SelectItem value="user">用戶</SelectItem>
            <SelectItem value="guest">訪客</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">個人簡介</Label>
        <Textarea id="bio" placeholder="關於您自己的簡短描述" />
      </div>
      
      <Button className="w-full">提交</Button>
    </div>
  );
}

function DialogsShowcase() {
  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">顯示確認對話框</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>您確定要刪除嗎？</DialogTitle>
            <DialogDescription>
              此操作無法撤銷。這將永久刪除您的賬戶以及與其相關的所有數據。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">取消</Button>
            <Button>繼續</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertsShowcase() {
  return (
    <div className="space-y-6">
      {/* 基本警告 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-error-200 bg-error-50/70 dark:bg-error-950/30 dark:border-error-900/50 shadow-sm overflow-hidden backdrop-blur-[2px]">
          <div className="px-4 py-3 bg-error-100/80 dark:bg-error-900/40 border-b border-error-200 dark:border-error-900/60">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-error-600 dark:text-error-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="font-medium text-error-800 dark:text-error-200">錯誤警告</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-error-700 dark:text-error-300">
              操作無法完成，請檢查您的輸入並重試。如果問題持續存在，請聯繫支持團隊。
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="text-error-700 hover:bg-error-100 dark:text-error-300 dark:hover:bg-error-900/40 font-medium border border-error-200 dark:border-error-800/50">
                忽略
              </Button>
              <Button size="sm" className="bg-error-600 hover:bg-error-700 text-white border border-error-700/50 dark:bg-error-700 dark:hover:bg-error-600 shadow-sm font-medium">
                重試
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-success-200 bg-success-50/70 dark:bg-success-950/30 dark:border-success-900/50 shadow-sm overflow-hidden backdrop-blur-[2px]">
          <div className="px-4 py-3 bg-success-100/80 dark:bg-success-900/40 border-b border-success-200 dark:border-success-900/60">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success-600 dark:text-success-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 className="font-medium text-success-800 dark:text-success-200">成功通知</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-success-700 dark:text-success-300">
              操作已成功完成，您的變更已保存。系統將在5秒後自動重定向。
            </p>
            <div className="mt-3 flex justify-end">
              <Button size="sm" className="bg-success-600 hover:bg-success-700 text-white border border-success-700/50 dark:bg-success-700 dark:hover:bg-success-600 shadow-sm font-medium">
                確認
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 輕量級警告 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg shadow-[0_2px_10px_0_rgba(245,166,35,0.15)] bg-gradient-to-r from-warning-50 to-warning-100/70 dark:from-warning-950/40 dark:to-warning-900/30 border-l-4 border-warning-500 dark:border-warning-600">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              <h4 className="font-medium text-warning-800 dark:text-warning-300">警告提示</h4>
              <p className="mt-1 text-sm text-warning-700 dark:text-warning-400">
                您的存儲空間即將用完，請考慮升級您的計劃或刪除一些文件。
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg shadow-[0_2px_10px_0_rgba(0,102,255,0.15)] bg-gradient-to-r from-info-50 to-info-100/70 dark:from-info-950/40 dark:to-info-900/30 border-l-4 border-info-500 dark:border-info-600">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <h4 className="font-medium text-info-800 dark:text-info-300">信息提示</h4>
              <p className="mt-1 text-sm text-info-700 dark:text-info-400">
                系統將於週日凌晨2:00進行維護，預計持續2小時。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 浮動通知 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 shadow-lg backdrop-blur-sm">
          <div className="absolute right-2 top-2">
            <button className="p-1 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium">新消息通知</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                您有3條未讀消息，點擊查看詳情。
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" className="border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600">稍後查看</Button>
                <Button size="sm" className="border border-brand-600/50">立即查看</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-800 text-white shadow-lg overflow-hidden group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PC9yZWN0PjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSI+PC9yZWN0Pjwvc3ZnPg==')]"></div>
          <div className="absolute right-0 top-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors duration-500"></div>
          <div className="absolute left-0 bottom-0 w-24 h-24 transform -translate-x-6 translate-y-6 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors duration-500"></div>
          
          <div className="relative p-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <h4 className="font-medium">高級通知設計</h4>
              </div>
              <div className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-white/80">
              使用複雜的背景圖案、漸變和微妙的動畫效果，創建具有高級質感的通知。
            </p>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-brand-600 bg-neutral-300"></div>
                <div className="w-7 h-7 rounded-full border-2 border-brand-600 bg-neutral-400"></div>
                <div className="w-7 h-7 rounded-full border-2 border-brand-600 bg-neutral-500"></div>
              </div>
              <Button size="sm" className="bg-white/40 hover:bg-white/60 text-white border-0 font-medium shadow-sm">
                探索更多
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageGuidelines() {
  return (
    <div className="space-y-6 p-6 bg-muted rounded-lg">
      <h3 className="text-xl font-semibold">組件使用指南</h3>
      
      <div className="space-y-2">
        <h4 className="font-medium">一致性</h4>
        <p>在整個應用程序中保持組件樣式和行為的一致性。避免不必要的自定義。</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">無障礙性</h4>
        <p>所有組件都應遵循 WCAG 指南，確保適當的顏色對比度、鍵盤導航和屏幕閱讀器支持。</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">響應式設計</h4>
        <p>組件應在所有屏幕尺寸上正常運行。使用響應式工具類進行適配。</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">性能考慮</h4>
        <p>複雜組件（如表格、圖表）應考慮延遲加載或虛擬化，以提高初始加載性能。</p>
      </div>
    </div>
  );
}

function EnhancedCardsShowcase() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="group rounded-lg overflow-hidden transition-all duration-300 bg-white border border-neutral-300 hover:shadow-lg dark:bg-neutral-900/70 dark:border-neutral-700 backdrop-blur-sm">
        <div className="relative h-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/90 to-brand-800/95 flex items-center justify-center text-white">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-2">漸變背景卡片</h3>
              <p className="text-sm text-white/90">背景使用漸變色提升視覺層次</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">漸變背景配合半透明效果，增加設計質感。</p>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="transition-transform group-hover:translate-y-[-2px] border-neutral-300 dark:border-neutral-700">
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden transition-all duration-300 border border-neutral-300 hover:shadow-xl bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm dark:border-neutral-700">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary-500/10 to-accent-500/5 pointer-events-none"></div>
        <div className="relative p-5">
          <h3 className="text-xl font-semibold mb-4">玻璃擬態卡片</h3>
          <p className="text-sm text-muted-foreground mb-4">
            使用模糊背景和微妙陰影創建現代玻璃效果，適合疊加在其他內容上。
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/80 dark:bg-neutral-800/70 p-3 rounded border border-neutral-300/90 dark:border-neutral-700/60">
              <p className="text-xs font-medium">半透明面板</p>
            </div>
            <div className="bg-white/80 dark:bg-neutral-800/70 p-3 rounded border border-neutral-300/90 dark:border-neutral-700/60">
              <p className="text-xs font-medium">模糊背景</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="transition-all duration-300 hover:shadow-md border-neutral-300 dark:border-neutral-700">
              探索效果
            </Button>
          </div>
        </div>
      </div>

      <div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-300/90 dark:border-neutral-700/80">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">重點內容卡片</h3>
              <p className="text-sm text-muted-foreground mt-1">使用分層設計突出重要信息</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
              重要
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-3 rounded-lg bg-white/90 dark:bg-neutral-800/70 shadow-sm dark:shadow-neutral-900/30 border border-neutral-200 dark:border-neutral-700/60">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-500/30 flex items-center justify-center text-accent-700 dark:text-accent-400 border border-accent-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">分層信息展示</p>
                  <p className="text-xs text-muted-foreground">使用不同層次的陰影和背景</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/90 dark:bg-neutral-800/70 shadow-sm dark:shadow-neutral-900/30 border border-neutral-200 dark:border-neutral-700/60">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500/30 flex items-center justify-center text-secondary-700 dark:text-secondary-400 border border-secondary-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15v3m-6-3v3m-6-3v3"></path>
                    <path d="M3 9h18v9a3 3 0 01-3 3H6a3 3 0 01-3-3V9z"></path>
                    <path d="M3 9V6a3 3 0 013-3h12a3 3 0 013 3v3"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">微互動效果</p>
                  <p className="text-xs text-muted-foreground">懸停時各元素有不同反應</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 bg-white/95 dark:bg-neutral-800/90 border-t border-neutral-300/80 dark:border-neutral-700/70 group-hover:bg-brand-50/95 dark:group-hover:bg-brand-900/30 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">深入了解卡片設計</p>
            <Button variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 border border-transparent hover:border-brand-200 dark:hover:border-brand-800/60">
              查看詳情
            </Button>
          </div>
        </div>
      </div>

      <div className="relative rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden group transition-all duration-300 hover:shadow-xl bg-white dark:bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-b from-info-500/5 to-info-500/20 dark:from-info-800/30 dark:to-info-900/50 opacity-30 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="p-6 relative">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">互動卡片示例</h3>
            <span className="inline-block p-1.5 rounded-full bg-info-100 text-info-700 dark:bg-info-900/70 dark:text-info-400 border border-info-200 dark:border-info-800/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </span>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="relative h-24 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-info-600/90 to-info-700/90 text-white">
                <p className="font-medium">懸停時顯示</p>
              </div>
              <div className="p-4 group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-sm font-medium">背景轉換效果</p>
                <p className="text-xs text-muted-foreground mt-1">懸停整個卡片時觸發</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              這種卡片在用戶互動時會顯示漸變背景，創造層次感，增強用戶體驗。
            </p>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full transition-all duration-300 group-hover:bg-info-600 group-hover:text-white group-hover:border-info-600 dark:group-hover:bg-info-600 dark:group-hover:border-info-600 font-medium border-neutral-300 dark:border-neutral-700">
                查看演示
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState<string>("showcase");
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">組件庫</h1>
        <p className="text-lg text-muted-foreground mt-2">
          SponLink 界面組件的集合，用於構建一致且美觀的用戶界面。
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="showcase">組件展示</TabsTrigger>
          <TabsTrigger value="usage">使用指南</TabsTrigger>
        </TabsList>
        
        <TabsContent value="showcase" className="mt-6">
          <div className="space-y-10">
            <ComponentSection 
              title="按鈕" 
              description="按鈕用於觸發操作或事件，如提交表單、打開對話框、取消操作或執行刪除操作。"
            >
              <ButtonsShowcase />
            </ComponentSection>
            
            <section className="mb-12 border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">漸變按鈕</h2>
              <p className="text-muted-foreground mb-6">使用漸變顏色創建引人注目的按鈕，可以增強用戶體驗和視覺吸引力。</p>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border border-purple-700/30">
                    紫藍漸變按鈕
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 border border-red-600/30">
                    紅黃漸變按鈕
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border border-green-600/30">
                    綠松漸變按鈕
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 border border-pink-600/30">
                    粉橙漸變按鈕
                  </button>
                </div>
              </div>
            </section>
            
            <section className="mb-12 border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">透明度與陰影</h2>
              <p className="text-muted-foreground mb-6">使用透明度和陰影效果創建具有深度感的按鈕，使界面更具立體感。</p>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-blue-600/85 hover:bg-blue-700/90 shadow-md hover:shadow-lg border border-blue-700/40">
                    半透明藍按鈕
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium text-slate-800 bg-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.3)] border border-slate-300">
                    白色陰影按鈕
                  </button>
                  <button className="px-4 py-2 rounded-md font-medium text-white bg-black/85 hover:bg-black/95 shadow-lg hover:shadow-xl border border-neutral-700/40">
                    黑色透明按鈕
                  </button>
                  <button className="px-4 py-2 rounded-full font-medium text-slate-800 bg-yellow-300 shadow-[0_4px_14px_0_rgba(234,179,8,0.4)] hover:shadow-[0_6px_20px_0_rgba(234,179,8,0.6)] border border-yellow-400">
                    圓形黃按鈕
                  </button>
                </div>
              </div>
            </section>
            
            <section className="mb-12 border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">互動效果</h2>
              <p className="text-muted-foreground mb-6">透過動畫和變換效果，提供豐富的互動反饋，提升用戶體驗。</p>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <button className="group relative px-4 py-2 rounded-md font-medium overflow-hidden border border-cyan-600 text-cyan-700 bg-white transition-all duration-300 shadow-md hover:shadow-lg">
                    <span className="relative z-10 text-cyan-700 group-hover:text-white transition-colors duration-300">左滑填充按鈕</span>
                    <span className="absolute inset-0 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </button>
                  <button className="relative px-4 py-2 rounded-md font-medium text-white bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-3px] border border-indigo-700/40">
                    <span>懸浮上升按鈕</span>
                  </button>
                  <button className="group relative px-4 py-2 rounded-md font-medium overflow-hidden border border-rose-600 text-rose-700 bg-white transition-all duration-300 shadow-md hover:shadow-lg">
                    <span className="relative z-10 text-rose-700 group-hover:text-white transition-colors duration-300">底部填充按鈕</span>
                    <span className="absolute inset-0 bg-rose-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></span>
                  </button>
                </div>
              </div>
            </section>
            
            <ComponentSection 
              title="徽章" 
              description="徽章用於突出顯示項目的狀態，以便用戶快速識別。"
            >
              <BadgesShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="卡片" 
              description="卡片是包含內容和操作的可點擊元素，它們用於顯示有關單個主題的信息。"
            >
              <CardsShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="增強型卡片" 
              description="使用漸變色、透明度、陰影和微互動等現代設計元素，創建更具視覺吸引力的卡片。"
            >
              <EnhancedCardsShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="選項卡" 
              description="選項卡用於在同一頁面內的不同內容部分之間切換。"
            >
              <TabsShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="表單控件" 
              description="表單控件用於收集用戶輸入，如文本、選擇、檔案等。"
            >
              <FormControlsShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="對話框" 
              description="對話框用於向用戶請求確認或提供額外信息，而不離開當前頁面。"
            >
              <DialogsShowcase />
            </ComponentSection>
            
            <ComponentSection 
              title="警告與通知" 
              description="警告和通知用於向用戶顯示重要信息、提醒或操作反饋，並使用透明度、陰影和漸變增強視覺效果。"
            >
              <AlertsShowcase />
            </ComponentSection>
          </div>
        </TabsContent>
        
        <TabsContent value="usage" className="mt-6">
          <UsageGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  );
} 