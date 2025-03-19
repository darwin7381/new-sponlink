import { Event, EventStatus } from '@/types/event';

export const mockEvents: Event[] = [
  {
    id: "1",
    organizer_id: "2",
    title: "Tech Innovation Summit 2023",
    description: "An annual gathering of global technology leaders and innovators to explore the latest technology trends and future development directions.",
    cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2023-06-15T09:00:00Z",
    end_time: "2023-06-17T18:00:00Z",
    location: {
      id: "loc1",
      name: "Taipei International Convention Center",
      address: "No. 1, Section 5, Xinyi Road",
      city: "Taipei",
      country: "Taiwan",
      postal_code: "110",
      latitude: 25.033976,
      longitude: 121.560486
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
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-02-20T14:30:00Z"
  },
  {
    id: "2",
    organizer_id: "2",
    title: "Sustainable Development Forum",
    description: "An international forum discussing environmental protection, social responsibility, and sustainable economic development.",
    cover_image: "https://images.unsplash.com/photo-1569851935018-9c7bbd95f0fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2023-09-10T09:00:00Z",
    end_time: "2023-09-12T17:00:00Z",
    location: {
      id: "loc2",
      name: "Kaohsiung Exhibition Center",
      address: "No. 39, Chenggong 2nd Road",
      city: "Kaohsiung",
      country: "Taiwan",
      postal_code: "806",
      latitude: 22.595818,
      longitude: 120.306529
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
    created_at: "2023-03-01T11:20:00Z",
    updated_at: "2023-03-10T16:45:00Z"
  },
  {
    id: "3",
    organizer_id: "2",
    title: "Digital Marketing Conference",
    description: "A professional conference focused on the latest digital marketing trends, strategies, and tools.",
    cover_image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80",
    start_time: "2023-11-20T09:30:00Z",
    end_time: "2023-11-21T17:30:00Z",
    location: {
      id: "loc3",
      name: "Taichung Splendor Hotel",
      address: "No. 1049, Jianxing Road",
      city: "Taichung",
      country: "Taiwan",
      postal_code: "403",
      latitude: 24.148141,
      longitude: 120.663986
    },
    status: EventStatus.COMPLETED,
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
    created_at: "2023-05-01T09:00:00Z",
    updated_at: "2023-05-15T14:20:00Z"
  }
]; 