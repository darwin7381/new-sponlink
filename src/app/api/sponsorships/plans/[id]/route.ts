import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 獲取 URL 參數
    const params = await context.params;
    const id = params.id;
    
    // 查找贊助計劃
    const plan = mockSponsorshipPlans.find(plan => plan.id === id);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Sponsorship plan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching sponsorship plan:', error);
    return NextResponse.json(
      { error: 'Error fetching sponsorship plan' },
      { status: 500 }
    );
  }
} 