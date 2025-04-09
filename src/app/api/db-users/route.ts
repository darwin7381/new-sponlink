import { NextRequest, NextResponse } from 'next/server';
import * as dbUserService from '@/services/dbUserService';

/**
 * 獲取所有用戶
 */
export async function GET(request: NextRequest) {
  try {
    // 在實際應用中，會添加分頁、篩選等功能
    // 目前僅做示例展示
    
    // 檢查環境變數是否配置
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: '數據庫未配置，請先設置 DATABASE_URL 環境變數',
        mock: true,
        users: [{
          id: 'mock_user_1',
          email: 'mock@example.com',
          name: '模擬用戶',
          role: 'ORGANIZER',
        }]
      }, { status: 200 });
    }
    
    // 這裡應該實現用戶權限檢查
    // 目前僅用於測試，未實現實際權限控制
    
    // 獲取特定用戶（如果有提供 id 或 email）
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    
    let userData = null;
    
    if (id) {
      userData = await dbUserService.getUserById(id);
    } else if (email) {
      userData = await dbUserService.getUserByEmail(email);
    }
    
    if (userData) {
      return NextResponse.json({ user: userData });
    }
    
    // 如果沒有提供任何參數，返回提示信息
    return NextResponse.json({
      message: '請提供 id 或 email 參數查詢特定用戶',
      example: '/api/db-users?id=user_123 或 /api/db-users?email=example@mail.com'
    });
    
  } catch (error) {
    console.error('獲取用戶錯誤:', error);
    return NextResponse.json(
      { error: '獲取用戶失敗', message: (error as Error).message },
      { status: 500 }
    );
  }
} 