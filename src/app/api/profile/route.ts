import { NextRequest, NextResponse } from 'next/server';
import * as dbUserService from '@/services/dbUserService';

/**
 * 獲取用戶個人資料API
 * 從服務器端獲取用戶資料，避免在客戶端直接使用數據庫連接
 */
export async function GET(request: NextRequest) {
  try {
    // 從URL參數獲取用戶ID
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    
    console.log('API獲取用戶資料，用戶ID:', userId);
    
    // 驗證用戶ID
    if (!userId) {
      console.log('API錯誤：缺少用戶ID參數');
      return NextResponse.json(
        { error: '缺少用戶ID' },
        { status: 400 }
      );
    }
    
    try {
      // 1. 檢查用戶是否存在
      const user = await dbUserService.getUserById(userId);
      
      if (!user) {
        console.log('API錯誤：找不到用戶, ID:', userId);
        return NextResponse.json(
          { error: '用戶不存在' },
          { status: 404 }
        );
      }
      
      // 2. 獲取用戶資料
      const profile = await dbUserService.getUserProfile(userId);
      
      if (!profile) {
        console.log('API錯誤：找不到用戶資料, ID:', userId);
        return NextResponse.json(
          { error: '用戶資料不存在' },
          { status: 404 }
        );
      }
      
      // 3. 獲取用戶統計數據
      const statistics = await dbUserService.getUserStatistics(userId);
      
      // 4. 獲取用戶活動
      const events = await dbUserService.getUserEvents(userId);
      
      // 5. 獲取用戶贊助
      const sponsorships = await dbUserService.getUserSponsorships(userId);
      
      // 構建回應數據
      const responseData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        bio: profile.bio || '',
        contactInfo: profile.contact_info || '',
        avatar: profile.avatar_url || '',
        updatedAt: profile.updated_at.toISOString(),
        events: events,
        statistics: {
          totalEvents: statistics?.total_events || 0,
          upcomingEvents: statistics?.upcoming_events || 0,
          averageAttendees: statistics?.average_attendees || 0,
          totalRevenue: statistics?.total_revenue || '0'
        },
        sponsorships: sponsorships
      };
      
      return NextResponse.json(responseData);
      
    } catch (dbError) {
      console.error('資料庫操作錯誤:', dbError);
      return NextResponse.json(
        { error: '資料庫操作錯誤' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    return NextResponse.json(
      { error: '獲取用戶資料失敗' },
      { status: 500 }
    );
  }
} 