import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    // 執行登出操作
    logout();
    
    return NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出過程中出錯:', error);
    return NextResponse.json(
      { error: '登出過程中出錯' },
      { status: 500 }
    );
  }
} 