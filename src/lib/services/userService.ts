import { OrganizerProfile, SponsorProfile } from '../types/users';

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 从真实数据库获取用户资料
export const getUserProfile = async (userId: string, role: string): Promise<OrganizerProfile | SponsorProfile> => {
  // 这里应该调用API获取用户资料
  await delay(300);
  
  if (role === 'ORGANIZER') {
    // 组织者资料
    return {
      userId,
      bio: '擁有超過10年經驗的活動組織者',
      contactInfo: 'organizer@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      updatedAt: new Date().toISOString(),
      events: [
        { id: '101', name: '科技大會 2023', status: 'upcoming', date: '2023-12-15' },
        { id: '102', name: '數位行銷峰會', status: 'completed', date: '2023-04-10' }
      ],
      statistics: {
        totalEvents: 15,
        upcomingEvents: 3,
        averageAttendees: 250,
        totalRevenue: '$75,000'
      }
    };
  } else if (role === 'SPONSOR') {
    // 赞助商资料
    return {
      userId,
      bio: '全球科技公司，支持創新活動',
      contactInfo: 'sponsor@example.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      updatedAt: new Date().toISOString(),
      companyName: 'TechGlobal Inc.',
      logo: 'https://via.placeholder.com/150x50?text=TechGlobal',
      description: '為活動和會議提供技術解決方案的領先供應商',
      sponsorships: [
        { id: '201', eventName: '科技大會 2023', status: 'confirmed', amount: '$10,000' },
        { id: '202', eventName: '數位創新論壇', status: 'pending', amount: '$5,000' }
      ],
      analytics: {
        totalSponsored: 12,
        activeSponsorship: 3,
        totalInvestment: '$85,000',
        averageRoi: '145%'
      }
    };
  } else {
    throw new Error('无效的用户角色');
  }
};

// 更新用户资料
export const updateUserProfile = async (
  userId: string, 
  role: string, 
  profileData: Partial<OrganizerProfile | SponsorProfile>
): Promise<OrganizerProfile | SponsorProfile> => {
  // 这里应该调用API更新用户资料
  await delay(500);
  
  // 获取当前资料
  const currentProfile = await getUserProfile(userId, role);
  
  // 合并更新数据
  const updatedProfile = {
    ...currentProfile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  return updatedProfile;
};

// 获取组织者活动
export const getOrganizerEvents = async (userId: string, status: string | null = null) => {
  await delay(300);
  
  const profile = await getUserProfile(userId, 'ORGANIZER') as OrganizerProfile;
  
  if (status) {
    return profile.events.filter(event => event.status === status);
  }
  
  return profile.events;
};

// 获取赞助商赞助
export const getSponsorships = async (userId: string, status: string | null = null) => {
  await delay(300);
  
  const profile = await getUserProfile(userId, 'SPONSOR') as SponsorProfile;
  
  if (status) {
    return profile.sponsorships.filter(sponsorship => sponsorship.status === status);
  }
  
  return profile.sponsorships;
};

// 获取统计数据
export const getAnalytics = async (userId: string, role: string) => {
  await delay(300);
  
  if (role === 'ORGANIZER') {
    const profile = await getUserProfile(userId, 'ORGANIZER') as OrganizerProfile;
    return profile.statistics;
  } else if (role === 'SPONSOR') {
    const profile = await getUserProfile(userId, 'SPONSOR') as SponsorProfile;
    return profile.analytics;
  }
  
  throw new Error('无效的用户角色');
}; 