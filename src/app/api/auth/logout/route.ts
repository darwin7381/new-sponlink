import { NextRequest, NextResponse } from 'next/server';
import { clearLocalAuth } from '@/lib/auth/authUtils';

export async function POST(request: NextRequest) {
  try {
    // 執行登出操作 - 只清理本地存儲，實際的會話登出應由前端處理
    clearLocalAuth();
    
    return NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出過程中出錯:', error);
    return NextResponse.json(
      { success: false, error: '登出過程中出錯' },
      { status: 500 }
    );
  }
} 