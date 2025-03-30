import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 獲取URL參數
    const id = params.id;
    
    // 根據ID查找贊助計劃
    const sponsorshipPlan = mockSponsorshipPlans.find(plan => plan.id === id);
    
    if (!sponsorshipPlan) {
      return NextResponse.json(
        { error: '找不到贊助計劃' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sponsorshipPlan);
  } catch (error) {
    console.error('獲取贊助計劃時出錯:', error);
    return NextResponse.json(
      { error: '獲取贊助計劃時出錯' },
      { status: 500 }
    );
  }
} 