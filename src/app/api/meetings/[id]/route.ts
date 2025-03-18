import { NextRequest, NextResponse } from 'next/server';
import { getSponsorMeetings } from '@/lib/services/sponsorService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 获取URL参数
    const params = await context.params;
    const id = params.id;
    
    // 获取赞助商的所有会议
    const meetings = await getSponsorMeetings(id);
    
    if (!meetings || meetings.length === 0) {
      return NextResponse.json(
        { error: '找不到會議' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('獲取會議時出錯:', error);
    return NextResponse.json(
      { error: '獲取會議時出錯' },
      { status: 500 }
    );
  }
} 