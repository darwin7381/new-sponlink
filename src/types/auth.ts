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