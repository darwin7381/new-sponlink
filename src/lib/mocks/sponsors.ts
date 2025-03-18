import { CartItem, CART_ITEM_STATUS } from '../types/users';
import { MOCK_MEETINGS } from './meetings';

// Mock cart items for development
export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    sponsor_id: '1',
    sponsorship_plan_id: 'plan-1',
    status: CART_ITEM_STATUS.CONFIRMED,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:30:00Z'
  },
  {
    id: 'cart-2',
    sponsor_id: '1',
    sponsorship_plan_id: 'plan-2',
    status: CART_ITEM_STATUS.CONFIRMED,
    created_at: '2024-03-02T14:00:00Z',
    updated_at: '2024-03-02T14:30:00Z'
  },
  {
    id: 'cart-3',
    sponsor_id: '1',
    sponsorship_plan_id: 'plan-6',
    status: CART_ITEM_STATUS.CONFIRMED,
    created_at: '2024-03-05T09:00:00Z',
    updated_at: '2024-03-05T09:30:00Z'
  }
];

// Re-export meetings from meetings.ts
export { MOCK_MEETINGS }; 