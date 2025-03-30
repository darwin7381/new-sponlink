import { CartItem, CartItemStatus, Meeting } from '@/types/sponsor';

// Mock data for development
export const mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-1",
    status: CartItemStatus.PENDING,
    created_at: "2024-06-01T10:30:00Z",
    updated_at: "2024-06-01T10:30:00Z"
  },
  {
    id: "cart-2",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-2",
    status: CartItemStatus.PENDING,
    created_at: "2024-06-02T14:45:00Z",
    updated_at: "2024-06-02T14:45:00Z"
  },
  {
    id: "cart-3",
    sponsor_id: "2",
    sponsorship_plan_id: "plan-3",
    status: CartItemStatus.PENDING,
    created_at: "2024-06-03T09:15:00Z",
    updated_at: "2024-06-03T09:15:00Z"
  },
  {
    id: "cart-4",
    sponsor_id: "3",
    sponsorship_plan_id: "plan-4",
    status: CartItemStatus.CONFIRMED,
    created_at: "2024-06-04T11:20:00Z",
    updated_at: "2024-06-05T16:30:00Z"
  },
  {
    id: "cart-5",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-5",
    status: CartItemStatus.CONFIRMED,
    created_at: "2024-05-20T13:40:00Z",
    updated_at: "2024-05-21T10:15:00Z"
  }
];
export const mockMeetings: Meeting[] = [];

// Helper function to generate IDs
export const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

// Helper function to get current ISO string
export const getCurrentISOString = () => new Date().toISOString();