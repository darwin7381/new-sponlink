import { OrganizerProfile, SponsorProfile } from '../types/users';

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 基本的模拟数据，不依赖userData.ts
const basicOrganizerProfile: OrganizerProfile = {
  userId: '',
  bio: '组织者简介',
  contactInfo: 'contact@example.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  updatedAt: '2023-05-15T10:30:00Z',
  events: [],
  statistics: {
    totalEvents: 0,
    upcomingEvents: 0,
    averageAttendees: 0,
    totalRevenue: '$0'
  }
};

const basicSponsorProfile: SponsorProfile = {
  userId: '',
  bio: '赞助商简介',
  contactInfo: 'sponsor@example.com',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  updatedAt: '2023-06-20T14:45:00Z',
  companyName: 'Example Corp',
  logo: 'https://via.placeholder.com/150x50?text=Logo',
  description: '公司描述',
  sponsorships: [],
  analytics: {
    totalSponsored: 0,
    activeSponsorship: 0,
    totalInvestment: '$0',
    averageRoi: '0%'
  }
};

/**
 * 获取用户资料
 * @param userId 用户ID
 * @returns 用户资料
 */
export const getUserProfile = async (userId: string): Promise<OrganizerProfile> => {
  // 这里应该调用API获取用户资料
  await delay(300);
  
  // 默認返回組織者視角
  return {
    ...basicOrganizerProfile,
    userId
  };
};

/**
 * 更新用户资料
 * @param userId 用户ID
 * @param profileData 要更新的资料
 * @returns 更新后的用户资料
 */
export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<OrganizerProfile>
): Promise<OrganizerProfile> => {
  // 这里应该调用API更新用户资料
  await delay(500);
  
  // 获取当前资料
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
 * 获取组织者活动
 * @param userId 用户ID
 * @returns 活动列表
 */
export const getOrganizerEvents = async (userId: string) => {
  await delay(300);
  
  const profile = await getUserProfile(userId);
  return profile.events;
};

/**
 * 获取赞助商赞助
 * @param userId 用户ID
 * @returns 赞助列表
 */
export const getSponsorships = async (userId: string) => {
  await delay(300);
  
  // 由於不再支持贊助商視角，返回空數組
  return [];
};

/**
 * 获取分析数据
 * @param userId 用户ID
 * @returns 分析数据
 */
export const getAnalytics = async (userId: string) => {
  await delay(300);
  
  const profile = await getUserProfile(userId);
  return profile.statistics;
}; 