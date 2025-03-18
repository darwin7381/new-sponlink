export interface SponsorshipPlan {
  id: string;
  event_id: string;
  title: string;
  description: string;
  price: number;
  benefits: string[];
  max_sponsors: number;
  current_sponsors: number;
  created_at: string;
  updated_at: string;
}

export const MOCK_SPONSORSHIP_PLANS: SponsorshipPlan[] = [
  {
    id: 'plan-1',
    event_id: 'event-1',
    title: '黃金贊助',
    description: '獲得最高曝光度和品牌展示機會',
    price: 50000,
    benefits: [
      '活動主舞台品牌展示',
      '專屬展示攤位（3x3m）',
      '活動手冊全頁廣告',
      '官網首頁logo展示',
      '5張VIP入場券'
    ],
    max_sponsors: 3,
    current_sponsors: 1,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-01T08:00:00Z'
  },
  {
    id: 'plan-2',
    event_id: 'event-1',
    title: '白銀贊助',
    description: '獲得優質的品牌曝光和展示機會',
    price: 30000,
    benefits: [
      '次舞台品牌展示',
      '標準展示攤位（2x2m）',
      '活動手冊半頁廣告',
      '官網贊助商頁面logo展示',
      '3張VIP入場券'
    ],
    max_sponsors: 5,
    current_sponsors: 2,
    created_at: '2024-02-01T08:30:00Z',
    updated_at: '2024-02-01T08:30:00Z'
  },
  {
    id: 'plan-3',
    event_id: 'event-1',
    title: '青銅贊助',
    description: '基本品牌展示和參與機會',
    price: 15000,
    benefits: [
      '活動手冊品牌logo展示',
      '小型展示攤位（1x1m）',
      '官網贊助商頁面品牌名稱列出',
      '2張一般入場券'
    ],
    max_sponsors: 10,
    current_sponsors: 4,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  },
  {
    id: 'plan-4',
    event_id: 'event-2',
    title: '鑽石贊助',
    description: '獨家最高級別贊助方案，獲得最大品牌曝光',
    price: 100000,
    benefits: [
      '獨家冠名權（活動名稱前綴）',
      '主舞台獨家品牌展示',
      '特大型展示攤位（5x5m）',
      '活動手冊封面logo展示',
      '官網首頁大型banner展示',
      '10張VIP入場券',
      '專屬媒體採訪機會'
    ],
    max_sponsors: 1,
    current_sponsors: 0,
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z'
  },
  {
    id: 'plan-5',
    event_id: 'event-2',
    title: '白金贊助',
    description: '高級別贊助方案，獲得優質品牌曝光',
    price: 80000,
    benefits: [
      '主舞台品牌展示',
      '大型展示攤位（4x4m）',
      '活動手冊內頁全頁廣告',
      '官網首頁logo展示',
      '8張VIP入場券',
      '贊助商專訪發布'
    ],
    max_sponsors: 2,
    current_sponsors: 1,
    created_at: '2024-02-10T10:30:00Z',
    updated_at: '2024-02-10T10:30:00Z'
  },
  {
    id: 'plan-6',
    event_id: 'event-3',
    title: '主要贊助商',
    description: '成為活動主要贊助商，獲得全方位品牌曝光',
    price: 60000,
    benefits: [
      '活動主視覺品牌展示',
      '大型展示攤位（3x4m）',
      '活動手冊全頁廣告',
      '官網首頁logo展示',
      '6張VIP入場券',
      '專屬社群媒體宣傳'
    ],
    max_sponsors: 3,
    current_sponsors: 2,
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-15T09:00:00Z'
  }
]; 