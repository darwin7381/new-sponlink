"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';

export default function SponsorshipsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
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
      {/* 頂部導航欄 - 使用紫色背景，匹配截圖 */}
      <div className="bg-[#6966db] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">贊助商專區</h1>
              <div className="flex space-x-8">
                <Link href="/sponsor/sponsorships" className="text-white hover:text-white/90 py-1 border-b-2 border-white">會議列表</Link>
                <Link href="/sponsor/my-list" className="text-white hover:text-white/90 py-1 border-b-2 border-transparent">我的收藏</Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                href="/organizer"
                className="flex items-center text-white hover:text-white/90 transition-colors"
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
    </div>
  );
} 