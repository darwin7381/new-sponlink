"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className="min-h-screen">
      <div className="bg-brand-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SponLink 設計系統</h1>
            <Link href="/" className="text-white hover:text-brand-200 transition-colors">
              返回應用
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <nav className="mb-8">
          <ul className="flex space-x-6 border-b border-border">
            <li>
              <Link 
                href="/design-system/colors" 
                className={`inline-block py-2 border-b-2 ${
                  isActive('/design-system/colors') 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-medium' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-300'
                }`}
              >
                色彩系統
              </Link>
            </li>
            <li>
              <Link 
                href="/design-system/typography" 
                className={`inline-block py-2 border-b-2 ${
                  isActive('/design-system/typography') 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-medium' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-300'
                }`}
              >
                文字排版
              </Link>
            </li>
            <li>
              <Link 
                href="/design-system/components" 
                className={`inline-block py-2 border-b-2 ${
                  isActive('/design-system/components') 
                    ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-medium' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-300'
                }`}
              >
                組件庫
              </Link>
            </li>
          </ul>
        </nav>
        
        {children}
      </div>
    </div>
  );
} 