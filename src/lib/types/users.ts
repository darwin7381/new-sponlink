export enum USER_ROLES {
  SPONSOR = 'SPONSOR',
  ORGANIZER = 'ORGANIZER'
}

export enum RESOURCE_TYPE {
  EVENT = 'EVENT',
  SPONSORSHIP = 'SPONSORSHIP',
  MEETING = 'MEETING',
  ORGANIZATION = 'ORGANIZATION'
}

export enum PERMISSION {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE'
}

export enum DYNAMIC_ROLE {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  COLLABORATOR = 'COLLABORATOR'
}

export interface User {
  id: string;
  email: string;
  role: USER_ROLES;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedUser extends User {
  organizations?: UserOrganization[];
}

export interface UserOrganization {
  organization_id: string;
  role: DYNAMIC_ROLE;
  joined_at: string;
}

export interface ResourcePermission {
  resource_type: RESOURCE_TYPE;
  resource_id: string;
  permissions: PERMISSION[];
}

export interface OrganizerProfile {
  userId: string;
  bio: string;
  contactInfo: string;
  avatar: string;
  updatedAt: string;
  events: {
    id: string;
    name: string;
    status: string;
    date: string;
  }[];
  statistics: {
    totalEvents: number;
    upcomingEvents: number;
    averageAttendees: number;
    totalRevenue: string;
  };
}

export interface SponsorProfile {
  userId: string;
  bio: string;
  contactInfo: string;
  avatar: string;
  updatedAt: string;
  companyName: string;
  logo: string;
  description: string;
  sponsorships: {
    id: string;
    eventName: string;
    status: string;
    amount: string;
  }[];
  analytics: {
    totalSponsored: number;
    activeSponsorship: number;
    totalInvestment: string;
    averageRoi: string;
  };
}

export enum CART_ITEM_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface CartItem {
  id: string;
  sponsor_id: string;
  sponsorship_plan_id: string;
  status: CART_ITEM_STATUS;
  created_at: string;
  updated_at: string;
}

export enum MEETING_STATUS {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface Meeting {
  id: string;
  sponsor_id: string;
  organizer_id: string;
  event_id: string;
  title: string;
  description: string;
  proposed_times: string[];
  confirmed_time: string | null;
  timezone?: string;
  status: MEETING_STATUS;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
} 