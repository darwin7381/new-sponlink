import { NextRequest, NextResponse } from 'next/server';
import { getSponsorships } from '@/lib/services/sponsorService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 正確使用 await 來解決 Next.js 的警告
    const id = await Promise.resolve(params.id);
    
    // 獲取贊助商的所有贊助
    const sponsorships = await getSponsorships(id);
    
    if (!sponsorships || sponsorships.length === 0) {
      return NextResponse.json(
        { error: '找不到贊助' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sponsorships);
  } catch (error) {
    console.error('獲取贊助時出錯:', error);
    return NextResponse.json(
      { error: '獲取贊助時出錯' },
      { status: 500 }
    );
  }
} 