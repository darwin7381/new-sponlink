import { NextRequest, NextResponse } from 'next/server';
import * as dbUserService from '@/services/dbUserService';
import { OrganizerProfile, SponsorProfile, OrganizerEvent, Sponsorship, OrganizerStatistics, SponsorAnalytics } from '@/types/user';

/**
 * 定義 ProfileData 類型來表示 JSON 中存儲的資料
 */
interface ProfileData {
  userType?: 'organizer' | 'sponsor';
  avatar?: string;
  events?: OrganizerEvent[];
  statistics?: OrganizerStatistics;
  companyName?: string;
  logo?: string;
  description?: string;
  sponsorships?: Sponsorship[];
  analytics?: SponsorAnalytics;
  [key: string]: string | number | boolean | object | undefined | null;
}

/**
 * 獲取用戶個人資料API
 * 從服務器端獲取用戶資料，避免在客戶端直接使用數據庫連接
 */
export async function GET(request: NextRequest) {
  try {
    // 改用URL參數獲取用戶ID
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId') || '';
    
    console.log('API獲取用戶資料，原始用戶ID:', JSON.stringify(userId), '長度:', userId.length);
    console.log('請求URL:', request.url);
    console.log('所有查詢參數:', Object.fromEntries(searchParams.entries()));
    
    // 驗證用戶ID
    if (!userId) {
      console.log('API錯誤：缺少用戶ID參數');
      return NextResponse.json(
        { error: '缺少用戶ID' },
        { status: 400 }
      );
    }
    
    // ID格式修正 - 這是關鍵！
    // 處理純數字ID的情況
    if (/^\d+$/.test(userId)) {
      console.log(`檢測到純數字ID: ${userId}, 將轉換為正確格式`);
      userId = `user_${userId}`;
      console.log(`轉換後的ID: ${userId}`);
    }
    
    // 直接檢查此ID是否在資料庫中
    try {
      // 從數據庫獲取用戶基本信息，確認用戶存在
      const user = await dbUserService.getUserById(userId);
      console.log('數據庫中的用戶ID查詢結果:', user ? '找到用戶' : '未找到用戶', user ? `ID=${user.id}` : `查詢ID=${userId}`);
      
      if (!user) {
        console.log('API錯誤：資料庫中找不到此用戶, 查詢ID:', userId);
        return NextResponse.json(
          { error: '用戶不存在' },
          { status: 404 }
        );
      }
      
      console.log('用戶存在，繼續獲取個人資料');
      
      // 從數據庫獲取用戶個人資料
      let dbProfile = await dbUserService.getUserProfile(userId);
      console.log('數據庫中的用戶資料:', dbProfile ? '存在' : '不存在');
      
      // 如果找不到用戶資料，創建一個基本資料
      if (!dbProfile) {
        console.log('未找到用戶資料，嘗試創建初始資料:', userId);
        
        // 創建初始用戶資料
        try {
          // 預設為組織者類型
          const defaultProfileData = {
            user_id: userId,
            bio: '',
            contact_info: '',
            profile_data: JSON.stringify({
              userType: 'organizer',
              avatar: '',
              events: [],
              statistics: {
                totalEvents: 0,
                upcomingEvents: 0,
                averageAttendees: 0,
                totalRevenue: '$0'
              }
            })
          };
          
          console.log('創建初始用戶資料:', defaultProfileData);
          dbProfile = await dbUserService.createUserProfile(userId, defaultProfileData);
          console.log('已創建初始用戶資料:', dbProfile);
        } catch (createError) {
          console.error('創建用戶資料失敗:', createError);
          return NextResponse.json(
            { error: '創建用戶資料失敗' },
            { status: 500 }
          );
        }
      }
      
      if (!dbProfile) {
        console.error('無法獲取或創建用戶資料');
        return NextResponse.json(
          { error: '無法獲取或創建用戶資料' },
          { status: 500 }
        );
      }
      
      // 處理存儲在JSON中的profile_data
      let profileData: ProfileData = {};
      if (dbProfile.profile_data) {
        try {
          profileData = JSON.parse(dbProfile.profile_data);
          console.log('成功解析profile_data');
        } catch (e) {
          console.error('解析profile_data失敗:', e, '原始數據:', dbProfile.profile_data);
        }
      } else {
        console.log('profile_data為空');
      }
      
      // 確定用戶類型（主辦方或贊助商）
      const isOrganizer = profileData.userType === 'organizer' || !profileData.userType;
      console.log('用戶類型:', isOrganizer ? '主辦方' : '贊助商');
      
      // 構建標準化的用戶資料對象
      let userProfile;
      if (isOrganizer) {
        // 主辦方資料
        userProfile = {
          userId: dbProfile.user_id,
          bio: dbProfile.bio || '',
          contactInfo: dbProfile.contact_info || '',
          avatar: profileData.avatar || '',
          updatedAt: dbProfile.updated_at.toISOString(),
          events: profileData.events || [],
          statistics: profileData.statistics || {
            totalEvents: 0,
            upcomingEvents: 0,
            averageAttendees: 0,
            totalRevenue: '$0'
          }
        } as OrganizerProfile;
      } else {
        // 贊助商資料
        userProfile = {
          userId: dbProfile.user_id,
          bio: dbProfile.bio || '',
          contactInfo: dbProfile.contact_info || '',
          avatar: profileData.avatar || '',
          updatedAt: dbProfile.updated_at.toISOString(),
          companyName: profileData.companyName || '',
          logo: profileData.logo || '',
          description: profileData.description || '',
          sponsorships: profileData.sponsorships || [],
          analytics: profileData.analytics || {
            totalSponsored: 0,
            activeSponsorship: 0,
            totalInvestment: '$0',
            averageRoi: '0%'
          }
        } as SponsorProfile;
      }
      
      console.log('成功構建用戶資料，準備返回');
      return NextResponse.json(userProfile);
      
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