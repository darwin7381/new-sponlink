import { Event, EventStatus, LocationType } from '@/types/event';

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
      longitude: -122.4194,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJIQBpAG2ahYARs7b1SSjMiKY",
      location_type: LocationType.GOOGLE
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
      longitude: -122.3322,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJ7WXdSM1BkFQRJrU2AJVaHp0",
      location_type: LocationType.GOOGLE
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
      longitude: -73.9851,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJmQJIxlVYwokRLgeuocVOGVU",
      location_type: LocationType.GOOGLE
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
    title: "AI & Healthcare Expo 2025",
    description: "探索人工智能如何徹底改變醫療保健行業的前沿會議。與領先的醫療科技公司、AI專家和醫療專業人士一起了解最新的研究和應用。",
    cover_image: "https://images.unsplash.com/photo-1587854680352-936b22b91030?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-09-12T08:30:00Z",
    end_time: "2025-09-14T17:00:00Z",
    location: {
      id: "loc4",
      name: "台北國際會議中心",
      address: "台北市信義區信義路五段1號",
      city: "台北",
      country: "台灣",
      postal_code: "11049",
      latitude: 25.0330,
      longitude: 121.5654,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJSSL1Z0mpQjQRhZ9Zs0do7j8",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Healthcare & Technology",
    tags: ["人工智能", "醫療科技", "醫療保健", "創新", "數位健康"],
    sponsorship_plans: [
      {
        id: "sp401",
        event_id: "4",
        title: "主題贊助",
        description: "成為AI醫療博覽會的主題贊助商，獲得最大的曝光度和品牌展示機會",
        price: 75000,
        benefits: [
          "主題演講機會",
          "展示區的優質位置",
          "獨家工作坊",
          "VIP晚宴席位",
          "品牌在所有宣傳材料中突出顯示"
        ],
        max_sponsors: 2,
        current_sponsors: 0,
        created_at: "2024-06-01T08:00:00Z",
        updated_at: "2024-06-01T08:00:00Z"
      },
      {
        id: "sp402",
        event_id: "4",
        title: "創新夥伴",
        description: "展示您的醫療技術創新並與業內專業人士建立聯繫",
        price: 45000,
        benefits: [
          "產品演示區",
          "面板討論參與",
          "在活動網站和應用程序中顯示品牌",
          "與會者聯絡信息訪問"
        ],
        max_sponsors: 5,
        current_sponsors: 2,
        created_at: "2024-06-01T08:30:00Z",
        updated_at: "2024-06-01T08:30:00Z"
      }
    ],
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-10T00:00:00Z"
  },
  {
    id: "5",
    organizer_id: "1",
    title: "全球永續發展論壇 2025",
    description: "聚集世界各地的環保領袖、政策制定者和企業家，討論永續發展策略和氣候行動計畫，共同打造更綠色的未來。",
    cover_image: "https://images.unsplash.com/photo-1553152531-b98a2fc8d3bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-05-20T09:00:00Z",
    end_time: "2025-05-22T18:00:00Z",
    location: {
      id: "loc5",
      name: "北京國家會議中心",
      address: "北京市朝陽區天辰東路7號",
      city: "北京",
      country: "中國",
      postal_code: "100101",
      latitude: 40.0071,
      longitude: 116.3876,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJLV2lxqhS8DURGNzqJg5SkSA",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Sustainability",
    tags: ["永續發展", "環保", "氣候變化", "綠色經濟", "企業社會責任"],
    sponsorship_plans: [
      {
        id: "sp501",
        event_id: "5",
        title: "綠色先鋒",
        description: "以環保領導者身份支持論壇，展示您公司的永續發展理念和成就",
        price: 60000,
        benefits: [
          "主題演講機會",
          "專題研討會主辦",
          "品牌在所有宣傳資料中顯示",
          "VIP晚宴座位",
          "獨家媒體採訪機會"
        ],
        max_sponsors: 3,
        current_sponsors: 1,
        created_at: "2024-05-10T10:00:00Z",
        updated_at: "2024-05-10T10:00:00Z"
      }
    ],
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-05-15T00:00:00Z"
  },
  {
    id: "6",
    organizer_id: "2",
    title: "數位行銷與社群媒體大會 2025",
    description: "一場專為數位行銷人員、內容創作者和社群媒體專家設計的盛會，探討最新趨勢、最佳實踐和創新策略。",
    cover_image: "https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-07-08T09:30:00Z",
    end_time: "2025-07-10T17:30:00Z",
    location: {
      id: "loc6",
      name: "新加坡濱海灣金沙會議中心",
      address: "10 Bayfront Avenue",
      city: "新加坡",
      country: "新加坡",
      postal_code: "018956",
      latitude: 1.2823,
      longitude: 103.8588,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJ64jbrMkZ2jERN_GRBObskXI",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Marketing",
    tags: ["數位行銷", "社群媒體", "內容創作", "品牌建設", "影響力行銷"],
    sponsorship_plans: [
      {
        id: "sp601",
        event_id: "6",
        title: "數位領袖",
        description: "成為大會的主要贊助商，向行業專業人士展示您的品牌和解決方案",
        price: 55000,
        benefits: [
          "主題演講機會",
          "品牌在所有活動材料上顯示",
          "專屬工作坊主持",
          "VIP招待會",
          "與會者名單"
        ],
        max_sponsors: 2,
        current_sponsors: 1,
        created_at: "2024-05-20T08:00:00Z",
        updated_at: "2024-05-20T08:00:00Z"
      },
      {
        id: "sp602",
        event_id: "6",
        title: "社群夥伴",
        description: "展示您的社群媒體和內容平台，接觸目標受眾",
        price: 35000,
        benefits: [
          "展示攤位",
          "品牌在數位資料中展示",
          "參與圓桌討論"
        ],
        max_sponsors: 6,
        current_sponsors: 3,
        created_at: "2024-05-20T09:00:00Z",
        updated_at: "2024-05-20T09:00:00Z"
      }
    ],
    created_at: "2024-05-05T00:00:00Z",
    updated_at: "2024-05-25T00:00:00Z"
  },
  {
    id: "7",
    organizer_id: "1",
    title: "Web3 與區塊鏈高峰會 2025",
    description: "探索區塊鏈技術、加密貨幣、NFT和去中心化金融的未來。與行業先驅、開發者和投資者交流，發現下一代網路的無限可能。",
    cover_image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-11-03T09:00:00Z",
    end_time: "2025-11-05T18:00:00Z",
    location: {
      id: "loc7",
      name: "香港會議展覽中心",
      address: "香港灣仔博覽道1號",
      city: "香港",
      country: "中國香港",
      postal_code: "",
      latitude: 22.2813,
      longitude: 114.1694,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJyx53KxMABDQRvCyYKrDFPY0",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Technology",
    tags: ["區塊鏈", "加密貨幣", "Web3", "DeFi", "元宇宙", "NFT"],
    sponsorship_plans: [
      {
        id: "sp701",
        event_id: "7",
        title: "區塊鏈先驅",
        description: "以行業領導者的身份支持高峰會，展示您的前沿技術和解決方案",
        price: 100000,
        benefits: [
          "主題演講機會",
          "專屬展示區",
          "投資者對接會議",
          "品牌在所有宣傳材料中顯示",
          "專訪機會"
        ],
        max_sponsors: 3,
        current_sponsors: 1,
        created_at: "2024-07-01T08:00:00Z",
        updated_at: "2024-07-01T08:00:00Z"
      },
      {
        id: "sp702",
        event_id: "7",
        title: "Web3 創新者",
        description: "展示您的去中心化應用和服務，連接潛在用戶和投資者",
        price: 65000,
        benefits: [
          "技術演示時段",
          "產品展示區",
          "專家討論參與",
          "品牌在數位平台上展示"
        ],
        max_sponsors: 5,
        current_sponsors: 2,
        created_at: "2024-07-01T09:00:00Z",
        updated_at: "2024-07-01T09:00:00Z"
      }
    ],
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-15T00:00:00Z"
  },
  {
    id: "8",
    organizer_id: "2",
    title: "全球教育創新博覽會 2025",
    description: "匯聚教育者、技術專家和政策制定者，探討教育的未來趨勢和創新方法，推動教育改革和技術整合。",
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-08-15T09:00:00Z",
    end_time: "2025-08-17T17:00:00Z",
    location: {
      id: "loc8",
      name: "首爾COEX會議中心",
      address: "首爾市江南區三成洞159",
      city: "首爾",
      country: "韓國",
      postal_code: "06164",
      latitude: 37.5118,
      longitude: 127.0592,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJj-lZbx6kfDURMU9Ip-Vkj3Q",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Education",
    tags: ["教育科技", "遠程學習", "STEM教育", "教育創新", "教育政策"],
    sponsorship_plans: [
      {
        id: "sp801",
        event_id: "8",
        title: "教育夥伴",
        description: "支持教育創新，展示您的學習解決方案和平台",
        price: 40000,
        benefits: [
          "專題演講機會",
          "教育工作坊主持",
          "品牌在活動材料中展示",
          "與教育決策者的專屬會議"
        ],
        max_sponsors: 4,
        current_sponsors: 2,
        created_at: "2024-06-15T10:00:00Z",
        updated_at: "2024-06-15T10:00:00Z"
      },
      {
        id: "sp802",
        event_id: "8",
        title: "創新學習",
        description: "展示您的教育科技產品和解決方案，接觸教育工作者和學校代表",
        price: 25000,
        benefits: [
          "展示區域",
          "產品演示時段",
          "品牌在數位資料中顯示"
        ],
        max_sponsors: 8,
        current_sponsors: 5,
        created_at: "2024-06-15T11:00:00Z",
        updated_at: "2024-06-15T11:00:00Z"
      }
    ],
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-20T00:00:00Z"
  },
  {
    id: "loc-google",
    organizer_id: "1",
    title: "Location Google",
    description: "这个活动演示使用 Google 地址作为地点。展示如何利用 Google Maps 的地点 ID 和经纬度数据。",
    cover_image: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-10-10T10:00:00Z",
    end_time: "2025-10-12T18:00:00Z",
    location: {
      id: "loc-g",
      name: "台北 101",
      address: "台灣台北市信義區信義路五段7號",
      city: "台北市",
      country: "台灣",
      postal_code: "110",
      latitude: 25.0339,
      longitude: 121.5645,
      isVirtual: false,
      platformName: "",
      place_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
      location_type: LocationType.GOOGLE
    },
    status: EventStatus.PUBLISHED,
    category: "Technology",
    tags: ["活动举例", "地理位置", "Google Maps"],
    sponsorship_plans: [
      {
        id: "sp-g1",
        event_id: "loc-google",
        title: "地点演示赞助",
        description: "支持此演示活动并展示您的品牌",
        price: 20000,
        benefits: [
          "品牌展示",
          "产品演示",
          "网站链接"
        ],
        max_sponsors: 5,
        current_sponsors: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    ],
    created_at: "2025-05-01T00:00:00Z",
    updated_at: "2025-05-01T00:00:00Z"
  },
  {
    id: "loc-virtual",
    organizer_id: "2",
    title: "Location Virtual",
    description: "这个活动演示使用虚拟线上会议作为地点。展示如何使用平台名称和会议链接。",
    cover_image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-11-15T14:00:00Z",
    end_time: "2025-11-15T18:00:00Z",
    location: {
      id: "loc-v",
      name: "Zoom 线上会议",
      address: "https://zoom.us/j/123456789",
      city: "",
      country: "",
      postal_code: "",
      latitude: undefined,
      longitude: undefined,
      isVirtual: true,
      platformName: "Zoom",
      place_id: undefined,
      location_type: LocationType.VIRTUAL
    },
    status: EventStatus.PUBLISHED,
    category: "Online",
    tags: ["线上活动", "虚拟会议", "远程参与"],
    sponsorship_plans: [
      {
        id: "sp-v1",
        event_id: "loc-virtual",
        title: "虚拟赞助",
        description: "在线上活动中展示您的品牌",
        price: 15000,
        benefits: [
          "数字展示区",
          "线上演讲",
          "品牌露出"
        ],
        max_sponsors: 10,
        current_sponsors: 2,
        created_at: "2025-06-01T10:00:00Z",
        updated_at: "2025-06-01T10:00:00Z"
      }
    ],
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z"
  },
  {
    id: "loc-custom",
    organizer_id: "3",
    title: "Location Custom",
    description: "这个活动演示使用自定义地址作为地点。展示如何处理没有经纬度和地点ID的自定义位置。",
    cover_image: "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2025-12-20T16:00:00Z",
    end_time: "2025-12-20T22:00:00Z",
    location: {
      id: "loc-c",
      name: "地址測試地址測試地址測試試",
      address: "區塊大廈3樓藝術空間",
      city: "台中",
      country: "台灣",
      postal_code: "",
      latitude: undefined,
      longitude: undefined,
      isVirtual: false,
      platformName: "",
      place_id: undefined,
      location_type: LocationType.CUSTOM
    },
    status: EventStatus.PUBLISHED,
    category: "Art",
    tags: ["艺术活动", "自定义地点", "社区活动"],
    sponsorship_plans: [
      {
        id: "sp-c1",
        event_id: "loc-custom",
        title: "艺术赞助",
        description: "支持艺术活动并展示您的品牌",
        price: 10000,
        benefits: [
          "展示区域",
          "品牌展示",
          "艺术家交流"
        ],
        max_sponsors: 8,
        current_sponsors: 3,
        created_at: "2025-07-01T09:00:00Z",
        updated_at: "2025-07-01T09:00:00Z"
      }
    ],
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-07-01T00:00:00Z"
  }
]; 