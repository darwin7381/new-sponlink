import { NextRequest, NextResponse } from 'next/server';
import { getSponsorMeetings } from '@/lib/services/sponsorService';
import { mockMeetings } from '@/mocks/sponsorData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 正確處理 Next.js 15.2.3 中的路由參數
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // 根據ID查找會議
    const meeting = mockMeetings.find(meeting => meeting.id === id);
    
    if (!meeting) {
      return NextResponse.json(
        { error: '找不到會議' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('獲取會議時出錯:', error);
    return NextResponse.json(
      { error: '獲取會議時出錯' },
      { status: 500 }
    );
  }
} 