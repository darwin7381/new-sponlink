import { Meeting as LibMeeting, MEETING_STATUS } from './types/users';
import { Meeting as ApiMeeting, MeetingStatus } from '@/types/meeting';

/**
 * 類型轉換適配器
 * 處理不同模塊間的類型轉換
 */

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