import { NextRequest, NextResponse } from 'next/server';
import { mockEvents } from '@/mocks/eventData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 正確處理 Next.js 15.2.3 中的路由參數
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // 根據ID查找活動
    const event = mockEvents.find(event => event.id === id);
    
    if (!event) {
      return NextResponse.json(
        { error: '找不到活動' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('獲取活動時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動時出錯' },
      { status: 500 }
    );
  }
} 