import { Meeting as LibMeeting, MEETING_STATUS } from './types/users';
import { Meeting as ApiMeeting, MeetingStatus } from '@/types/meeting';
import { Event as LibEvent } from './types/events';
import { Event as ApiEvent } from '@/types/event';

/**
 * 類型轉換適配器
 * 處理不同模塊間的類型轉換
 */

// 將API的單個Event轉換為Lib的Event
export function adaptNewEventToOld(apiEvent: ApiEvent): LibEvent {
  return apiEvent as unknown as LibEvent;
}

// 將API的Event列表轉換為Lib的Event列表
export function adaptNewEventsToOld(apiEvents: ApiEvent[]): LibEvent[] {
  return apiEvents.map(event => adaptNewEventToOld(event));
}

// 將API中的Meeting類型轉換為lib中的Meeting類型
export const adaptApiMeetingsToLib = (meetings: ApiMeeting[]): LibMeeting[] => {
  return meetings.map(meeting => ({
    ...meeting,
    status: mapMeetingStatus(meeting.status)
  }));
};

// 映射會議狀態
function mapMeetingStatus(status: MeetingStatus): MEETING_STATUS {
  switch (status) {
    case MeetingStatus.REQUESTED:
      return MEETING_STATUS.REQUESTED;
    case MeetingStatus.CONFIRMED:
      return MEETING_STATUS.CONFIRMED;
    case MeetingStatus.CANCELLED:
      return MEETING_STATUS.CANCELLED;
    case MeetingStatus.COMPLETED:
      // 由於lib中沒有COMPLETED狀態，將其映射為CONFIRMED
      return MEETING_STATUS.CONFIRMED;
    default:
      return MEETING_STATUS.REQUESTED;
  }
} 