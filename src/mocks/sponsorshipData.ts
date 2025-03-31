import { SponsorshipPlan, OWNER_TYPE } from '@/types/event';

export const mockSponsorshipPlans: SponsorshipPlan[] = [
  {
    id: 'plan-1',
    event_id: '1',
    ownerId: '2',
    ownerType: OWNER_TYPE.USER,
    title: '黃金贊助 / Gold Sponsorship',
    description: '獲得最高曝光度和品牌展示機會 / Get maximum exposure and brand display opportunities',
    price: 50000,
    benefits: [
      '主舞台演講機會 / Main stage speaking opportunity', 
      'VIP晚宴座位 / VIP dinner seats', 
      '品牌在所有宣傳材料中突出顯示 / Brand prominently displayed in all promotional materials'
    ],
    max_sponsors: 3,
    current_sponsors: 1,
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z'
  },
  {
    id: 'plan-2',
    event_id: '1',
    ownerId: '2',
    ownerType: OWNER_TYPE.USER,
    title: '銀牌贊助 / Silver Sponsorship',
    description: '為中型企業提供的優質贊助方案 / Quality sponsorship package for medium-sized businesses',
    price: 30000,
    benefits: [
      '專屬展示區 / Dedicated exhibition area', 
      '品牌在宣傳材料中展示 / Brand displayed in promotional materials'
    ],
    max_sponsors: 5,
    current_sponsors: 3,
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z'
  },
  {
    id: 'plan-3',
    event_id: '2',
    ownerId: '3',
    ownerType: OWNER_TYPE.USER,
    title: '主要合作夥伴 / Main Partner',
    description: '成為論壇的主要贊助商，獲得最大品牌曝光 / Become the main sponsor of the forum, gaining maximum brand exposure',
    price: 80000,
    benefits: [
      '開幕致辭 / Opening remarks', 
      '專家討論參與 / Panel discussion participation', 
      '品牌在所有宣傳材料中顯示 / Brand displayed in all promotional materials',
      '展覽區優質位置 / Premium position in exhibition area'
    ],
    max_sponsors: 2,
    current_sponsors: 0,
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-05T10:00:00Z'
  },
  {
    id: 'plan-4',
    event_id: '3',
    ownerId: '4',
    ownerType: OWNER_TYPE.USER,
    title: '白金贊助 / Platinum Sponsorship',
    description: '高級贊助方案，提供優質品牌曝光和多項福利 / Premium sponsorship package offering quality brand exposure and multiple benefits',
    price: 60000,
    benefits: [
      '主題演講 / Keynote presentation', 
      '工作坊主持 / Workshop hosting', 
      '品牌在宣傳材料中突出顯示 / Brand prominently displayed in promotional materials',
      '展覽攤位 / Exhibition booth'
    ],
    max_sponsors: 4,
    current_sponsors: 2,
    created_at: '2024-05-12T11:00:00Z',
    updated_at: '2024-05-12T11:00:00Z'
  },
  {
    id: 'plan-5',
    event_id: '3',
    ownerId: '4',
    ownerType: OWNER_TYPE.USER,
    title: '銅牌贊助 / Bronze Sponsorship',
    description: '初級贊助方案，適合小型企業和初創公司 / Entry-level sponsorship package suitable for small businesses and startups',
    price: 15000,
    benefits: [
      '品牌在宣傳材料中展示 / Brand displayed in promotional materials', 
      '列入贊助商名單 / Listed in sponsor list'
    ],
    max_sponsors: 12,
    current_sponsors: 8,
    created_at: '2024-05-12T12:00:00Z',
    updated_at: '2024-05-12T12:00:00Z'
  },
  {
    id: 'plan-6',
    event_id: '2',
    ownerId: '3',
    ownerType: OWNER_TYPE.USER,
    title: '創新贊助 / Innovation Sponsorship',
    description: '專為科技與創新企業設計的贊助方案 / Sponsorship package designed for tech and innovation companies',
    price: 45000,
    benefits: [
      '創新展示區 / Innovation showcase area',
      '產品演示機會 / Product demonstration opportunity',
      '與參與者的互動環節 / Interactive session with attendees',
      '品牌在活動網站上展示 / Brand displayed on event website'
    ],
    max_sponsors: 4,
    current_sponsors: 2,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z'
  },
  {
    id: 'sp1',
    event_id: '1',
    ownerId: '2',
    ownerType: OWNER_TYPE.USER,
    title: '特別贊助套餐 1 / Special Package 1',
    description: '針對活動特別設計的贊助方案 / Special sponsorship package designed for the event',
    price: 25000,
    benefits: [
      '專屬展示區 / Dedicated exhibition area',
      '品牌標誌在舞台背景 / Logo on stage backdrop',
      '社交媒體宣傳 / Social media promotion'
    ],
    max_sponsors: 5,
    current_sponsors: 0,
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2024-06-01T08:00:00Z'
  },
  {
    id: 'sp2',
    event_id: '1',
    ownerId: '2',
    ownerType: OWNER_TYPE.USER,
    title: '特別贊助套餐 2 / Special Package 2',
    description: '中小型企業推廣方案 / Promotion package for SMEs',
    price: 18000,
    benefits: [
      '活動手冊廣告 / Ad in event brochure',
      '列入贊助商名單 / Listed in sponsor directory',
      '活動後資料庫分享 / Post-event database sharing'
    ],
    max_sponsors: 8,
    current_sponsors: 1,
    created_at: '2024-06-01T09:00:00Z',
    updated_at: '2024-06-01T09:00:00Z'
  },
  {
    id: 'sp8-1',
    event_id: '3',
    ownerId: '4',
    ownerType: OWNER_TYPE.USER,
    title: '特別贊助計劃 8-1 / Special Package 8-1',
    description: '針對短期活動的特別贊助方案 / Special sponsorship package for short-term events',
    price: 22000,
    benefits: [
      '活動專屬廣告位 / Exclusive ad space at the event',
      '產品展示機會 / Product display opportunity',
      '與參與者互動機會 / Opportunity to interact with attendees'
    ],
    max_sponsors: 3,
    current_sponsors: 0,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z'
  }
]; 