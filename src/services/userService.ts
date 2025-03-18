import { UserRole, UserProfile, OrganizerProfile, SponsorProfile, OrganizerEvent, Sponsorship, OrganizerStatistics, SponsorAnalytics } from '@/types/user';
import { mockProfiles } from '@/mocks/userData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get user profile based on user ID or role
export const getUserProfile = async (userId: string, role: UserRole): Promise<UserProfile> => {
  await delay(800);
  
  let profile: UserProfile;
  
  if (role === 'organizer') {
    profile = mockProfiles.organizer;
  } else if (role === 'sponsor') {
    profile = mockProfiles.sponsor;
  } else {
    throw new Error('Invalid user role');
  }
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  return profile;
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  role: UserRole,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  await delay(1000);
  
  let profile: UserProfile;
  
  if (role === 'organizer') {
    profile = mockProfiles.organizer;
  } else if (role === 'sponsor') {
    profile = mockProfiles.sponsor;
  } else {
    throw new Error('Invalid user role');
  }
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Update profile fields
  const updatedProfile = {
    ...profile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  // Update mock data
  if (role === 'organizer') {
    mockProfiles.organizer = updatedProfile as OrganizerProfile;
  } else if (role === 'sponsor') {
    mockProfiles.sponsor = updatedProfile as SponsorProfile;
  }
  
  return updatedProfile;
};

// Get organizer events
export const getOrganizerEvents = async (userId: string, status?: 'upcoming' | 'completed'): Promise<OrganizerEvent[]> => {
  await delay(600);
  
  const profile = mockProfiles.organizer;
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  if (status) {
    return profile.events.filter(event => event.status === status);
  }
  
  return profile.events;
};

// Get sponsor sponsorships
export const getSponsorships = async (userId: string, status?: 'confirmed' | 'pending'): Promise<Sponsorship[]> => {
  await delay(600);
  
  const profile = mockProfiles.sponsor;
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  if (status) {
    return profile.sponsorships.filter(sponsorship => sponsorship.status === status);
  }
  
  return profile.sponsorships;
};

// Get analytics data
export const getAnalytics = async (userId: string, role: UserRole): Promise<OrganizerStatistics | SponsorAnalytics> => {
  await delay(700);
  
  if (role === 'organizer') {
    return mockProfiles.organizer.statistics;
  } else if (role === 'sponsor') {
    return mockProfiles.sponsor.analytics;
  }
  
  throw new Error('Invalid user role');
}; 