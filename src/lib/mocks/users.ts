import { User } from '../types/users';

export const MOCK_USERS: User[] = [
  {
    id: "user_124",
    email: "sponsor@example.com",
    preferred_language: "zh",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "user_123",
    email: "organizer@example.com",
    preferred_language: "zh",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

// Mock profile data
export const mockProfiles = {
  sponsor: {
    userId: 'user_124',
    bio: '全球科技公司，支持創新活動',
    contactInfo: 'sponsor@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    updatedAt: '2023-06-20T14:45:00Z',
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
  },
  organizer: {
    userId: 'user_123',
    bio: '擁有超過10年經驗的活動組織者',
    contactInfo: 'organizer@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    updatedAt: '2023-05-15T10:30:00Z',
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
  }
}; 