import { OrganizerProfile, SponsorProfile } from '@/types/user';

// Mock profile data
export const mockProfiles: {
  organizer: OrganizerProfile;
  sponsor: SponsorProfile;
} = {
  organizer: {
    userId: '1',
    bio: 'Experienced event organizer with over 10 years of experience',
    contactInfo: 'organizer@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    updatedAt: '2023-05-15T10:30:00Z',
    events: [
      { id: '101', name: 'Tech Conference 2023', status: 'upcoming', date: '2023-12-15' },
      { id: '102', name: 'Digital Marketing Summit', status: 'completed', date: '2023-04-10' }
    ],
    statistics: {
      totalEvents: 15,
      upcomingEvents: 3,
      averageAttendees: 250,
      totalRevenue: '$75,000'
    }
  },
  sponsor: {
    userId: '2',
    bio: 'Global technology company supporting innovative events',
    contactInfo: 'sponsor@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    updatedAt: '2023-06-20T14:45:00Z',
    companyName: 'TechGlobal Inc.',
    logo: 'https://via.placeholder.com/150x50?text=TechGlobal',
    description: 'Leading provider of technology solutions for events and conferences',
    sponsorships: [
      { id: '201', eventName: 'Tech Conference 2023', status: 'confirmed', amount: '$10,000' },
      { id: '202', eventName: 'Digital Innovation Forum', status: 'pending', amount: '$5,000' }
    ],
    analytics: {
      totalSponsored: 12,
      activeSponsorship: 3,
      totalInvestment: '$85,000',
      averageRoi: '145%'
    }
  }
}; 