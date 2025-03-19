import { NextResponse } from 'next/server';
import { mockUsers } from '@/mocks/userData';
import { USER_ROLES } from '@/lib/types/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`嘗試登入: ${email}`);

    // 定義有效的登入憑證
    const validCredentials = [
      { email: 'sponsor@example.com', password: 'sponsor123', role: USER_ROLES.SPONSOR },
      { email: 'organizer@example.com', password: 'organizer123', role: USER_ROLES.ORGANIZER }
    ];
    
    // 檢查是否有匹配的憑證
    const credential = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (!credential) {
      console.error(`無效的登入嘗試: ${email}`);
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 找到對應的用戶
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      console.error(`找不到用戶: ${email}`);
      return new NextResponse(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`登入成功: ${email}, 角色: ${user.role}`);
    
    // 返回用戶資料
    return NextResponse.json(user);
  } catch (error) {
    console.error('登入錯誤:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 