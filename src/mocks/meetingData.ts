import { Meeting, MeetingStatus, CartItem, CartItemStatus } from '@/types/meeting';

export const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    sponsor_id: "1",
    organizer_id: "2",
    event_id: "2",
    title: "Global Marketing Conference Sponsorship Discussion",
    description: "Initial meeting to discuss sponsorship opportunities for the Global Marketing Conference.",
    proposed_times: [
      "2025-07-01T10:00:00Z",
      "2025-07-02T14:00:00Z",
      "2025-07-03T09:00:00Z"
    ],
    confirmed_time: "2025-07-02T14:00:00Z",
    status: MeetingStatus.CONFIRMED,
    meeting_link: "https://meet.google.com/abc-defg-hij",
    created_at: "2025-06-15T08:30:00Z",
    updated_at: "2025-06-16T11:45:00Z"
  },
  {
    id: "meeting-2",
    sponsor_id: "1",
    organizer_id: "2",
    event_id: "1",
    title: "Tech Innovation Summit Sponsorship Inquiry",
    description: "Discussion about Gold sponsorship package for the Tech Innovation Summit.",
    proposed_times: [
      "2025-05-20T11:00:00Z",
      "2025-05-21T15:30:00Z",
      "2025-05-22T13:00:00Z"
    ],
    confirmed_time: null,
    status: MeetingStatus.REQUESTED,
    meeting_link: null,
    created_at: "2025-05-15T09:20:00Z",
    updated_at: "2025-05-15T09:20:00Z"
  },
  {
    id: "meeting-3",
    sponsor_id: "1",
    organizer_id: "3",
    event_id: "3",
    title: "AI Conference 2025 Sponsorship Options",
    description: "Exploring platinum sponsorship opportunities for the AI Conference 2025.",
    proposed_times: [
      "2025-04-10T09:00:00Z",
      "2025-04-11T14:30:00Z",
      "2025-04-12T11:00:00Z"
    ],
    confirmed_time: "2025-04-11T14:30:00Z",
    status: MeetingStatus.CONFIRMED,
    meeting_link: "https://zoom.us/j/12345678",
    created_at: "2025-03-25T10:45:00Z",
    updated_at: "2025-03-27T16:30:00Z"
  },
  {
    id: "meeting-4",
    sponsor_id: "2",
    organizer_id: "1",
    event_id: "1",
    title: "Tech Innovation Summit - Booth Layout Discussion",
    description: "Meeting to discuss booth placement and layout for the Tech Innovation Summit.",
    proposed_times: [
      "2025-05-22T10:00:00Z",
      "2025-05-23T15:00:00Z",
      "2025-05-24T13:30:00Z"
    ],
    confirmed_time: "2025-05-23T15:00:00Z",
    status: MeetingStatus.CONFIRMED,
    meeting_link: "https://meet.google.com/xyz-abcd-efg",
    created_at: "2025-05-10T14:20:00Z",
    updated_at: "2025-05-11T09:15:00Z"
  },
  {
    id: "meeting-5",
    sponsor_id: "1",
    organizer_id: "4",
    event_id: "4",
    title: "Design Summit - Sponsorship Package Review",
    description: "Discussion about available sponsorship tiers and benefits for the Design Summit.",
    proposed_times: [
      "2025-06-05T09:30:00Z",
      "2025-06-06T11:00:00Z",
      "2025-06-07T14:00:00Z"
    ],
    confirmed_time: null,
    status: MeetingStatus.REQUESTED,
    meeting_link: null,
    created_at: "2025-05-20T16:40:00Z",
    updated_at: "2025-05-20T16:40:00Z"
  },
  {
    id: "meeting-6",
    sponsor_id: "3",
    organizer_id: "1",
    event_id: "2",
    title: "Global Marketing Conference - Brand Visibility Options",
    description: "Exploring various branding opportunities at the Global Marketing Conference.",
    proposed_times: [
      "2025-06-10T13:00:00Z",
      "2025-06-11T15:30:00Z",
      "2025-06-12T10:00:00Z"
    ],
    confirmed_time: "2025-06-11T15:30:00Z",
    status: MeetingStatus.COMPLETED,
    meeting_link: "https://teams.microsoft.com/l/meetup-join/19%3ameeting",
    created_at: "2025-05-25T11:20:00Z",
    updated_at: "2025-06-12T17:00:00Z"
  },
  {
    id: "meeting-7",
    sponsor_id: "1",
    organizer_id: "5",
    event_id: "5",
    title: "Healthcare Innovation Forum - Sponsorship Discussion",
    description: "Initial meeting to explore sponsorship opportunities for the Healthcare Innovation Forum.",
    proposed_times: [
      "2025-07-15T09:00:00Z",
      "2025-07-16T11:30:00Z",
      "2025-07-17T14:00:00Z"
    ],
    confirmed_time: null,
    status: MeetingStatus.CANCELLED,
    meeting_link: null,
    created_at: "2025-06-20T10:15:00Z",
    updated_at: "2025-06-22T08:45:00Z"
  },
  {
    id: "meeting-8",
    sponsor_id: "2",
    organizer_id: "3",
    event_id: "3",
    title: "AI Conference 2025 - Exhibition Details",
    description: "Discussion about exhibition space details and technical requirements.",
    proposed_times: [
      "2025-04-20T10:30:00Z",
      "2025-04-21T13:00:00Z",
      "2025-04-22T15:30:00Z"
    ],
    confirmed_time: "2025-04-21T13:00:00Z",
    status: MeetingStatus.CONFIRMED,
    meeting_link: "https://zoom.us/j/87654321",
    created_at: "2025-04-05T09:50:00Z",
    updated_at: "2025-04-06T14:20:00Z"
  },
  {
    id: "meeting-9",
    sponsor_id: "1",
    organizer_id: "6",
    event_id: "6",
    title: "Sustainable Business Conference - Partnership Options",
    description: "Exploring strategic partnership opportunities for the Sustainable Business Conference.",
    proposed_times: [
      "2025-08-05T09:00:00Z",
      "2025-08-06T14:30:00Z",
      "2025-08-07T11:00:00Z"
    ],
    confirmed_time: null,
    status: MeetingStatus.REQUESTED,
    meeting_link: null,
    created_at: "2025-07-15T13:40:00Z",
    updated_at: "2025-07-15T13:40:00Z"
  },
  {
    id: "meeting-10",
    sponsor_id: "3",
    organizer_id: "2",
    event_id: "1",
    title: "Tech Innovation Summit - Social Media Promotion",
    description: "Discussion about collaborative social media promotion for the event.",
    proposed_times: [
      "2025-05-18T10:00:00Z",
      "2025-05-19T13:30:00Z",
      "2025-05-20T16:00:00Z"
    ],
    confirmed_time: "2025-05-19T13:30:00Z",
    status: MeetingStatus.COMPLETED,
    meeting_link: "https://meet.google.com/pqr-stuv-wxy",
    created_at: "2025-05-05T15:10:00Z",
    updated_at: "2025-05-20T17:30:00Z"
  }
];

export const mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-1",
    status: CartItemStatus.PENDING,
    created_at: "2025-06-01T10:30:00Z",
    updated_at: "2025-06-01T10:30:00Z"
  },
  {
    id: "cart-2",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-2",
    status: CartItemStatus.PENDING,
    created_at: "2025-06-02T14:45:00Z",
    updated_at: "2025-06-02T14:45:00Z"
  },
  {
    id: "cart-3",
    sponsor_id: "2",
    sponsorship_plan_id: "plan-3",
    status: CartItemStatus.PENDING,
    created_at: "2025-06-03T09:15:00Z",
    updated_at: "2025-06-03T09:15:00Z"
  },
  {
    id: "cart-4",
    sponsor_id: "3",
    sponsorship_plan_id: "plan-4",
    status: CartItemStatus.CHECKOUT,
    created_at: "2025-06-04T11:20:00Z",
    updated_at: "2025-06-05T16:30:00Z"
  },
  {
    id: "cart-5",
    sponsor_id: "1",
    sponsorship_plan_id: "plan-5",
    status: CartItemStatus.CONFIRMED,
    created_at: "2025-05-20T13:40:00Z",
    updated_at: "2025-05-21T10:15:00Z"
  }
]; 