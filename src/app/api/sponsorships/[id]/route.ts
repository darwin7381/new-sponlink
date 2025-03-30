import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取URL参数
    const id = params.id;
    
    // 根据ID查找赞助计划
    const sponsorshipPlan = mockSponsorshipPlans.find(plan => plan.id === id);
    
    if (!sponsorshipPlan) {
      return NextResponse.json(
        { error: '找不到赞助计划' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sponsorshipPlan);
  } catch (error) {
    console.error('获取赞助计划时出错:', error);
    return NextResponse.json(
      { error: '获取赞助计划时出错' },
      { status: 500 }
    );
  }
} 