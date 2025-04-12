import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth/authService';
import { SystemRole } from '@/lib/types/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`[LoginAPI] 嘗試登入: ${email}`);
    
    // 尝试使用authService验证用户凭证
    const user = await verifyCredentials(email, password);
    
    if (!user) {
      console.error(`[LoginAPI] 無效的登入嘗試或用戶不存在: ${email}`);
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 直接使用用戶ID，不需要轉換
    console.log(`[LoginAPI] 登入成功: ${email}, 用户ID: ${user.id}`);
    
    // 返回用戶資料
    return NextResponse.json(user);
  } catch (error) {
    console.error('[LoginAPI] 登入處理錯誤:', error);
    return new NextResponse(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 