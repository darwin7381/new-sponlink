import { NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/types/users';
import { createUser } from '@/lib/auth/authService';

export async function POST(request: Request) {
  try {
    // 解析請求體
    const body = await request.json();
    const { name, email, password, role } = body;
    
    // 驗證必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '電子郵件和密碼是必填字段' },
        { status: 400 }
      );
    }
    
    // 驗證角色
    const validRole = Object.values(USER_ROLES).includes(role as USER_ROLES);
    if (!validRole) {
      return NextResponse.json(
        { error: '角色無效，必須是 SPONSOR 或 ORGANIZER' },
        { status: 400 }
      );
    }
    
    // 驗證密碼長度
    if (password.length < 8) {
      return NextResponse.json(
        { error: '密碼必須至少8個字符' },
        { status: 400 }
      );
    }
    
    // 創建用戶
    const user = await createUser({
      email,
      password,
      name,
      role: role as USER_ROLES,
      preferred_language: 'zh' // 默認為中文
    });
    
    // 返回用戶信息(不含密碼)
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('註冊錯誤:', error);
    
    // 處理常見錯誤
    if (error.message === '電子郵件已被使用') {
      return NextResponse.json(
        { error: '該電子郵件已註冊' },
        { status: 409 }
      );
    }
    
    // 其他錯誤
    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    );
  }
} 