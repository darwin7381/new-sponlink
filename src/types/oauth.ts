export type OAuthProvider = 'google' | 'apple';

export interface SocialProfile {
  providerId: string;
  email: string;
  name: string;
  profileData: {
    picture?: string;
    locale?: string;
    given_name?: string;
    family_name?: string;
    is_private_email?: boolean;
  };
}

export interface SocialIdentity {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  profileData: SocialProfile['profileData'];
  linkedAt: string;
}

export interface SocialUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  socialIdentities: SocialIdentity[];
  createdAt: string;
  lastLogin: string;
}

export interface OAuthProviderConfig {
  name: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface SocialLoginResult {
  user: SocialUser;
  token: string;
} 