import { CartItem, Meeting } from '@/types/sponsor';

// Mock data for development
export const mockCartItems: CartItem[] = [];
export const mockMeetings: Meeting[] = [];

// Helper function to generate IDs
export const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

// Helper function to get current ISO string
export const getCurrentISOString = () => new Date().toISOString();