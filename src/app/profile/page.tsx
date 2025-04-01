"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/authService';
import { User, USER_ROLES, OrganizerProfile, SponsorProfile } from '@/lib/types/users';
import { getUserProfile } from '@/lib/services/userService';

interface EventItem {
  id: string;
  name: string;
  status: string;
  date: string;
}

interface SponsorshipItem {
  id: string;
  eventName: string;
  status: string;
  amount: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<OrganizerProfile | SponsorProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
        
        // Get user profile details
        const profile = await getUserProfile(
          currentUser.id, 
          currentUser.role.toLowerCase()
        );
        setProfileData(profile);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profileData) return null;

  const renderBasicProfile = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
          <p className="mt-1 text-sm text-muted-foreground">Update your profile and contact information</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <img 
              className="h-24 w-24 rounded-full" 
              src={profileData.avatar || "https://via.placeholder.com/96"} 
              alt="Profile avatar" 
            />
          </div>
          <div>
            <h4 className="text-md font-medium text-foreground">{user.email}</h4>
            <p className="text-sm text-muted-foreground">
              {user.role === USER_ROLES.ORGANIZER ? 'Event Organizer' : 'Sponsor'}
            </p>
            <p className="text-sm text-muted-foreground">
              Registered on: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-muted"
            />
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-foreground">
              Preferred Language
            </label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full rounded-md border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              defaultValue={user.preferred_language}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="mt-1 block w-full rounded-md border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              defaultValue={profileData.bio}
            />
          </div>
        </div>
        
        <div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const renderOrganizerDetails = () => {
    if (user.role !== USER_ROLES.ORGANIZER || !('events' in profileData)) return null;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Event Management</h3>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your events</p>
        </div>
        
        <div className="bg-card shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {profileData.events && profileData.events.length > 0 ? (
              profileData.events.map((event: EventItem) => (
                <li key={event.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary truncate">{event.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === 'upcoming' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-muted-foreground">
                          Date: {event.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-muted-foreground">
                No events created yet
              </li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-foreground mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Total Events</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.statistics?.totalEvents || 0}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Upcoming Events</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.statistics?.upcomingEvents || 0}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Average Attendees</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.statistics?.averageAttendees || 0}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Total Revenue</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.statistics?.totalRevenue || '$0'}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSponsorDetails = () => {
    if (user.role !== USER_ROLES.SPONSOR || !('sponsorships' in profileData)) return null;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Sponsorship Details</h3>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your sponsorships</p>
        </div>
        
        <div className="bg-card shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {profileData.sponsorships && profileData.sponsorships.length > 0 ? (
              profileData.sponsorships.map((sponsorship: SponsorshipItem) => (
                <li key={sponsorship.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary truncate">{sponsorship.eventName}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sponsorship.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {sponsorship.status === 'confirmed' ? 'Confirmed' : 'Processing'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-muted-foreground">
                          Sponsorship Amount: {sponsorship.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-muted-foreground">
                No sponsorships yet
              </li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-foreground mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Total Sponsorships</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.analytics?.totalSponsored || 0}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Active Sponsorships</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.analytics?.activeSponsorship || 0}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Total Investment</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.analytics?.totalInvestment || '$0'}</dd>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground truncate">Average ROI</dt>
                <dd className="mt-1 text-3xl font-semibold text-foreground">{profileData.analytics?.averageRoi || '0%'}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderBasicProfile();
      case 'details':
        if (user.role === USER_ROLES.ORGANIZER) {
          return renderOrganizerDetails();
        } else if (user.role === USER_ROLES.SPONSOR) {
          return renderSponsorDetails();
        }
        return (
          <div className="text-center p-8">
            <p>Profile details are not available for this user type.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-muted border-b border-border">
            <h1 className="text-xl font-bold text-foreground">My Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
          
          <div className="border-b border-border">
            <div className="px-4 sm:px-6">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {user.role === USER_ROLES.ORGANIZER ? 'Event Management' : 'Sponsorship Details'}
                </button>
              </nav>
            </div>
          </div>
          
          <div className="px-4 py-6 sm:px-6">
            {renderProfileContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 