"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

// 顏色組名稱常量
const COLOR_GROUPS = {
  BRAND: 'brand',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ACCENT: 'accent',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  NEUTRAL: 'neutral',
};

// 色調變體常量
const SHADE_VARIANTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// 品牌專屬配色
const BRAND_PALETTE = {
  // 主品牌色 - 深湖藍
  brand: {
    50: 'hsl(194, 100%, 97%)',  // #f0fafc
    100: 'hsl(194, 90%, 92%)',   // #d7f2f9
    200: 'hsl(194, 85%, 83%)',   // #b2e8f5
    300: 'hsl(194, 80%, 71%)',   // #7fd9ee
    400: 'hsl(194, 75%, 58%)',   // #40c6e0
    500: 'hsl(194, 70%, 50%)',   // #1cb3d0
    600: 'hsl(194, 75%, 41%)',   // #178eaa
    700: 'hsl(194, 75%, 33%)',   // #12738b
    800: 'hsl(194, 75%, 26%)',   // #0e5c6f
    900: 'hsl(194, 75%, 20%)',   // #0b4555
    950: 'hsl(194, 80%, 12%)',   // #072a33
  },
  
  // 輔助品牌色 - 珊瑚紅
  secondary: {
    50: 'hsl(6, 100%, 97%)',     // #fff0f0
    100: 'hsl(6, 95%, 94%)',     // #ffd7d7
    200: 'hsl(6, 90%, 87%)',     // #fbb5b5
    300: 'hsl(6, 85%, 79%)',     // #f68f8f
    400: 'hsl(6, 80%, 70%)',     // #f06b6b
    500: 'hsl(6, 75%, 60%)',     // #e74c4c
    600: 'hsl(6, 70%, 52%)',     // #d92e2e
    700: 'hsl(6, 75%, 42%)',     // #b01f1f
    800: 'hsl(6, 80%, 35%)',     // #8f1919
    900: 'hsl(6, 85%, 25%)',     // #651111
    950: 'hsl(6, 90%, 15%)',     // #3f0a0a
  },
  
  // 強調色 - 琥珀黃
  accent: {
    50: 'hsl(45, 100%, 96%)',    // #fff9e6
    100: 'hsl(45, 95%, 90%)',    // #ffefc0
    200: 'hsl(45, 90%, 82%)',    // #ffe499
    300: 'hsl(45, 85%, 70%)',    // #ffd666
    400: 'hsl(45, 80%, 60%)',    // #ffc933
    500: 'hsl(45, 90%, 50%)',    // #ffc107
    600: 'hsl(45, 85%, 43%)',    // #d99e00
    700: 'hsl(45, 80%, 35%)',    // #b38000
    800: 'hsl(45, 75%, 28%)',    // #8c6400
    900: 'hsl(45, 70%, 22%)',    // #664800
    950: 'hsl(45, 80%, 12%)',    // #332400
  },
  
  // 功能色 - 成功綠
  success: {
    50: 'hsl(152, 70%, 95%)',    // #e6f7f0
    100: 'hsl(152, 68%, 88%)',   // #c4ecd8
    200: 'hsl(152, 65%, 75%)',   // #92dcb7
    300: 'hsl(152, 60%, 60%)',   // #5ac892
    400: 'hsl(152, 58%, 48%)',   // #2db066
    500: 'hsl(152, 65%, 40%)',   // #219653
    600: 'hsl(152, 70%, 33%)',   // #167a43
    700: 'hsl(152, 75%, 27%)',   // #0f6435
    800: 'hsl(152, 80%, 20%)',   // #084d27
    900: 'hsl(152, 85%, 15%)',   // #04371c
    950: 'hsl(152, 90%, 8%)',    // #02190d
  },
  
  // 功能色 - 警告黃
  warning: {
    50: 'hsl(36, 100%, 97%)',    // #fffaed
    100: 'hsl(36, 95%, 92%)',    // #fef0d1
    200: 'hsl(36, 90%, 84%)',    // #fddea4
    300: 'hsl(36, 85%, 74%)',    // #fbc770
    400: 'hsl(36, 80%, 64%)',    // #f8b042
    500: 'hsl(36, 90%, 56%)',    // #f5a623
    600: 'hsl(36, 85%, 49%)',    // #e0910c
    700: 'hsl(36, 80%, 40%)',    // #bd780a
    800: 'hsl(36, 75%, 32%)',    // #975f08
    900: 'hsl(36, 70%, 25%)',    // #704806
    950: 'hsl(36, 80%, 15%)',    // #442c04
  },
  
  // 功能色 - 錯誤紅
  error: {
    50: 'hsl(0, 100%, 97%)',     // #fff0f0
    100: 'hsl(0, 95%, 94%)',     // #ffd7d7
    200: 'hsl(0, 90%, 88%)',     // #ffb8b8
    300: 'hsl(0, 85%, 80%)',     // #ff9999
    400: 'hsl(0, 80%, 70%)',     // #ff6b6b
    500: 'hsl(0, 90%, 60%)',     // #ff3333
    600: 'hsl(0, 85%, 50%)',     // #ff0000
    700: 'hsl(0, 80%, 41%)',     // #cc0000
    800: 'hsl(0, 75%, 33%)',     // #a30000
    900: 'hsl(0, 70%, 25%)',     // #7a0000
    950: 'hsl(0, 80%, 15%)',     // #4d0000
  },
  
  // 功能色 - 資訊藍
  info: {
    50: 'hsl(210, 100%, 97%)',   // #f0f7ff
    100: 'hsl(210, 95%, 92%)',   // #d7e9ff
    200: 'hsl(210, 90%, 86%)',   // #b8d7ff
    300: 'hsl(210, 85%, 75%)',   // #85bbff
    400: 'hsl(210, 80%, 65%)',   // #57a0ff
    500: 'hsl(210, 90%, 58%)',   // #3385ff
    600: 'hsl(210, 85%, 50%)',   // #0066ff
    700: 'hsl(210, 80%, 42%)',   // #0052cc
    800: 'hsl(210, 75%, 34%)',   // #003e99
    900: 'hsl(210, 70%, 27%)',   // #002b66
    950: 'hsl(210, 80%, 14%)',   // #001433
  },
  
  // 中性色 - 灰階
  neutral: {
    50: 'hsl(220, 20%, 98%)',    // #f8f9fb
    100: 'hsl(220, 15%, 94%)',   // #eceef2
    200: 'hsl(220, 12%, 88%)',   // #dddfe5
    300: 'hsl(220, 10%, 78%)',   // #c2c5cc
    400: 'hsl(220, 8%, 65%)',    // #9da1a8
    500: 'hsl(220, 6%, 50%)',    // #7d8087
    600: 'hsl(220, 6%, 40%)',    // #63666c
    700: 'hsl(220, 6%, 30%)',    // #4a4c51
    800: 'hsl(220, 6%, 20%)',    // #313236
    900: 'hsl(220, 8%, 15%)',    // #24252a
    950: 'hsl(220, 10%, 8%)',    // #121316
  },
};

