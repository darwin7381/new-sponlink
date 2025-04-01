"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES, User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';
import SwitchRoleToggle from '@/components/layout/SwitchRoleToggle';

export default function SponsorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'sponsors' | 'meetings' | 'collection'>('meetings');
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">加載中...</h1>
          <p className="text-muted-foreground">請稍候，正在檢查您的帳戶信息。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* 頂部導航欄 - 使用藍色背景，匹配截圖 */}
      <div className="bg-[#6966db] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">贊助商中心</h1>
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('meetings')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'meetings' ? 'border-white' : 'border-transparent'}`}
                >
                  會議列表
                </button>
                <button 
                  onClick={() => setActiveTab('collection')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'collection' ? 'border-white' : 'border-transparent'}`}
                >
                  我的收藏
                </button>
                <button 
                  onClick={() => setActiveTab('sponsors')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'sponsors' ? 'border-white' : 'border-transparent'}`}
                >
                  我的贊助
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                href="/organizer"
                className="flex items-center text-white hover:text-white/90 transition-colors px-4 py-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                切換到主辦方
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {activeTab === 'meetings' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">篩選會議</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="w-full">
                <p className="mb-2 font-medium">時間</p>
                <select className="w-full p-2 border border-border rounded" aria-label="選擇時間範圍">
                  <option>所有時間</option>
                  <option>未來一週</option>
                  <option>未來一個月</option>
                  <option>未來三個月</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">地區</p>
                <select className="w-full p-2 border border-border rounded" aria-label="選擇地區">
                  <option>所有地區</option>
                  <option>亞洲</option>
                  <option>歐洲</option>
                  <option>北美</option>
                  <option>南美</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">贊道</p>
                <select className="w-full p-2 border border-border rounded" aria-label="選擇贊道">
                  <option>所有贊道</option>
                  <option>DeFi</option>
                  <option>NFT</option>
                  <option>Web3 Social</option>
                  <option>Layer2</option>
                  <option>Infrastructure</option>
                  <option>Security</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">活動類型</p>
                <select className="w-full p-2 border border-border rounded" aria-label="選擇活動類型">
                  <option>所有類型</option>
                  <option>線上</option>
                  <option>線下</option>
                  <option>混合式</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* ETH Tokyo 2025 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">ETH Tokyo 2025</h3>
                <p className="text-muted-foreground mt-1">5/15/2025 - 5/17/2025</p>
                <p className="text-muted-foreground">東京, 日本</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">DeFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">NFT</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Layer2</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/eth-tokyo-2025">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Web3 Summit San Francisco 2025 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Web3 Summit San Francisco 2025</h3>
                <p className="text-muted-foreground mt-1">6/10/2025 - 6/14/2025</p>
                <p className="text-muted-foreground">舊金山, 美國</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Web3 Social</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Infrastructure</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Layer2</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Security</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/web3-summit-2025">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Asia Blockchain Summit 2025 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Asia Blockchain Summit 2025</h3>
                <p className="text-muted-foreground mt-1">7/15/2025 - 7/17/2025</p>
                <p className="text-muted-foreground">新加坡, 新加坡</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">DeFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">GameFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Web3 Social</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Security</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/asia-blockchain-summit-2025">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* 其他會議列表 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Devcon Shanghai 2025 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Devcon Shanghai 2025</h3>
                <p className="text-muted-foreground mt-1">9/18/2025 - 9/21/2025</p>
                <p className="text-muted-foreground">上海, 中國</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">DeFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Layer2</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Infrastructure</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/devcon-shanghai-2025">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Paris Blockchain Week 2026 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Paris Blockchain Week 2026</h3>
                <p className="text-muted-foreground mt-1">3/15/2026 - 3/20/2026</p>
                <p className="text-muted-foreground">巴黎, 法國</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">DeFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Web3 Social</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">NFT</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/paris-blockchain-week-2026">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Consensus 2025 */}
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Consensus 2025</h3>
                <p className="text-muted-foreground mt-1">5/28/2025 - 5/30/2025</p>
                <p className="text-muted-foreground">奧斯汀, 美國</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">DeFi</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Infrastructure</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Security</span>
                </div>
                
                <div className="mt-6">
                  <Link href="/sponsor/sponsorships/consensus-2025">
                    <Button className="w-full">查看贊助方案</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'sponsors' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 左側欄位 */}
            <div className="w-full md:w-1/4 space-y-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">快速導航</h2>
                <nav className="space-y-2">
                  <Link href="/sponsor/sponsorships" className="block p-2 text-sm hover:bg-accent rounded">
                    我的贊助
                  </Link>
                  <Link href="/events" className="block p-2 text-sm hover:bg-accent rounded">
                    瀏覽活動
                  </Link>
                  <Link href="/meetings" className="block p-2 text-sm hover:bg-accent rounded">
                    會議安排
                  </Link>
                </nav>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">贊助統計</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">已贊助活動</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">進行中贊助</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">總贊助金額</p>
                    <p className="text-xl font-semibold">$0</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 主要內容區 */}
            <div className="w-full md:w-3/4 space-y-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">推薦贊助機會</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">ETH Tokyo 2025</h3>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">推薦</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">5/15/2025 - 5/17/2025 · 東京, 日本</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-medium">$5,000 起</span>
                      <Button variant="outline" size="sm">查看詳情</Button>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Web3 Summit 2025</h3>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">熱門</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">6/10/2025 - 6/14/2025 · 舊金山, 美國</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-medium">$10,000 起</span>
                      <Button variant="outline" size="sm">查看詳情</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <Link href="/events">
                    <Button variant="ghost" size="sm">
                      查看更多活動
                      <svg 
                        className="ml-1 h-4 w-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">我的贊助</h2>
                  <Link href="/sponsor/sponsorships">
                    <Button variant="outline" size="sm">查看全部</Button>
                  </Link>
                </div>
                
                <div className="text-center py-12">
                  <svg 
                    className="mx-auto h-12 w-12 text-muted-foreground/60" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium">還沒有贊助</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    開始贊助您感興趣的活動，提升您的品牌影響力！
                  </p>
                  <div className="mt-6">
                    <Link href="/events">
                      <Button>瀏覽活動</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                  <h2 className="text-lg font-semibold mb-4">贊助收益分析</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    了解贊助如何影響您的品牌曝光度和業務增長。
                  </p>
                  <Button variant="outline" size="sm">查看分析</Button>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                  <h2 className="text-lg font-semibold mb-4">贊助策略指南</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    探索如何制定有效的贊助策略，最大化投資回報率。
                  </p>
                  <Button variant="outline" size="sm">查看指南</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 我的收藏頁面
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">我的收藏</h2>
          
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <svg 
              className="mx-auto h-12 w-12 text-muted-foreground/60" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium">還沒有收藏</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              收藏您感興趣的活動，方便後續查看
            </p>
            <div className="mt-6">
              <Link href="/events">
                <Button>瀏覽活動</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 