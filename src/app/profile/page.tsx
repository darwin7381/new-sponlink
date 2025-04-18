"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
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
  console.log('Attempting to fetch user profile, user ID:', userId, 'length:', userId.length);
  
  // Prevent empty ID errors
  if (!userId || userId === 'undefined') {
    console.error('Invalid user ID, cannot fetch profile');
    throw new Error('Invalid user ID');
  }
  
  try {
    const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      cache: 'no-cache' // Prevent caching issues
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user profile, status:', response.status, 'error:', errorText);
      let errorMessage = 'Failed to fetch user profile';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // JSON parsing failed, use original error text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully fetched user profile:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<OrganizerProfile | SponsorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn, user, showLoginModal } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (!isLoggedIn || !user) {
          console.error("[Profile] User not logged in");
          // Show login modal instead of redirect
          showLoginModal();
          return;
        }
        
        // ID format check
        if (!user.id) {
          console.error("[Profile] Invalid or missing user ID");
          showLoginModal();
          return;
        }
        
        console.log(`[Profile] Using user ID: "${user.id}"`);
        
        // Attempt to get user profile
        try {
          const userId = user.id;
          console.log(`Starting to fetch user profile, ID: "${userId}"`);
          
          const profile = await fetchUserProfile(userId);
          
          if (isMounted) {
            console.log("Successfully retrieved user profile:", profile);
            
            // Process received profile data
            const formattedProfile = {
              userId: profile.userId,
              bio: profile.bio || '',
              contactInfo: profile.contactInfo || '',
              avatar: profile.avatar || '',
              updatedAt: profile.updatedAt,
              events: profile.events || [],
              statistics: profile.statistics || {
                totalEvents: 0,
                upcomingEvents: 0,
                averageAttendees: 0,
                totalRevenue: '$0'
              }
            };
            
            setProfileData(formattedProfile);
            setError(null); // Clear errors
          }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Store error message but still continue to show the page
          if (isMounted) {
            setError((profileError as Error).message || 'Failed to fetch user profile');
          }
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        if (isMounted) {
          showLoginModal();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function to prevent setting state after unmount
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user, router, showLoginModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's no user data, redirect to login page
  if (!isLoggedIn || !user) return null;

  // If there's an error but no data, show error message
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

  // Ensure profileData exists
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

      {/* Top personal information card */}
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

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
          {/* Tab navigation */}
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

          {/* Tab content */}
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