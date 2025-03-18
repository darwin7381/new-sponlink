import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/services/eventService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 正確使用 await 來解決 Next.js 的警告
    const id = await Promise.resolve(params.id);
    
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