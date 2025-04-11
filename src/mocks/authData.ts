/**
 * 此文件已弃用 - 用户数据和认证已迁移至Neon数据库
 * 保留此文件仅作参考，实际项目中不应使用
 */

/*
import { User, UserRole } from '@/types/auth';

// Mock user data for development
export const mockUsers: (User & { password_hash: string })[] = [
  {
    id: "1",
    email: "sponsor@example.com",
    password_hash: "password123", // In reality, this would be hashed
    role: UserRole.SPONSOR,
    preferred_language: "en",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    email: "organizer@example.com",
    password_hash: "password123", // In reality, this would be hashed
    role: UserRole.ORGANIZER,
    preferred_language: "en",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];
*/

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 