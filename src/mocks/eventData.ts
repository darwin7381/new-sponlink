import { Event, EventStatus } from '@/types/event';

export const mockEvents: Event[] = [
  {
    id: "1",
    organizer_id: "2",
    title: "Tech Innovation Summit 2025",
    description: "An annual gathering of global technology leaders and innovators to explore the latest technology trends and future development directions.",
    cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-06-15T09:00:00Z",
    end_time: "2025-06-17T18:00:00Z",
    location: {
      id: "loc1",
      name: "San Francisco Convention Center",
      address: "123 Tech Blvd",
      city: "San Francisco",
      country: "USA",
      postal_code: "94101",
      latitude: 37.7749,
      longitude: -122.4194
    },
    status: EventStatus.PUBLISHED,
    category: "Technology",
    tags: ["Technology", "Innovation", "AI", "Blockchain"],
    sponsorship_plans: [
      {
        id: "sp1",
        event_id: "1",
        title: "Diamond Sponsor",
        description: "The highest level of sponsorship, providing maximum brand exposure and exclusive benefits.",
        price: 100000,
        benefits: ["Main stage speaking opportunity", "VIP dinner seats", "Brand prominently displayed in all promotional materials", "Best position in exhibition area"],
        max_sponsors: 3,
        current_sponsors: 1,
        created_at: "2023-01-15T08:00:00Z",
        updated_at: "2023-01-15T08:00:00Z"
      },
      {
        id: "sp2",
        event_id: "1",
        title: "Gold Sponsor",
        description: "Provides quality brand exposure and multiple benefits.",
        price: 50000,
        benefits: ["Breakout session speaking opportunity", "Exhibition booth", "Brand displayed in promotional materials"],
        max_sponsors: 5,
        current_sponsors: 3,
        created_at: "2023-01-15T08:30:00Z",
        updated_at: "2023-01-15T08:30:00Z"
      }
    ],
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-02-20T14:30:00Z"
  },
  {
    id: "2",
    organizer_id: "2",
    title: "Sustainable Development Forum",
    description: "An international forum discussing environmental protection, social responsibility, and sustainable economic development.",
    cover_image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-08-10T09:00:00Z",
    end_time: "2025-08-12T17:00:00Z",
    location: {
      id: "loc2",
      name: "Seattle Convention Center",
      address: "705 Pike St",
      city: "Seattle",
      country: "USA",
      postal_code: "98101",
      latitude: 47.6114,
      longitude: -122.3322
    },
    status: EventStatus.DRAFT,
    category: "Environment",
    tags: ["Sustainable Development", "Environmental Protection", "Social Responsibility", "Green Energy"],
    sponsorship_plans: [
      {
        id: "sp3",
        event_id: "2",
        title: "Main Sponsor",
        description: "Become the main sponsor of the forum, gaining maximum brand exposure.",
        price: 80000,
        benefits: ["Opening remarks", "Panel discussion participation", "Brand displayed in all promotional materials", "Premium position in exhibition area"],
        max_sponsors: 2,
        current_sponsors: 0,
        created_at: "2023-03-05T09:15:00Z",
        updated_at: "2023-03-05T09:15:00Z"
      }
    ],
    created_at: "2025-03-01T11:20:00Z",
    updated_at: "2025-03-10T16:45:00Z"
  },
  {
    id: "3",
    organizer_id: "2",
    title: "Global Marketing Conference",
    description: "A professional conference focused on the latest digital marketing trends, strategies, and tools.",
    cover_image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-07-22T09:30:00Z",
    end_time: "2025-07-24T17:30:00Z",
    location: {
      id: "loc3",
      name: "New York Marriott Marquis",
      address: "1535 Broadway",
      city: "New York",
      country: "USA",
      postal_code: "10036",
      latitude: 40.7589,
      longitude: -73.9851
    },
    status: EventStatus.PUBLISHED,
    category: "Marketing",
    tags: ["Digital Marketing", "Social Media", "Content Strategy", "SEO"],
    sponsorship_plans: [
      {
        id: "sp4",
        event_id: "3",
        title: "Platinum Sponsor",
        description: "Premium sponsorship package offering quality brand exposure and multiple benefits.",
        price: 60000,
        benefits: ["Keynote presentation", "Workshop hosting", "Brand prominently displayed in promotional materials", "Exhibition booth"],
        max_sponsors: 4,
        current_sponsors: 2,
        created_at: "2023-05-12T10:30:00Z",
        updated_at: "2023-05-12T10:30:00Z"
      },
      {
        id: "sp5",
        event_id: "3",
        title: "Silver Sponsor",
        description: "Mid-level sponsorship package providing good brand exposure.",
        price: 30000,
        benefits: ["Exhibition booth", "Brand displayed in promotional materials", "Listed in sponsor list"],
        max_sponsors: 8,
        current_sponsors: 5,
        created_at: "2023-05-12T11:00:00Z",
        updated_at: "2023-05-12T11:00:00Z"
      },
      {
        id: "sp6",
        event_id: "3",
        title: "Bronze Sponsor",
        description: "Entry-level sponsorship package suitable for small businesses and startups.",
        price: 15000,
        benefits: ["Brand displayed in promotional materials", "Listed in sponsor list"],
        max_sponsors: 12,
        current_sponsors: 8,
        created_at: "2023-05-12T11:30:00Z",
        updated_at: "2023-05-12T11:30:00Z"
      }
    ],
    created_at: "2025-05-01T09:00:00Z",
    updated_at: "2025-05-15T14:20:00Z"
  },
  {
    id: "4",
    organizer_id: "2",
    title: "亞洲藝術博覽會2025",
    description: "一年一度的亞洲藝術盛會，展示來自亞洲各地的當代藝術、傳統工藝和文化創新。",
    cover_image: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-04-12T10:00:00Z",
    end_time: "2025-04-18T18:00:00Z",
    location: {
      id: "loc4",
      name: "台北南港展覽館",
      address: "台北市南港區經貿二路1號",
      city: "台北",
      country: "台灣",
      postal_code: "11562",
      latitude: 25.0550,
      longitude: 121.6170
    },
    status: EventStatus.PUBLISHED,
    category: "Art",
    tags: ["藝術", "文化", "展覽", "亞洲藝術"],
    sponsorship_plans: [
      {
        id: "sp7",
        event_id: "4",
        title: "鑽石贊助商",
        description: "最高級別的贊助方案，提供最大的品牌曝光和專屬權益。",
        price: 500000,
        benefits: ["開幕式貴賓席位", "專屬藝術品預展", "品牌在所有宣傳材料中突出顯示", "特別收藏家晚宴邀請"],
        max_sponsors: 2,
        current_sponsors: 1,
        created_at: "2024-09-15T08:00:00Z",
        updated_at: "2024-09-15T08:00:00Z"
      },
      {
        id: "sp8",
        event_id: "4",
        title: "藝術支持者",
        description: "中級贊助方案，適合希望在藝術領域提升品牌形象的企業。",
        price: 200000,
        benefits: ["品牌在主要宣傳材料中展示", "VIP預展入場券", "藝術家見面會邀請"],
        max_sponsors: 6,
        current_sponsors: 3,
        created_at: "2024-09-15T09:30:00Z",
        updated_at: "2024-09-15T09:30:00Z"
      }
    ],
    created_at: "2024-08-20T11:30:00Z",
    updated_at: "2024-08-30T16:45:00Z"
  },
  {
    id: "5",
    organizer_id: "3",
    title: "Blockchain Revolution Summit",
    description: "The premier global conference exploring the future of blockchain technology and its impact on industries worldwide.",
    cover_image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-09-05T09:00:00Z",
    end_time: "2025-09-07T18:00:00Z",
    location: {
      id: "loc5",
      name: "Singapore Expo",
      address: "1 Expo Drive",
      city: "Singapore",
      country: "Singapore",
      postal_code: "486150",
      latitude: 1.3350,
      longitude: 103.9590
    },
    status: EventStatus.PUBLISHED,
    category: "Technology",
    tags: ["Blockchain", "Cryptocurrency", "Web3", "DeFi"],
    sponsorship_plans: [
      {
        id: "sp9",
        event_id: "5",
        title: "Whale Sponsor",
        description: "Premier sponsorship tier with maximum visibility and exclusive networking opportunities.",
        price: 120000,
        benefits: ["Keynote speaking slot", "Private meeting room", "Exclusive dinner with top investors", "Premium booth location"],
        max_sponsors: 3,
        current_sponsors: 2,
        created_at: "2024-05-10T10:00:00Z",
        updated_at: "2024-05-10T10:00:00Z"
      },
      {
        id: "sp10",
        event_id: "5",
        title: "Builder Sponsor",
        description: "Ideal for companies looking to showcase their blockchain solutions.",
        price: 70000,
        benefits: ["Panel participation", "Demo stage slot", "Branded lounge area", "Developer workshop opportunity"],
        max_sponsors: 5,
        current_sponsors: 3,
        created_at: "2024-05-10T11:15:00Z",
        updated_at: "2024-05-10T11:15:00Z"
      },
      {
        id: "sp11",
        event_id: "5",
        title: "Ecosystem Sponsor",
        description: "Supporting sponsorship level for emerging blockchain projects.",
        price: 30000,
        benefits: ["Exhibition space", "Logo inclusion in all materials", "Social media promotion"],
        max_sponsors: 10,
        current_sponsors: 5,
        created_at: "2024-05-10T12:30:00Z",
        updated_at: "2024-05-10T12:30:00Z"
      }
    ],
    created_at: "2024-04-15T14:20:00Z",
    updated_at: "2024-04-28T09:15:00Z"
  },
  {
    id: "6",
    organizer_id: "1",
    title: "Global Education Innovation Forum",
    description: "A forward-thinking conference bringing together educators, policymakers, and EdTech innovators to reshape the future of education.",
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-11-18T08:30:00Z",
    end_time: "2025-11-20T17:00:00Z",
    location: {
      id: "loc6",
      name: "Helsinki Exhibition & Convention Centre",
      address: "Messuaukio 1",
      city: "Helsinki",
      country: "Finland",
      postal_code: "00520",
      latitude: 60.2032,
      longitude: 24.9379
    },
    status: EventStatus.PUBLISHED,
    category: "Education",
    tags: ["Education", "EdTech", "Innovation", "Digital Learning"],
    sponsorship_plans: [
      {
        id: "sp12",
        event_id: "6",
        title: "Visionary Partner",
        description: "Lead sponsorship for organizations committed to educational transformation.",
        price: 85000,
        benefits: ["Opening address opportunity", "Thought leadership roundtable", "Private meetings with education ministers", "Premium exhibition space"],
        max_sponsors: 2,
        current_sponsors: 1,
        created_at: "2024-07-05T09:00:00Z",
        updated_at: "2024-07-05T09:00:00Z"
      },
      {
        id: "sp13",
        event_id: "6",
        title: "Education Innovator",
        description: "For organizations showcasing educational solutions and technologies.",
        price: 45000,
        benefits: ["Innovation showcase presentation", "Workshop session", "Demonstration area", "Digital content feature"],
        max_sponsors: 6,
        current_sponsors: 4,
        created_at: "2024-07-05T10:15:00Z",
        updated_at: "2024-07-05T10:15:00Z"
      },
      {
        id: "sp14",
        event_id: "6",
        title: "Learning Supporter",
        description: "Supporting sponsorship level ideal for education-focused organizations.",
        price: 25000,
        benefits: ["Exhibition booth", "Brand inclusion in conference materials", "Digital presence on event platform"],
        max_sponsors: 10,
        current_sponsors: 7,
        created_at: "2024-07-05T11:30:00Z",
        updated_at: "2024-07-05T11:30:00Z"
      }
    ],
    created_at: "2024-06-10T13:15:00Z",
    updated_at: "2024-06-25T16:20:00Z"
  }
]; 