// 複製顏色值到剪貼簿
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`已複製 ${text} 到剪貼簿`);
};

// 顏色展示卡片元件
function ColorCard({ colorName, shade, color }: { colorName: string; shade: number; color: string }) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-border dark:border-neutral-700 w-full transition-shadow hover:shadow-md">
      <div 
        className="h-12 w-full cursor-pointer relative group" 
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(color)}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white transition-opacity">
          <Copy size={16} />
        </div>
      </div>
      <div className="p-2 text-xs bg-background flex items-center justify-between">
        <div>
          <div className="font-semibold">{colorName}-{shade}</div>
          <div className="text-muted-foreground truncate">{color}</div>
        </div>
        <button 
          onClick={() => copyToClipboard(color)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

// 顏色組展示區元件
function ColorGroup({ title, colorName, colors }: { title: string; colorName: string; colors: Record<number, string> }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-11 gap-3">
        {SHADE_VARIANTS.map((shade) => (
          <ColorCard key={`${colorName}-${shade}`} colorName={colorName} shade={shade} color={colors[shade]} />
        ))}
      </div>
    </div>
  );
}

// CSS變數使用指南元件
function CssVariablesGuide() {
  return (
    <div className="mt-8 p-4 border border-border rounded-lg bg-secondary/20">
      <h3 className="text-lg font-semibold mb-2">CSS變數使用指南</h3>
      <p className="mb-4 text-muted-foreground">使用以下格式在您的樣式中引用這些顏色：</p>
      
      <div className="bg-background p-4 rounded-md border border-border overflow-x-auto">
        <pre className="text-sm">
          <code className="text-foreground">
            {`.my-element {
  /* 基本使用 */
  color: var(--color-brand-500);
  background-color: var(--color-neutral-50);
  
  /* 與透明度一起使用 */
  border-color: rgb(var(--color-brand-500-rgb) / 0.5);
  
  /* 在Tailwind中使用 */
  @apply text-brand-500 bg-neutral-50;
}`}
          </code>
        </pre>
      </div>
    </div>
  );
}

