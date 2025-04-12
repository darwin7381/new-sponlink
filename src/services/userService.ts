import { UserProfile, OrganizerProfile, SponsorProfile, OrganizerEvent, Sponsorship, OrganizerStatistics, SponsorAnalytics } from '@/types/user';
import * as dbUserService from './dbUserService';
import { USER_ROLES, SystemRole } from '@/lib/types/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 定義數據庫事件类型
interface DbEvent {
  id: string;
  title?: string;
  status?: string;
  start_date?: Date;
}

// 定義數據庫贊助类型
interface DbSponsorship {
  id: string;
  event_name?: string;
  status?: string;
  amount?: string;
}

/**
 * 获取用户资料 - 使用规范化数据库结构获取数据
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
    
    // 获取用户统计数据
    const stats = await dbUserService.getUserStatistics(userId);
    
    // 默認所有用戶都可以查看所有功能，不再依賴視角區分
    const isOrganizer = true; // 默認都顯示組織者視角
    
    // 为赞助商获取组织信息
    let orgProfile = null;
    if (!isOrganizer) {
      orgProfile = await dbUserService.getOrganizationProfileByUserId(userId);
    }
    
    // 构建标准化的用户资料对象
    if (isOrganizer) {
      // 主办方资料
      const organizerProfile: OrganizerProfile = {
        userId: dbProfile.user_id,
        bio: dbProfile.bio || '',
        contactInfo: dbProfile.contact_info || '',
        avatar: dbProfile.avatar_url || '',
        updatedAt: dbProfile.updated_at.toISOString(),
        events: [], // 待获取
        statistics: {
          totalEvents: stats?.total_events || 0,
          upcomingEvents: stats?.upcoming_events || 0,
          averageAttendees: stats?.average_attendees || 0,
          totalRevenue: stats?.total_revenue || '$0'
        }
      };
      
      // 获取用户的活动列表
      const events = await dbUserService.getUserEvents(userId);
      if (events && events.length > 0) {
        organizerProfile.events = events.map((event: DbEvent) => ({
          id: event.id,
          name: event.title || '',
          status: (event.status === 'completed' ? 'completed' : 'upcoming') as 'upcoming' | 'completed',
          date: event.start_date?.toISOString() || ''
        }));
      }
      
      return organizerProfile;
    } else {
      // 赞助商资料
      const sponsorProfile: SponsorProfile = {
        userId: dbProfile.user_id,
        bio: dbProfile.bio || '',
        contactInfo: dbProfile.contact_info || '',
        avatar: dbProfile.avatar_url || '',
        updatedAt: dbProfile.updated_at.toISOString(),
        companyName: orgProfile?.name || '',
        logo: orgProfile?.logo_url || '',
        description: orgProfile?.description || '',
        sponsorships: [], // 待获取
        analytics: {
          totalSponsored: stats?.total_sponsored || 0,
          activeSponsorship: stats?.active_sponsorships || 0,
          totalInvestment: stats?.total_investment || '$0',
          averageRoi: stats?.average_roi || '0%'
        }
      };
      
      // 获取用户的赞助列表
      const sponsorships = await dbUserService.getUserSponsorships(userId);
      if (sponsorships && sponsorships.length > 0) {
        sponsorProfile.sponsorships = sponsorships.map((sponsorship: DbSponsorship) => ({
          id: sponsorship.id,
          eventName: sponsorship.event_name || '',
          status: (sponsorship.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
          amount: sponsorship.amount || '$0'
        }));
      }
      
      return sponsorProfile;
    }
  } catch (error) {
    console.error('获取用户资料错误:', error);
    throw error;
  }
};

/**
 * 更新用户资料 - 使用规范化数据库结构更新数据
 * @param userId 用户ID
 * @param profileData 要更新的资料
 * @returns 更新后的用户资料
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    // 基本資料更新
    const basicData: Record<string, string | null> = {};
    
    if ('bio' in profileData) basicData.bio = profileData.bio || null;
    if ('contactInfo' in profileData) basicData.contact_info = profileData.contactInfo || null;
    if ('avatar' in profileData) basicData.avatar_url = profileData.avatar || null;
    
    // 更新用戶基本資料
    if (Object.keys(basicData).length > 0) {
      await dbUserService.updateUserProfile(userId, basicData);
    }
    
    // 更新統計數據
    if ('statistics' in profileData) {
      const stats = profileData.statistics as OrganizerStatistics;
      await dbUserService.updateUserStatistics(userId, {
        total_events: stats.totalEvents,
        upcoming_events: stats.upcomingEvents,
        average_attendees: stats.averageAttendees,
        total_revenue: stats.totalRevenue
      });
    }
    
    // 更新分析數據
    if ('analytics' in profileData) {
      const analytics = (profileData as SponsorProfile).analytics;
      await dbUserService.updateUserStatistics(userId, {
        total_sponsored: analytics.totalSponsored,
        active_sponsorships: analytics.activeSponsorship,
        total_investment: analytics.totalInvestment,
        average_roi: analytics.averageRoi
      });
    }
    
    // 更新組織資料
    if ('companyName' in profileData || 'logo' in profileData || 'description' in profileData) {
      const orgData: Record<string, string | null> = {};
      if ('companyName' in profileData) orgData.name = profileData.companyName || null;
      if ('logo' in profileData) orgData.logo_url = profileData.logo || null;
      if ('description' in profileData) orgData.description = profileData.description || null;
      
      await dbUserService.updateOrganizationProfile(userId, orgData);
    }
    
    // 返回更新後的用戶資料
    return await getUserProfile(userId);
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    throw error;
  }
};

/**
 * 获取用户活动
 * @param userId 用户ID
 * @param status 可选的状态过滤
 * @returns 活动列表
 */
