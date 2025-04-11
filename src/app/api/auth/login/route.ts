import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth/authService';
import { SystemRole } from '@/lib/types/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`嘗試登入: ${email}`);
    
    // 尝试使用authService验证用户凭证
    const user = await verifyCredentials(email, password);
    
    if (!user) {
      console.error(`無效的登入嘗試或用戶不存在: ${email}`);
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 確保用戶ID正確格式化 - 這是關鍵！
    if (typeof user.id === 'number') {
      user.id = `user_${user.id}`;
    } else {
      // 確保ID是字符串 
      user.id = String(user.id);
    }
    
    console.log(`登入成功: ${email}, 用户ID: ${user.id}, 類型: ${typeof user.id}`);
    
    // 返回用戶資料
    return NextResponse.json(user);
  } catch (error) {
    console.error('登入處理錯誤:', error);
    return new NextResponse(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 