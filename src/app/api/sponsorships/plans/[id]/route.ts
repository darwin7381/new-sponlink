import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SPONSORSHIP_PLANS } from '@/lib/mocks/sponsorships';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 在 Next.js 15 中，需要先等待 params 對象
  const { id } = await params;
  
  try {
    // 使用已經等待過的 id
    const plan = MOCK_SPONSORSHIP_PLANS.find(plan => plan.id === id);
    
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