// 主題應用案例展示元件
function ThemeApplicationExamples() {
  return (
    <div className="mt-10 pb-4">
      <h3 className="text-xl font-semibold mb-2">主題應用展示</h3>
      <p className="text-muted-foreground mb-6">以下展示了基於我們色彩系統的淺色與深色主題應用案例</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 淺色主題應用 */}
        <div className="rounded-lg bg-white border border-neutral-200 overflow-hidden shadow-sm">
          <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3">
            <h4 className="text-base font-medium text-neutral-800">淺色主題應用</h4>
          </div>
          
          <div className="p-5">
            {/* 按鈕區域 - 更簡潔的設計 */}
            <div className="mb-5">
              <p className="text-sm text-neutral-500 mb-3">按鈕元件</p>
              <div className="flex flex-wrap gap-4 mb-3">
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#1CB3D0', 
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#178EAA'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1CB3D0'
                  }}
                >
                  主要按鈕
                </button>
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'white', 
                    color: '#178EAA',
                    border: '1px solid #B2E8F5'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FAFC'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  次要按鈕
                </button>
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#F8F9FB', 
                    color: '#63666C',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ECEEF2'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9FB'
                  }}
                >
                  基本按鈕
                </button>
              </div>
            </div>
            
            {/* 訊息提示區域 */}
            <div className="mb-5">
              <p className="text-sm text-neutral-500 mb-3">訊息提示</p>
              
              {/* 成功訊息提示 - 更顯眼的設計 */}
              <div className="mb-3 rounded-md border border-success-300 border-l-3" 
                   style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)' }}>
                <div className="flex p-4">
                  <div className="mr-3 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="#219653">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-success-800">成功訊息提示</p>
                    <p className="text-sm text-success-700">操作已成功完成，您的變更已保存。</p>
                  </div>
                </div>
              </div>
              
              {/* 錯誤訊息提示 - 更顯眼的設計 */}
              <div className="rounded-md border border-error-300 border-l-3" 
                   style={{ backgroundColor: 'rgba(231, 76, 60, 0.08)' }}>
                <div className="flex p-4">
                  <div className="mr-3 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="#E74C4C">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-error-800">錯誤訊息提示</p>
                    <p className="text-sm text-error-700">操作失敗，請檢查輸入並重試。</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 標籤區域 */}
            <div>
              <p className="text-sm text-neutral-500 mb-3">標籤元件</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center" 
                      style={{ backgroundColor: '#F0FAFC', color: '#178EAA' }}>
                  品牌標籤
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center" 
                      style={{ backgroundColor: '#FFF0F0', color: '#B01F1F' }}>
                  特殊標籤
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center" 
                      style={{ backgroundColor: '#F8F9FB', color: '#63666C' }}>
                  資訊標籤
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 深色主題預覽 */}
        <div className="rounded-lg border border-neutral-200 overflow-hidden shadow-sm bg-white">
          <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3">
            <h4 className="text-base font-medium text-neutral-800">深色主題預覽</h4>
          </div>
          
          <div className="p-5 bg-neutral-900">
            {/* 按鈕區域 */}
            <div className="mb-5">
              <p className="text-sm text-neutral-300 mb-3">按鈕元件</p>
              <div className="flex flex-wrap gap-4 mb-3">
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#40C6E0', 
                    color: '#072A33',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#7FD9EE'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#40C6E0'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  主要按鈕
                </button>
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: 'rgba(28, 179, 208, 0.15)', 
                    color: '#7FD9EE',
                    border: '1px solid #12738B',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(28, 179, 208, 0.25)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(28, 179, 208, 0.15)'
                  }}
                >
                  次要按鈕
                </button>
                <button 
                  className="px-4 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#2A2C31', 
                    color: '#ECEEF2',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#3A3C41'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#2A2C31'
                  }}
                >
                  基本按鈕
                </button>
              </div>
            </div>
            
            {/* 訊息提示區域 */}
            <div className="mb-5">
              <p className="text-sm text-neutral-300 mb-3">訊息提示</p>
              
              {/* 成功訊息提示 - 深色主題 */}
              <div className="mb-3 rounded-md transition-all duration-200 hover:shadow-md" 
                   style={{ 
                     backgroundColor: 'rgba(15, 100, 53, 0.2)', 
                     borderLeft: '4px solid #219653' 
                   }}>
                <div className="flex p-4">
                  <div className="mr-3 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="#92DCB7">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">成功訊息提示</p>
                    <p className="text-sm text-neutral-200">操作已成功完成，您的變更已保存。</p>
                  </div>
                </div>
              </div>
              
              {/* 錯誤訊息提示 - 深色主題 */}
              <div className="rounded-md transition-all duration-200 hover:shadow-md" 
                   style={{ 
                     backgroundColor: 'rgba(153, 0, 0, 0.2)', 
                     borderLeft: '4px solid #E74C4C' 
                   }}>
                <div className="flex p-4">
                  <div className="mr-3 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="#FF9999">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">錯誤訊息提示</p>
                    <p className="text-sm text-neutral-200">操作失敗，請檢查輸入並重試。</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 標籤區域 */}
            <div>
              <p className="text-sm text-neutral-300 mb-3">標籤元件</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center transition-all duration-200 hover:shadow-sm" 
                      style={{ backgroundColor: 'rgba(28, 179, 208, 0.2)', color: '#7FD9EE' }}>
                  品牌標籤
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center transition-all duration-200 hover:shadow-sm" 
                      style={{ backgroundColor: 'rgba(217, 46, 46, 0.2)', color: '#F68F8F' }}>
                  特殊標籤
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center transition-all duration-200 hover:shadow-sm" 
                      style={{ backgroundColor: '#2A2C31', color: '#C2C5CC' }}>
                  資訊標籤
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 品牌色彩應用場景指南元件
function BrandColorUsageGuide() {
  return (
    <div className="mt-8 p-4 border border-border rounded-lg bg-neutral-100 dark:bg-neutral-800/90">
      <h3 className="text-lg font-semibold mb-4">品牌色彩應用場景指南</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-border shadow-sm">
          <h4 className="font-medium text-brand-700 dark:text-brand-300 mb-2 flex items-center">
            <span className="inline-block w-2 h-2 mr-2 rounded-full bg-brand-500"></span>
            主品牌色 (深湖藍)
          </h4>
          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
            <li>• 主要按鈕和操作元素</li>
            <li>• 導航欄和頁頭</li>
            <li>• 重要資訊高亮</li>
            <li>• 進度指示元素</li>
            <li>• 主要交互狀態</li>
          </ul>
        </div>
        
        <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-border shadow-sm">
          <h4 className="font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center">
            <span className="inline-block w-2 h-2 mr-2 rounded-full bg-secondary-500"></span>
            輔助品牌色 (珊瑚紅)
          </h4>
          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
            <li>• 次要按鈕和行動點</li>
            <li>• 特殊促銷內容</li>
            <li>• 需要注意的UI元素</li>
            <li>• 比較和對比內容</li>
            <li>• 收藏和喜愛功能</li>
          </ul>
        </div>
        
        <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-border shadow-sm">
          <h4 className="font-medium text-accent-700 dark:text-accent-300 mb-2 flex items-center">
            <span className="inline-block w-2 h-2 mr-2 rounded-full bg-accent-500"></span>
            強調色 (琥珀黃)
          </h4>
          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
            <li>• 突出顯示重要資訊</li>
            <li>• 特殊功能標記</li>
            <li>• 新功能指示</li>
            <li>• 促銷和特價標籤</li>
            <li>• 提高注意度的元素</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 主頁面元件
export default function ColorSystemPage() {
  const [viewMode, setViewMode] = useState<'all' | 'brand' | 'functional'>('all');
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">SponLink 色彩系統</h1>
          <Link href="/" className="text-brand-500 hover:text-brand-600 transition-colors">
            返回首頁
          </Link>
        </div>
        <p className="text-lg text-muted-foreground">
          這是SponLink的品牌色彩系統設計指南，用於確保整個產品體驗的一致性和專業性。
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-border">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 ${viewMode === 'all' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-muted-foreground'}`}
          >
            全部色彩
          </button>
          <button 
            onClick={() => setViewMode('brand')}
            className={`px-4 py-2 ${viewMode === 'brand' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-muted-foreground'}`}
          >
            品牌色彩
          </button>
          <button 
            onClick={() => setViewMode('functional')}
            className={`px-4 py-2 ${viewMode === 'functional' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-muted-foreground'}`}
          >
            功能色彩
          </button>
        </div>
      </div>
      
      {/* 主品牌色彩 */}
      {(viewMode === 'all' || viewMode === 'brand') && (
        <>
          <ColorGroup 
            title="主品牌色 - 深湖藍" 
            colorName={COLOR_GROUPS.BRAND} 
            colors={BRAND_PALETTE.brand} 
          />
          
          <ColorGroup 
            title="輔助品牌色 - 珊瑚紅" 
            colorName={COLOR_GROUPS.SECONDARY} 
            colors={BRAND_PALETTE.secondary} 
          />
          
          <ColorGroup 
            title="強調品牌色 - 琥珀黃" 
            colorName={COLOR_GROUPS.ACCENT} 
            colors={BRAND_PALETTE.accent} 
          />
        </>
      )}
      
      {/* 功能色彩 */}
      {(viewMode === 'all' || viewMode === 'functional') && (
        <>
          <ColorGroup 
            title="成功綠" 
            colorName={COLOR_GROUPS.SUCCESS} 
            colors={BRAND_PALETTE.success} 
          />
          
          <ColorGroup 
            title="警告黃" 
            colorName={COLOR_GROUPS.WARNING} 
            colors={BRAND_PALETTE.warning} 
          />
          
          <ColorGroup 
            title="錯誤紅" 
            colorName={COLOR_GROUPS.ERROR} 
            colors={BRAND_PALETTE.error} 
          />
          
          <ColorGroup 
            title="資訊藍" 
            colorName={COLOR_GROUPS.INFO} 
            colors={BRAND_PALETTE.info} 
          />
          
          <ColorGroup 
            title="中性灰" 
            colorName={COLOR_GROUPS.NEUTRAL} 
            colors={BRAND_PALETTE.neutral} 
          />
        </>
      )}
      
      {/* 顏色系統說明 */}
      <CssVariablesGuide />
      
      {/* 品牌色彩應用場景 */}
      <BrandColorUsageGuide />
      
      {/* 主題應用示例 */}
      <ThemeApplicationExamples />
    </div>
  );
} 