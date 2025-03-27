export type SocialProvider = 'google' | 'apple';

export enum UserRole {
  SPONSOR = 'sponsor',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface SocialProfile {
  id: string;
  email: string;
  name: string;
  provider: SocialProvider;
  providerId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileData?: any;
}

export interface OAuthConfig {
  clientId: string;
  authUrl: string;
  scope: string;
}

export interface OAuthConfigs {
  google: OAuthConfig;
  apple: OAuthConfig;
}

export interface SocialLoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    socialIdentities: {
      provider: SocialProvider;
      providerId?: string;
      email: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profileData?: any;
      linkedAt: string;
    }[];
    createdAt: string;
    lastLogin: string;
  };
  token: string;
}

export interface OAuthProviderConfig {
  name: string;
  icon: string;
  buttonColor: string;
  textColor: string;
} 