export const getUserEvents = async (userId: string, status?: 'upcoming' | 'completed'): Promise<OrganizerEvent[]> => {
  try {
    const events = await dbUserService.getUserEvents(userId);
    
    if (!events || events.length === 0) {
      return [];
    }
    
    const mappedEvents = events.map((event: DbEvent) => ({
      id: event.id,
      name: event.title || '',
      status: (event.status === 'completed' ? 'completed' : 'upcoming') as 'upcoming' | 'completed',
      date: event.start_date?.toISOString() || ''
    }));
    
    if (status) {
      return mappedEvents.filter(event => event.status === status);
    }
    
    return mappedEvents;
  } catch (error) {
    console.error('获取用户活动错误:', error);
    return [];
  }
};

/**
 * 获取用户赞助
 * @param userId 用户ID
 * @param status 可选的状态过滤
 * @returns 赞助列表
 */
export const getUserSponsorships = async (userId: string, status?: 'confirmed' | 'pending'): Promise<Sponsorship[]> => {
  try {
    const sponsorships = await dbUserService.getUserSponsorships(userId);
    
    if (!sponsorships || sponsorships.length === 0) {
      return [];
    }
    
    const mappedSponsorships = sponsorships.map((sponsorship: DbSponsorship) => ({
      id: sponsorship.id,
      eventName: sponsorship.event_name || '',
      status: (sponsorship.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
      amount: sponsorship.amount || '$0'
    }));
    
    if (status) {
      return mappedSponsorships.filter(s => s.status === status);
    }
    
    return mappedSponsorships;
  } catch (error) {
    console.error('获取用户赞助错误:', error);
    return [];
  }
};

/**
 * 获取用户统计数据
 * @param userId 用户ID
 * @returns 统计数据
 */
export const getUserAnalytics = async (userId: string): Promise<OrganizerStatistics | SponsorAnalytics | null> => {
  try {
    // 不再區分用戶角色，統一返回組織者視角的統計數據
    
    // 获取统计数据
    const stats = await dbUserService.getUserStatistics(userId);
    if (!stats) return null;
    
    // 默認返回組織者格式的數據
    return {
      totalEvents: stats.total_events || 0,
      upcomingEvents: stats.upcoming_events || 0,
      averageAttendees: stats.average_attendees || 0,
      totalRevenue: stats.total_revenue || '$0'
    };
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    return null;
  }
}; 