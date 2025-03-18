import { OrganizerProfile, SponsorProfile } from '../types/users';
import { mockProfiles } from '../mocks/users';

// Simulated delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get user profile based on user ID or role
export const getUserProfile = async (userId: string, role: string): Promise<OrganizerProfile | SponsorProfile> => {
  await delay(800); // Simulate network delay
  
  let profile;
  
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
  role: string, 
  profileData: Partial<OrganizerProfile | SponsorProfile>
): Promise<OrganizerProfile | SponsorProfile> => {
  await delay(1000); // Simulate network delay
  
  let profile;
  
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
  
  // Update profile fields (in a real app, save to database)
  const updatedProfile = {
    ...profile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, save to database here
  // For mock, update our mockProfiles object
  if (role === 'organizer') {
    mockProfiles.organizer = updatedProfile as OrganizerProfile;
  } else if (role === 'sponsor') {
    mockProfiles.sponsor = updatedProfile as SponsorProfile;
  }
  
  return updatedProfile;
};

// Get organizer events
export const getOrganizerEvents = async (userId: string, status: string | null = null) => {
  await delay(600); // Simulate network delay
  
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
export const getSponsorships = async (userId: string, status: string | null = null) => {
  await delay(600); // Simulate network delay
  
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
export const getAnalytics = async (userId: string, role: string) => {
  await delay(700); // Simulate network delay
  
  if (role === 'organizer') {
    return mockProfiles.organizer.statistics;
  } else if (role === 'sponsor') {
    return mockProfiles.sponsor.analytics;
  }
  
  throw new Error('Invalid user role');
}; 