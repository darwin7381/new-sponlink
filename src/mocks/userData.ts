/**
 * 此文件已弃用 - 用户数据已迁移至Neon数据库
 * 保留此文件仅作参考，實際項目不應使用
 * 
 * 注意：新系統使用UUID格式：
 * - 組織者(organizer@example.com): '7f9e15a5-d7c1-4b8c-9db0-4ac3f0f3d0b3'
 * - 贊助商(sponsor@example.com): '3e8d9176-d5b2-4e92-a20f-2f39f77d0bb9'
 */

/*
import { OrganizerProfile, SponsorProfile } from '@/types/user';
import { SystemRole } from '@/lib/types/users';

// 模擬使用者資料 - 舊版格式，已不再使用
export const mockUsers = [
  {
    id: "3e8d9176-d5b2-4e92-a20f-2f39f77d0bb9", // 贊助商帳號 UUID
    email: "sponsor@example.com",
    systemRole: SystemRole.USER,
    preferred_language: "en",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "7f9e15a5-d7c1-4b8c-9db0-4ac3f0f3d0b3", // 組織者帳號 UUID
    email: "organizer@example.com",
    systemRole: SystemRole.USER,
    preferred_language: "en",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    email: "sponsor2@example.com",
    systemRole: SystemRole.USER,
    preferred_language: "zh",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "4",
    email: "organizer2@example.com", 
    systemRole: SystemRole.USER,
    preferred_language: "zh",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "5",
    email: "admin@example.com", 
    systemRole: SystemRole.ADMIN,
    preferred_language: "en",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  }
];

// 模擬用戶檔案資料 - 使用UUID格式
export const mockProfiles: {
  organizer: OrganizerProfile;
  sponsor: SponsorProfile;
} = {
  organizer: {
    userId: '7f9e15a5-d7c1-4b8c-9db0-4ac3f0f3d0b3', // 組織者UUID
    bio: 'Experienced event organizer with over 10 years of experience / 擁有超過10年經驗的活動組織者',
    contactInfo: 'organizer@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    updatedAt: '2023-05-15T10:30:00Z',
    events: [
      { id: '1', name: 'Tech Innovation Summit 2025 / 科技創新峰會 2025', status: 'upcoming', date: '2025-06-15' },
      { id: '2', name: 'Sustainable Development Forum / 永續發展論壇', status: 'upcoming', date: '2025-08-10' }
    ],
    statistics: {
      totalEvents: 15,
      upcomingEvents: 3,
      averageAttendees: 250,
      totalRevenue: '$75,000'
    }
  },
  sponsor: {
    userId: '3e8d9176-d5b2-4e92-a20f-2f39f77d0bb9', // 贊助商UUID
    bio: 'Global technology company supporting innovative events / 全球科技公司，支持創新活動',
    contactInfo: 'sponsor@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    updatedAt: '2023-06-20T14:45:00Z',
    companyName: 'TechGlobal Inc.',
    logo: 'https://via.placeholder.com/150x50?text=TechGlobal',
    description: 'Leading provider of technology solutions for events and conferences / 為活動和會議提供技術解決方案的領先供應商',
    sponsorships: [
      { id: '201', eventName: 'Tech Innovation Summit 2025 / 科技創新峰會 2025', status: 'confirmed', amount: '$10,000' },
      { id: '202', eventName: 'Blockchain Revolution Summit / 區塊鏈革命峰會', status: 'pending', amount: '$15,000' }
    ],
    analytics: {
      totalSponsored: 12,
      activeSponsorship: 3,
      totalInvestment: '$85,000',
      averageRoi: '145%'
    }
  }
};
*/ 