import { USER_ROLES } from '@/lib/types/users';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * 擴展 User 介面
   */
  interface User {
    role?: USER_ROLES;
  }

  /**
   * 擴展 Session 介面
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: USER_ROLES;
    }
  }
}

declare module 'next-auth/jwt' {
  /**
   * 擴展 JWT 介面
   */
  interface JWT {
    userId?: string;
    role?: USER_ROLES;
  }
} 