import { NextRequest, NextResponse } from 'next/server';
import { getSponsorMeetings } from '@/lib/services/sponsorService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 正確使用 await 來解決 Next.js 的警告
    const id = await Promise.resolve(params.id);
    
    // 獲取贊助商的所有會議
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