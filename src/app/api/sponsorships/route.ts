import { NextRequest, NextResponse } from 'next/server';
import { getSponsorships } from '@/lib/services/sponsorService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('sponsorId');
    
    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 });
    }
    
    const sponsorships = await getSponsorships(sponsorId);
    return NextResponse.json(sponsorships);
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsorships' }, { status: 500 });
  }
} 