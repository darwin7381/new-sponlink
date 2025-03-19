import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/services/eventService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 獲取 URL 參數
    const params = await context.params;
    const id = params.id;
    
    // 獲取事件詳情
    const event = await getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: '找不到事件' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('獲取事件時出錯:', error);
    return NextResponse.json(
      { error: '獲取事件時出錯' },
      { status: 500 }
    );
  }
} 