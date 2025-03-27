import { SocialProvider, SocialProfile, OAuthConfig, SocialLoginResult, OAuthProviderConfig } from '@/types/auth';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// OAuth 配置
const OAUTH_CONFIG: Record<SocialProvider, OAuthConfig> = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'email profile',
  },
  apple: {
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    scope: 'email name',
  },
};

// OAuth 提供者UI配置
const oauthProviderConfigs: Record<SocialProvider, OAuthProviderConfig> = {
  google: {
    name: 'Google',
    icon: 'google',
    buttonColor: '#4285F4',
    textColor: '#ffffff'
  },
  apple: {
    name: 'Apple',
    icon: 'apple',
    buttonColor: '#000000',
    textColor: '#ffffff'
  }
};

/**
 * 獲取 OAuth URL
 * @param provider - 社交登入提供者
 * @param redirectUrl - 回調 URL
 * @returns OAuth URL
 */
export const getOAuthUrl = (provider: SocialProvider, redirectUrl: string): string => {
  const config = OAUTH_CONFIG[provider];
  
  if (!config.clientId) {
    throw new Error(`${provider} client ID is not configured`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUrl,
    response_type: 'code',
    scope: config.scope,
  });

  return `${config.authUrl}?${params.toString()}`;
};

/**
 * 處理 OAuth 回調
 * @param provider - 社交登入提供者
 * @param code - 授權碼
 * @returns 用戶資料
 */
export const handleOAuthCallback = async (provider: SocialProvider, code: string): Promise<SocialProfile> => {
  // 開發環境模擬
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'mock_social_user_id',
      email: 'social@example.com',
      name: 'Social User',
      provider,
    };
  }

  // 實際環境：向後端 API 發送請求
  const response = await fetch('/api/auth/oauth/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider, code }),
  });

  if (!response.ok) {
    throw new Error('OAuth callback failed');
  }

  return response.json();
};

// Social login
export const socialLogin = async (provider: SocialProvider, code: string): Promise<SocialLoginResult> => {
  try {
    await delay(1000); // Simulate network delay
    
    // Get user profile from OAuth provider (simulated)
    const socialProfile = await handleOAuthCallback(provider, code);
    
    // Create a new user with social identity
    const user = {
      id: `social-${Date.now()}`,
      email: socialProfile.email,
      name: socialProfile.name,
      role: 'user', // Default role
      emailVerified: true, // Social logins are pre-verified
      socialIdentities: [{
        provider,
        providerId: socialProfile.providerId,
        email: socialProfile.email,
        profileData: socialProfile.profileData,
        linkedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    return {
      user,
      token: `mock-social-auth-token-${user.id}-${Date.now()}`
    };
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    throw new Error(`Failed to authenticate with ${provider}`);
  }
};

// Get OAuth provider configuration
export const getOAuthProviderConfig = (provider: SocialProvider): OAuthProviderConfig | null => {
  return oauthProviderConfigs[provider] || null;
}; 