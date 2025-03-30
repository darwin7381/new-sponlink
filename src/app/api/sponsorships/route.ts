import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    // 如果指定了事件ID，只返回該事件的贊助計劃
    if (eventId) {
      const eventPlans = mockSponsorshipPlans.filter(plan => plan.event_id === eventId);
      return NextResponse.json(eventPlans);
    }
    
    // 否則返回所有贊助計劃
    return NextResponse.json(mockSponsorshipPlans);
  } catch (error) {
    console.error('獲取贊助計劃時出錯:', error);
    return NextResponse.json(
      { error: '獲取贊助計劃時出錯' },
      { status: 500 }
    );
  }
} 