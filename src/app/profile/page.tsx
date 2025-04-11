"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/services/authService';
import { User, OrganizerProfile, SponsorProfile } from '@/lib/types/users';
import { Calendar, Briefcase, DollarSign, Users, PieChart, Settings, Edit, ExternalLink, Plus, Bookmark, Bell } from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  status: string;
  date: string;
}

interface SponsorshipItem {
  id: string;
  eventName: string;
  status: string;
  amount: string;
}

async function fetchUserProfile(userId: string) {
  console.log('嘗試獲取用戶資料，用戶ID:', userId, '長度:', userId.length);
  
  // 防止空ID導致錯誤 (如果用戶ID為空)
  if (!userId || userId === 'undefined') {
    console.error('用戶ID無效，無法獲取資料');
    throw new Error('用戶ID無效');
  }
  
  try {
    const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      cache: 'no-cache' // 防止緩存問題
    });
    
    console.log('API響應狀態:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('用戶資料獲取失敗，狀態碼:', response.status, '錯誤:', errorText);
      let errorMessage = '獲取用戶資料失敗';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // 解析JSON失敗，使用原始錯誤文本
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('成功獲取用戶資料:', data);
    return data;
  } catch (error) {
    console.error('獲取用戶資料時發生錯誤:', error);
    throw error;
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<OrganizerProfile | SponsorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 直接從本地存儲獲取用戶數據的函數
  const getUserFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        console.log('[profile] 開始從localStorage獲取用戶數據');
        const userJson = localStorage.getItem('user');
        console.log('[profile] localStorage中的原始用戶數據:', userJson);
        
        if (!userJson) {
          console.log('[profile] localStorage中沒有用戶數據');
          return null;
        }
        
        const user = JSON.parse(userJson);
        console.log('[profile] 解析後的用戶數據:', user);
        
        // 檢查用戶ID
        if (!user.id) {
          console.error('[profile] 解析後的用戶數據沒有ID');
          return null;
        }
        
        // 確保ID格式正確
        if (typeof user.id === 'number') {
          console.log(`[profile] 發現數字ID (${user.id})，轉換為字符串格式`);
          user.id = `user_${user.id}`;
          
          // 更新localStorage
          localStorage.setItem('user', JSON.stringify(user));
          console.log('[profile] 已更新localStorage中的用戶數據，新ID:', user.id);
        } else {
          // 確保是字符串
          user.id = String(user.id);
        }
        
        console.log('[profile] 最終使用的用戶數據:', user);
        return user;
      } catch (e) {
        console.error('[profile] 從localStorage獲取用戶數據失敗:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log("開始獲取用戶數據...");
        
        // 直接從localStorage獲取用戶資料
        const localUser = getUserFromLocalStorage();
        console.log("從localStorage直接獲取的用戶:", localUser);
        
        if (!localUser) {
          console.error("用戶未找到");
          router.push('/login');
          return;
        }
        
        // ID格式檢查和修正 - 這是關鍵！
        if (!localUser.id) {
          console.error("用戶ID無效或未找到");
          router.push('/login');
          return;
        }
        
        // 確保ID是字符串且格式正確
        if (typeof localUser.id === 'number') {
          console.log(`修正數字ID: ${localUser.id} → "user_${localUser.id}"`);
          localUser.id = `user_${localUser.id}`;
          
          // 更新存儲
          localStorage.setItem('user', JSON.stringify(localUser));
          console.log("已更新存儲的用戶ID格式");
        } else {
          // 確保ID是字符串
          localUser.id = String(localUser.id);
        }
        
        console.log(`實際使用的用戶ID: "${localUser.id}", 類型: ${typeof localUser.id}`);
        
        if (isMounted) {
          setUser(localUser);
          
          // 嘗試獲取用戶資料
          try {
            const userId = localUser.id;
            console.log(`開始獲取用戶資料，ID: "${userId}"`);
            
            const profile = await fetchUserProfile(userId);
            
            if (isMounted) {
              console.log("成功獲取到用戶資料:", profile);
              setProfileData(profile);
              setError(null); // 清除錯誤
            }
          } catch (profileError) {
            console.error('獲取用戶資料失敗:', profileError);
            // 將錯誤信息存儲起來，但仍然繼續顯示頁面
            if (isMounted) {
              setError((profileError as Error).message || '獲取用戶資料失敗');
            }
          }
        }
      } catch (error) {
        console.error('認證檢查錯誤:', error);
        if (isMounted) {
          router.push('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    // 清理函數，防止組件卸載後設置狀態
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果沒有用戶數據，重定向到登入頁面
  if (!user) return null;

  // 如果有錯誤但沒有資料，顯示錯誤信息
  if (error && !profileData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="max-w-md w-full p-6 bg-card rounded-lg border shadow-sm">
          <div className="text-center space-y-4">
            <div className="inline-flex h-14 w-14 rounded-full bg-destructive/10 items-center justify-center">
              <svg className="h-6 w-6 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">載入個人資料時出現問題</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                重試
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 確保profileData存在
  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-background">
      {error && (
        <div className="bg-destructive/10 p-4 border-l-4 border-destructive">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-destructive hover:bg-destructive/10 focus:outline-none"
                >
                  <span className="sr-only">關閉</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 顶部个人信息卡片 */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-lg">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="个人头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-4xl font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md"
                title="编辑头像"
                aria-label="编辑个人头像"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center md:text-left md:flex-1">
              <h1 className="text-2xl font-bold text-foreground">{user.email}</h1>
              <div className="flex items-center justify-center md:justify-start mt-1 gap-1.5">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  用戶
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  注册于 {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="hidden md:flex space-x-3">
              <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
                <Settings className="h-4 w-4" />
                账户设置
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow-sm hover:bg-secondary/90 transition flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                查看公开资料
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
          {/* 选项卡导航 */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'profile' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                个人资料
              </button>
              <button 
                onClick={() => router.push('/profile/saved')}
                className="px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground hover:text-foreground flex items-center"
              >
                <Bookmark className="h-4 w-4 mr-1.5" />
                我的收藏
              </button>
              <button 
                onClick={() => router.push('/profile/follows')}
                className="px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground hover:text-foreground flex items-center"
              >
                <Bell className="h-4 w-4 mr-1.5" />
                我的關注
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'events' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                我的活动
              </button>
              <button 
                onClick={() => setActiveTab('sponsorships')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'sponsorships' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                我的赞助
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'analytics' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                数据分析
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'security' 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                安全设置
              </button>
            </div>
          </div>

          {/* 选项卡内容 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">基本信息</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">电子邮箱</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full p-2.5 bg-muted/50 rounded-md border border-border text-foreground"
                        aria-label="用户电子邮箱"
                        title="用户电子邮箱"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">首选语言</label>
                      <select
                        className="w-full p-2.5 bg-background rounded-md border border-border text-foreground"
                        defaultValue={user.preferred_language}
                        aria-label="选择首选语言"
                        title="选择首选语言"
                      >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">个人简介</label>
                      <textarea
                        rows={4}
                        className="w-full p-2.5 bg-background rounded-md border border-border text-foreground resize-none"
                        defaultValue={profileData.bio}
                        placeholder="介绍一下您自己..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                  <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition">
                    保存更改
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">我的活动</h2>
                  <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    创建活动
                  </button>
                </div>

                {'events' in profileData && profileData.events && profileData.events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.events.map((event: EventItem) => (
                      <div key={event.id} className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition">
                        <div className="border-b p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{event.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              event.status === 'upcoming' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {event.status === 'upcoming' ? '即将到来' : '已结束'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {event.date}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 flex justify-end gap-2">
                          <button className="text-xs px-2 py-1 bg-background border rounded hover:bg-muted/30 transition">查看详情</button>
                          <button className="text-xs px-2 py-1 bg-background border rounded hover:bg-muted/30 transition">编辑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border rounded-lg border-dashed bg-muted/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">还没有创建活动</h3>
                    <p className="text-muted-foreground mb-6">开始创建您的第一个活动吧</p>
                    <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      创建活动
                    </button>
                  </div>
                )}

                {'statistics' in profileData && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">活动数据</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-primary/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">总活动数</p>
                            <p className="text-2xl font-bold mt-2">{profileData.statistics?.totalEvents || 0}</p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">即将到来</p>
                            <p className="text-2xl font-bold mt-2">{profileData.statistics?.upcomingEvents || 0}</p>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded-full">
                            <Calendar className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">平均参与人数</p>
                            <p className="text-2xl font-bold mt-2">{profileData.statistics?.averageAttendees || 0}</p>
                          </div>
                          <div className="p-2 bg-blue-500/10 rounded-full">
                            <Users className="h-5 w-5 text-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">总收入</p>
                            <p className="text-2xl font-bold mt-2">{profileData.statistics?.totalRevenue || '$0'}</p>
                          </div>
                          <div className="p-2 bg-amber-500/10 rounded-full">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sponsorships' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">我的赞助</h2>
                  <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    新增赞助
                  </button>
                </div>

                {'sponsorships' in profileData && profileData.sponsorships && profileData.sponsorships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.sponsorships.map((sponsorship: SponsorshipItem) => (
                      <div key={sponsorship.id} className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition">
                        <div className="border-b p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{sponsorship.eventName}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              sponsorship.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {sponsorship.status === 'confirmed' ? '已确认' : '处理中'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5" />
                              赞助金额: {sponsorship.amount}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 flex justify-end gap-2">
                          <button className="text-xs px-2 py-1 bg-background border rounded hover:bg-muted/30 transition">查看详情</button>
                          <button className="text-xs px-2 py-1 bg-background border rounded hover:bg-muted/30 transition">联系主办方</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border rounded-lg border-dashed bg-muted/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">还没有赞助</h3>
                    <p className="text-muted-foreground mb-6">开始您的第一次赞助投资吧</p>
                    <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 transition flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      浏览活动
                    </button>
                  </div>
                )}

                {'analytics' in profileData && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">赞助数据</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-primary/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">总赞助数</p>
                            <p className="text-2xl font-bold mt-2">{profileData.analytics?.totalSponsored || 0}</p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">活跃赞助</p>
                            <p className="text-2xl font-bold mt-2">{profileData.analytics?.activeSponsorship || 0}</p>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded-full">
                            <Calendar className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">总投资</p>
                            <p className="text-2xl font-bold mt-2">{profileData.analytics?.totalInvestment || '$0'}</p>
                          </div>
                          <div className="p-2 bg-amber-500/10 rounded-full">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/5 to-background border rounded-lg p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">平均ROI</p>
                            <p className="text-2xl font-bold mt-2">{profileData.analytics?.averageRoi || '0%'}</p>
                          </div>
                          <div className="p-2 bg-blue-500/10 rounded-full">
                            <PieChart className="h-5 w-5 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">数据分析</h2>
                
                <div className="border rounded-lg p-8 bg-muted/20 text-center">
                  <h3 className="text-lg font-medium mb-2">功能即将上线</h3>
                  <p className="text-muted-foreground">我们正在努力为您开发更加强大的数据分析功能</p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">安全设置</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">账户密码</h3>
                        <p className="text-sm text-muted-foreground">上次更新: 2023-11-30</p>
                      </div>
                      <button className="px-3 py-1.5 border rounded-md hover:bg-muted/50 transition text-sm">
                        更改密码
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">两步验证</h3>
                        <p className="text-sm text-muted-foreground">增强您的账户安全</p>
                      </div>
                      <button className="px-3 py-1.5 border rounded-md hover:bg-muted/50 transition text-sm">
                        启用
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">登录设备</h3>
                        <p className="text-sm text-muted-foreground">管理已登录的设备</p>
                      </div>
                      <button className="px-3 py-1.5 border rounded-md hover:bg-muted/50 transition text-sm">
                        查看设备
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">隐私设置</h3>
                        <p className="text-sm text-muted-foreground">管理您的个人信息共享设置</p>
                      </div>
                      <button className="px-3 py-1.5 border rounded-md hover:bg-muted/50 transition text-sm">
                        修改设置
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}