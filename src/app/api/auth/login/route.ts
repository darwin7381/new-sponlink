import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/lib/mocks/users';
import { USER_ROLES } from '@/lib/types/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

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
      console.error(`Invalid login attempt: ${email}`);
      return new NextResponse('Invalid credentials', { status: 401 });
    }
    
    // 找到對應的用戶
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      console.error(`User not found: ${email}`);
      return new NextResponse('User not found', { status: 404 });
    }
    
    // 返回用戶資料
    return NextResponse.json(user);
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 