import { OAuthProvider, SocialProfile, OAuthProviderConfig } from '@/types/oauth';

// Mock social profiles
export const mockSocialProfiles: Record<OAuthProvider, SocialProfile> = {
  google: {
    providerId: 'google-12345',
    email: 'user@gmail.com',
    name: 'Google User',
    profileData: {
      picture: 'https://lh3.googleusercontent.com/mock-image',
      locale: 'en',
      given_name: 'Google',
      family_name: 'User'
    }
  },
  apple: {
    providerId: 'apple-67890',
    email: 'user@icloud.com',
    name: 'Apple User',
    profileData: {
      is_private_email: true
    }
  }
};

// OAuth provider configurations
export const oauthProviderConfigs: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    name: 'Google',
    icon: 'google',
    backgroundColor: '#fff',
    textColor: '#757575',
    borderColor: '#ddd'
  },
  apple: {
    name: 'Apple',
    icon: 'apple',
    backgroundColor: '#000',
    textColor: '#fff',
    borderColor: '#000'
  }
}; 