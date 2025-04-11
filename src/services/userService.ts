import { UserProfile, OrganizerProfile, SponsorProfile, OrganizerEvent, Sponsorship, OrganizerStatistics, SponsorAnalytics } from '@/types/user';
import * as dbUserService from './dbUserService';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  // 允許其他可能的字符串索引屬性
  [key: string]: string | number | boolean | object | undefined | null;
}

/**
 * 获取用户资料 - 使用数据库获取真实数据，不再使用模拟数据
 * @param userId 用户ID
 * @returns 用户资料
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    // 从数据库获取用户个人资料
    const dbProfile = await dbUserService.getUserProfile(userId);
    
    if (!dbProfile) {
      throw new Error(`未找到用户资料: ${userId}`);
    }
    
    // 处理存储在JSON中的profile_data
    let profileData: ProfileData = {};
    if (dbProfile.profile_data) {
      try {
        profileData = JSON.parse(dbProfile.profile_data);
      } catch (e) {
        console.error('解析profile_data失败:', e);
      }
    }
    
    // 确定用户类型（主办方或赞助商）
    const isOrganizer = profileData.userType === 'organizer' || !profileData.userType;
    
    // 构建标准化的用户资料对象
    if (isOrganizer) {
      // 主办方资料
      const organizerProfile: OrganizerProfile = {
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
      };
      return organizerProfile;
    } else {
      // 赞助商资料
      const sponsorProfile: SponsorProfile = {
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
      };
      return sponsorProfile;
    }
  } catch (error) {
    console.error('获取用户资料错误:', error);
    throw error;
  }
};

/**
 * 更新用户资料 - 简化版，无视图类型依赖
 * @param userId 用户ID
 * @param profileData 要更新的资料
 * @returns 更新后的用户资料
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  await delay(1000);
  
  // 获取当前用户资料
  const currentProfile = await getUserProfile(userId);
  
  // 合并更新数据
  const updatedProfile = {
    ...currentProfile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  return updatedProfile;
};

/**
 * 获取用户活动
 * @param userId 用户ID
 * @param status 可选的状态过滤
 * @returns 活动列表
 */
export const getUserEvents = async (userId: string, status?: 'upcoming' | 'completed'): Promise<OrganizerEvent[]> => {
  await delay(600);
  
  const profile = await getUserProfile(userId);
  
  if (!('events' in profile)) {
    return [];
  }
  
  if (status) {
    return profile.events.filter(event => event.status === status);
  }
  
  return profile.events;
};

/**
 * 获取用户赞助
 * @param userId 用户ID
 * @param status 可选的状态过滤
 * @returns 赞助列表
 */
export const getUserSponsorships = async (userId: string, status?: 'confirmed' | 'pending'): Promise<Sponsorship[]> => {
  await delay(600);
  
  // 简化实现，始终返回空数组
  return [];
};

/**
 * 获取用户统计数据
 * @param userId 用户ID
 * @returns 统计数据
 */
export const getUserAnalytics = async (userId: string): Promise<OrganizerStatistics | SponsorAnalytics | null> => {
  await delay(700);
  
  const profile = await getUserProfile(userId);
  
  if ('statistics' in profile) {
    return profile.statistics;
  }
  
  return null;
}; 