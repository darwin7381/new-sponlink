import { Meeting, MEETING_STATUS } from '../types/users';

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meeting-1',
    sponsor_id: '1',
    organizer_id: '2',
    event_id: '1',
    title: '贊助討論會議',
    description: '討論黃金贊助方案的細節和合作可能性',
    status: MEETING_STATUS.CONFIRMED,
    proposed_times: [
      '2024-04-10T10:00:00Z',
      '2024-04-11T14:00:00Z',
      '2024-04-12T09:00:00Z'
    ],
    confirmed_time: '2024-04-11T14:00:00Z',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    created_at: '2024-03-05T08:30:00Z',
    updated_at: '2024-03-06T15:45:00Z'
  },
  {
    id: 'meeting-2',
    sponsor_id: '1',
    organizer_id: '2',
    event_id: '3',
    title: '品牌曝光討論',
    description: '討論如何在活動中最大化品牌曝光效果',
    status: MEETING_STATUS.REQUESTED,
    proposed_times: [
      '2024-04-15T11:00:00Z',
      '2024-04-16T13:00:00Z',
      '2024-04-17T10:00:00Z'
    ],
    confirmed_time: null,
    meeting_link: null,
    created_at: '2024-03-08T09:20:00Z',
    updated_at: '2024-03-08T09:20:00Z'
  },
  {
    id: 'meeting-3',
    sponsor_id: '1',
    organizer_id: '2',
    event_id: '2',
    title: '贊助合作洽談',
    description: '討論白金贊助方案的權益與回報',
    status: MEETING_STATUS.CANCELLED,
    proposed_times: [
      '2024-04-05T09:00:00Z',
      '2024-04-06T14:00:00Z',
      '2024-04-07T11:00:00Z'
    ],
    confirmed_time: '2024-04-06T14:00:00Z',
    meeting_link: 'https://meet.google.com/xyz-abcd-efg',
    created_at: '2024-03-01T10:15:00Z',
    updated_at: '2024-03-04T16:30:00Z'
  },
  {
    id: 'meeting-4',
    sponsor_id: '1',
    organizer_id: '2',
    event_id: '1',
    title: '客製化贊助方案討論',
    description: '討論特殊贊助需求和客製化方案可能性',
    status: MEETING_STATUS.CONFIRMED,
    proposed_times: [
      '2024-04-18T13:00:00Z',
      '2024-04-19T10:00:00Z',
      '2024-04-20T15:00:00Z'
    ],
    confirmed_time: '2024-04-19T10:00:00Z',
    meeting_link: 'https://meet.google.com/lmn-opqr-stu',
    created_at: '2024-03-10T11:45:00Z',
    updated_at: '2024-03-12T09:20:00Z'
  },
  {
    id: 'meeting-5',
    sponsor_id: '1',
    organizer_id: '2',
    event_id: '2',
    title: '贊助後續合作討論',
    description: '討論活動結束後的合作延續可能性',
    status: MEETING_STATUS.REQUESTED,
    proposed_times: [
      '2024-05-10T09:00:00Z',
      '2024-05-11T14:00:00Z',
      '2024-05-12T11:00:00Z'
    ],
    confirmed_time: null,
    meeting_link: null,
    created_at: '2024-03-15T13:30:00Z',
    updated_at: '2024-03-15T13:30:00Z'
  }
]; 