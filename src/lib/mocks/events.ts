import { Event, EventStatus } from '../../types/event';

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Tech Innovation Summit 2025",
    description: "Join industry leaders to explore cutting-edge technologies and innovations that are shaping our future. Connect with visionaries, entrepreneurs, and researchers who are at the forefront of technological advancement.",
    start_time: "2025-06-15T09:00:00Z",
    end_time: "2025-06-17T17:00:00Z",
    location: {
      id: "loc1",
      name: "San Francisco Convention Center",
      address: "123 Tech Blvd, San Francisco, CA 94101",
      city: "San Francisco",
      country: "USA",
      postal_code: "94101",
      latitude: 37.7749,
      longitude: -122.4194
    },
    organizer_id: "2",
    sponsor_ids: [],
    status: EventStatus.PUBLISHED,
    cover_image: "/images/tech-summit.jpg",
    deck_url: "/decks/tech-summit-deck.pdf",
    category: "Technology",
    tags: ["Innovation", "Tech", "Summit"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    sponsorship_plans: [
      {
        id: "101",
        event_id: "1",
        title: "Bronze Sponsor",
        price: 1500,
        description: "Basic visibility at the event with your logo on our website and event materials.",
        benefits: ["Logo on event website", "Logo on event materials", "1 free ticket"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
      {
        id: "102",
        event_id: "1",
        title: "Silver Sponsor",
        price: 3000,
        description: "Enhanced visibility with a small booth and logo placement on prominent locations.",
        benefits: ["Everything in Bronze", "Small exhibition booth", "2 free tickets", "Social media mentions"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
      {
        id: "103",
        event_id: "1",
        title: "Gold Sponsor",
        price: 7500,
        description: "Premium visibility with a large booth, speaking opportunity, and prominent branding.",
        benefits: ["Everything in Silver", "Large exhibition booth", "5 free tickets", "Speaking opportunity", "Prominent logo placement"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
    ]
  },
  {
    id: "2",
    title: "Global Marketing Conference",
    description: "Connect with marketing professionals and discover the latest trends in digital marketing, brand strategy, and customer engagement. Learn from industry experts about what's working now.",
    start_time: "2025-07-22T10:00:00Z",
    end_time: "2025-07-24T16:00:00Z",
    location: {
      id: "loc2",
      name: "New York Marriott Marquis",
      address: "1535 Broadway, New York, NY 10036",
      city: "New York",
      country: "USA",
      postal_code: "10036",
      latitude: 40.7589,
      longitude: -73.9851
    },
    organizer_id: "2",
    sponsor_ids: ["1"],
    status: EventStatus.PUBLISHED,
    cover_image: "/images/marketing-conf.jpg",
    deck_url: "/decks/marketing-conf-deck.pdf",
    category: "Marketing",
    tags: ["Digital", "Branding", "Conference"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    sponsorship_plans: [
      {
        id: "201",
        event_id: "2",
        title: "Basic Sponsor",
        price: 2000,
        description: "Basic branding package with logo placement on event materials.",
        benefits: ["Logo on event website", "Logo on event materials", "2 free tickets"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
      {
        id: "202",
        event_id: "2",
        title: "Premium Sponsor",
        price: 5000,
        description: "Enhanced visibility with booth space and speaking opportunity.",
        benefits: ["Everything in Basic", "Exhibition booth", "5 free tickets", "30-min speaking slot"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
    ]
  },
  {
    id: "3",
    title: "Sustainable Business Forum",
    description: "Learn how businesses are implementing sustainable practices for a better future. Explore strategies for reducing environmental impact while driving business growth.",
    start_time: "2025-08-10T09:30:00Z",
    end_time: "2025-08-11T17:30:00Z",
    location: {
      id: "loc3",
      name: "Seattle Convention Center",
      address: "705 Pike St, Seattle, WA 98101",
      city: "Seattle",
      country: "USA",
      postal_code: "98101",
      latitude: 47.6114,
      longitude: -122.3322
    },
    organizer_id: "2",
    sponsor_ids: [],
    status: EventStatus.PUBLISHED,
    cover_image: "/images/sustainability-forum.jpg",
    deck_url: "/decks/sustainability-forum-deck.pdf",
    category: "Sustainability",
    tags: ["ESG", "Green Business", "Environment"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    sponsorship_plans: [
      {
        id: "301",
        event_id: "3",
        title: "Green Supporter",
        price: 1000,
        description: "Support sustainable business practices with basic recognition at the event.",
        benefits: ["Logo on event website", "Recognition during opening ceremony", "1 free ticket"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
      {
        id: "302",
        event_id: "3",
        title: "Sustainability Partner",
        price: 3500,
        description: "Demonstrate your commitment to sustainability with enhanced visibility.",
        benefits: ["Everything in Green Supporter", "Exhibition booth", "3 free tickets", "Panel participation"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
      {
        id: "303",
        event_id: "3",
        title: "Eco Champion",
        price: 8000,
        description: "Position your brand as a leader in sustainability with premium exposure.",
        benefits: ["Everything in Sustainability Partner", "Keynote speaking opportunity", "Sponsored workshop", "6 free tickets", "Featured case study"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z"
      },
    ]
  }
]; 